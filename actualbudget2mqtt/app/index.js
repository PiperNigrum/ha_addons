
const api = require("@actual-app/api");
const mqtt = require("mqtt");
const fs = require("fs");

const configPath = "/data/options.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

// ---- Configuration & Defaults ----
const POLL_INTERVAL_MS = Number(config.poll_interval_ms ?? 60_000);
const ENC_PASSWORD = config.actual_budget_password || config.actual_password; // same password allowed
const SYNC_ID = config.actual_sync_id;

// MQTT URL (or build from host/port)
const mqttUrl =
  config.mqtt_url || `${config.mqtt_tls ? "mqtts" : "mqtt"}://${config.mqtt_host}:${config.mqtt_port}`;

const slug = (name) => String(name).trim().replace(/\s+/g, "_").replace(/[^\w\-./]/g, "");

const AVAILABILITY_TOPIC = config.availability_topic || "actualbudget/status";

const DISCOVERY_ENABLED = config.discovery_enabled !== false; // default true
const DISCOVERY_PREFIX = config.discovery_prefix || "homeassistant";
const DEVICE_NAME = config.device_name || "Actual Budget";
const DEVICE_ID = (config.device_id || `actual_${SYNC_ID}`).replace(/[^\w\-]/g, "_");
const CURRENCY = config.currency_symbol || "€";

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
    password: config.actual_password,
  });
  await api.downloadBudget(SYNC_ID, { password: ENC_PASSWORD });
}

function initMqtt() {
  client = mqtt.connect(mqttUrl, {
    username: config.mqtt_user,
    password: config.mqtt_password,
    will: { topic: AVAILABILITY_TOPIC, payload: "offline", retain: true, qos: 1 },
    rejectUnauthorized: config.mqtt_tls_reject_unauthorized !== false,
  });

  client.on("connect", async () => {
    console.log("[MQTT] Connected:", mqttUrl);
    client.publish(AVAILABILITY_TOPIC, "online", { retain: true, qos: 1 });

    try { await fetchAndPublish(); } catch (e) { console.error("[ERROR] Initial fetch failed:", e); }

    intervalHandle = setInterval(async () => {
      try { await fetchAndPublish(); } catch (e) { console.error("[ERROR] Periodic fetch failed:", e); }
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
      unique_id: uniqueId,
      state_topic: `actualbudget/${slug(category.name)}`,
      value_template: "{{ (value_json.budgeted | float / 100) | round(2) }}",
      unit_of_measurement: CURRENCY,
      icon: "mdi:currency-eur",
      availability_topic: AVAILABILITY_TOPIC,
      payload_available: "online",
      payload_not_available: "offline",
      device: {
        identifiers: [DEVICE_ID],
        name: DEVICE_NAME,
        manufacturer: "Actual Budget",
        model: "@actual-app/api → MQTT bridge",
      },
    };

    client.publish(configTopic, JSON.stringify(discoveryPayload), { retain: true, qos: 1 }, (err) => {
      if (err) {
        console.error("[MQTT] Discovery publish error:", configTopic, err);
      } else {
        console.log("[MQTT] Discovery published:", configTopic);
        discoveryPublishedFor.add(uniqueId);
      }
    });
  }
}

async function fetchAndPublish() {
  await api.sync();

  const month = getMonthString();
  const budget = await api.getBudgetMonth(month);

  await ensureDiscovery(budget);

  for (const category of budget.categories) {
    const topic = `actualbudget/${slug(category.name)}`;
    const payloadObj = {
      id: category.id,
      name: category.name,
      budgeted: category.budgeted,
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
  } catch (e) { console.error("[MQTT] Shutdown error:", e); }
  try {
    await api.shutdown();
  } catch (e) { console.error("[Actual] Shutdown error:", e); }
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
