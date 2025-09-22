#!/usr/bin/env bash
source /opt/scripts/common.sh

log_info "Initialisiere Technitium DNS Add-on..."

if [ ! -d /config ]; then
    log_warn "Kein Config-Ordner vorhanden – lege an..."
    mkdir -p /config
fi
