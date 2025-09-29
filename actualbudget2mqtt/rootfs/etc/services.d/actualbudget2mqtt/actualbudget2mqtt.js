// index.js
const api = require("@actual-app/api");
const mqtt = require("mqtt");
const fs = require("fs");

const configPath = "/data/options.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

// ---- Konfiguration & Defaults ----
const POLL_INTERVAL_MS = Number(config.poll_interval_ms ?? 60_000);
const ENC_PASSWORD = config.actual_budget_password || config.actual_password; // gleiches PW erlaubt
const SYNC_ID = config.actual_sync_id;

// Discovery
const DISCOVERY_ENABLED = config.discovery_enabled !== false; // default: true
const DISCOVERY_PREFIX = config.discovery_prefix || "homeassistant";
const DEVICE_NAME = config.device_name || "Actual Budget";
const DEVICE_ID = (config.device_id || `actual_${SYNC_ID}`).replace(/[^\w\-]/g, "_");
const CURRENCY = config.currency_symbol || "€";

// MQTT-URL bauen (falls keine mqtt_url angegeben ist)
const mqttUrl =
  config.mqtt_url ||
  `${config.mqtt_tls ? "mqtts" : "mqtt"}://${config.mqtt_host}:${config.mqtt_port}`;

// Topic-Helfer
const slug = (name) =>
  String(name).trim().replace(/\s+/g, "_").replace(/[^\w\-./]/g, "");

// Availability Topic
const AVAILABILITY_TOPIC = config.availability_topic || "actualbudget/status";

// Maps/Sets für Dedupe
const lastPayloadByCategoryId = new Map();
const discoveryPublishedFor = new Set();

let intervalHandle;
let client;

function getMonthString() {
  const m = config.actual_month;
  if (m && /^\d{4}-\d{2}$/.test(m)) return m;
  return new Date().toISOString().slice(0, 7);
}

async function initActual() {
  await api.init({
    dataDir: "/data/cache",
    serverURL: config.actual_url,
    password: config.actual_password, // Server-Login
  });

  // E2E-verschlüsseltes Budget mit Datei-Passwort öffnen
  await api.downloadBudget(SYNC_ID, { password: ENC_PASSWORD });
}

function initMqtt() {
  client = mqtt.connect(mqttUrl, {
    username: config.mqtt_user,
    password: config.mqtt_password,
    will: {
      topic: AVAILABILITY_TOPIC,
      payload: "offline",
      retain: true,
      qos: 1,
    },
    rejectUnauthorized: config.mqtt_tls_reject_unauthorized !== false,
  });

  client.on("connect", async () => {
    console.log("[MQTT] Connected:", mqttUrl);
    client.publish(AVAILABILITY_TOPIC, "online", { retain: true, qos: 1 });

    try {
      await fetchAndPublish();
    } catch (e) {
      console.error("[ERROR] Initial fetch failed:", e);
    }

    intervalHandle = setInterval(async () => {
      try {
        await fetchAndPublish();
      } catch (e) {
        console.error("[ERROR] Periodic fetch failed:", e);
      }
    }, POLL_INTERVAL_MS);
  });

  client.on("reconnect", () => console.log("[MQTT] Reconnecting…"));
  client.on("error", (err) => console.error("[MQTT] Error:", err));
  client.on("close", () => console.log("[MQTT] Connection closed"));
}

async function ensureDiscovery(budget) {
  if (!DISCOVERY_ENABLED) return;

  for (const category of budget.categories) {
    const objectId = `${slug(category.name)}_budgeted`;
    const uniqueId = `${DEVICE_ID}_${category.id}_budgeted`;
    const configTopic = `${DISCOVERY_PREFIX}/sensor/${DEVICE_ID}/${objectId}/config`;

    if (discoveryPublishedFor.has(uniqueId)) continue;

    const discoveryPayload = {
      name: `Budget: ${category.name}`,
      unique_id: uniqueId, // nötig, damit device-Block registriert wird
      state_topic: `actualbudget/${slug(category.name)}`,
      // JSON -> budgeted (Minor-Units) in Hauptwährung umrechnen
      value_template: "{{ (value_json.budgeted | float / 100) | round(2) }}",
      unit_of_measurement: CURRENCY,
      // Optional hübsches Icon
      icon: "mdi:currency-eur",
      availability_topic: AVAILABILITY_TOPIC,
      payload_available: "online",
      payload_not_available: "offline",
      // Gruppierung als EIN Gerät
      device: {
        identifiers: [DEVICE_ID],
        name: DEVICE_NAME,
        manufacturer: "Actual Budget",
        model: "@actual-app/api → MQTT bridge",
      },
    };

    client.publish(
      configTopic,
      JSON.stringify(discoveryPayload),
      { retain: true, qos: 1 },
      (err) => {
        if (err) {
          console.error("[MQTT] Discovery publish error:", configTopic, err);
        } else {
          console.log("[MQTT] Discovery published:", configTopic);
          discoveryPublishedFor.add(uniqueId);
        }
      }
    );
  }
}

async function fetchAndPublish() {
  await api.sync(); // Deltas holen/senden

  const month = getMonthString();
  const budget = await api.getBudgetMonth(month);

  // Discovery sicherstellen (einmalig pro Kategorie)
  await ensureDiscovery(budget);

  // Zustände publishen (nur bei Änderungen)
  for (const category of budget.categories) {
    const topic = `actualbudget/${slug(category.name)}`;
    const payloadObj = {
      id: category.id,
      name: category.name,
      budgeted: category.budgeted, // Minor-Units
      month,
      updated_at: new Date().toISOString(),
    };
    const payload = JSON.stringify(payloadObj);

    const last = lastPayloadByCategoryId.get(category.id);
    if (last !== payload) {
      client.publish(topic, payload, { retain: true, qos: 1 }, (err) => {
        if (err) {
          console.error(`[MQTT] Publish error for ${topic}:`, err);
        } else {
          console.log(`[MQTT] Published -> ${topic}: ${payload}`);
          lastPayloadByCategoryId.set(category.id, payload);
        }
      });
    }
  }
}

async function shutdown() {
  console.log("[SYS] Shutting down…");
  clearInterval(intervalHandle);
  try {
    if (client?.connected) {
      client.publish(AVAILABILITY_TOPIC, "offline", { retain: true, qos: 1 });
      client.end(true);
    }
  } catch (e) {
    console.error("[MQTT] Shutdown error:", e);
  }
  try {
    await api.shutdown();
  } catch (e) {
    console.error("[Actual] Shutdown error:", e);
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

(async () => {
  try {
    await initActual();
    initMqtt();
  } catch (error) {
    console.error("[ERROR]", error);
    await shutdown();
  }
})();
