# Offizielles Multi-Arch Technitium DNS Image als Basis
FROM technitium/dns-server:latest

# Build-Argumente
ARG BUILD_ARCH
ARG BUILD_VERSION

# Labels
LABEL \  io.hass.name="Technitium DNS" \  io.hass.description="Technitium DNS Server als Home Assistant Add-on" \  io.hass.arch="${BUILD_ARCH}" \  io.hass.version="${BUILD_VERSION}" \  maintainer="PiperNigrum"

# Tools für Skripte
RUN apt-get update && \    apt-get install -y --no-install-recommends bash curl jq tzdata && \    rm -rf /var/lib/apt/lists/*

# Skripte und Supervisor-Dateien
COPY rootfs/ /
COPY scripts/ /opt/scripts/

# Rechte setzen
RUN chmod +x /opt/scripts/*.sh /etc/services.d/*/run /etc/services.d/*/finish
