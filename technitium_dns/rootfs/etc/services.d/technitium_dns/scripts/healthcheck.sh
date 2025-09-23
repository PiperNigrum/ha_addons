#!/usr/bin/with-contenv bash
/rootfs/etc/services.d/technitium_dns/scripts/log.sh "[INFO] Healthcheck: Überprüfe ob Port 53 erreichbar ist"
if nc -z 127.0.0.1 53; then
    /rootfs/etc/services.d/technitium_dns/scripts/log.sh "[INFO] Port 53 ist erreichbar"
else
    /rootfs/etc/services.d/technitium_dns/scripts/log.sh "[WARN] Port 53 ist nicht erreichbar"
fi
