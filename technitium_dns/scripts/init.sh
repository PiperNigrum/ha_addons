#!/usr/bin/with-contenv sh
. /opt/scripts/common.sh

log_info "Initialisiere Technitium DNS Add-on..."

if [ ! -d /data ]; then
    log_info "Lege persistenten Ordner /data an..."
    mkdir -p /data
fi
