# Multi-Arch Base Image von Debian slim
ARG BUILD_FROM=debian:bookworm-slim
FROM ${BUILD_FROM}

# Build-Argumente
ARG BUILD_ARCH
ARG BUILD_VERSION

# Labels
LABEL \  io.hass.name="Technitium DNS" \  io.hass.description="Technitium DNS Server als Home Assistant Add-on" \  io.hass.arch="${BUILD_ARCH}" \  io.hass.version="${BUILD_VERSION}" \  maintainer="PiperNigrum"

# Tools für Skripte
RUN apt-get update &&     apt-get install -y --no-install-recommends curl unzip tzdata &&     rm -rf /var/lib/apt/lists/*

# Arbeitsverzeichnis
WORKDIR /app

# Offizielles Technitium DNS Binary herunterladen
ARG TECHNITIUM_VERSION=2025.09.22
RUN curl -L -o dnsserver.zip https://github.com/TechnitiumSoftware/DnsServer/releases/download/${TECHNITIUM_VERSION}/DnsServer_${TECHNITIUM_VERSION}_Linux_x64.zip &&     unzip dnsserver.zip -d dns &&     rm dnsserver.zip

# Skripte und Supervisor-Dateien
COPY rootfs/ /
COPY scripts/ /opt/scripts/

# Rechte setzen
RUN chmod +x /opt/scripts/*.sh /etc/services.d/*/run /etc/services.d/*/finish

# Entry Point (Supervisor startet über run-Skript)
CMD ["/etc/services.d/technitium_dns/run"]
