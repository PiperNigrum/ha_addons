const api = require('@actual-app/api');
const mqtt = require('mqtt');
const fs = require('fs');

const configPath = '/data/options.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

(async () => {
  try {
      await api.init({
            dataDir: '/data/cache',
                  serverURL: config.actual_url,
                        password: config.actual_password,
                            });

                                await api.downloadBudget(config.actual_sync_id);
                                    const budget = await api.getBudgetMonth(config.actual_month);

                                        const client = mqtt.connect({
                                              host: config.mqtt_host,
                                                    port: config.mqtt_port,
                                                          username: config.mqtt_user,
                                                                password: config.mqtt_password,
                                                                    });

                                                                        client.on('connect', () => {
                                                                              console.log('[MQTT] Connected');
                                                                                    for (const category of budget.categories) {
                                                                                            const topic = `actualbudget/${category.name.replace(/\\s+/g, '_')}`;
                                                                                                    const payload = JSON.stringify({
                                                                                                              id: category.id,
                                                                                                                        name: category.name,
                                                                                                                                  budgeted: category.budgeted
                                                                                                                                          });
                                                                                                                                                  client.publish(topic, payload, { retain: true });
                                                                                                                                                          console.log(`[MQTT] Published to ${topic}: ${payload}`);
                                                                                                                                                                }
                                                                                                                                                                      client.end();
                                                                                                                                                                          });

                                                                                                                                                                              await api.shutdown();
                                                                                                                                                                                } catch (error) {
                                                                                                                                                                                    console.error('[ERROR]', error);
                                                                                                                                                                                      }
                                                                                                                                                                                      })();
                                                                                                                                                                                       