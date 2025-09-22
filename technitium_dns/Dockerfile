# Multi-Arch Base Image von Home Assistant
ARG BUILD_FROM=ghcr.io/home-assistant/base:latest
FROM ${BUILD_FROM}

WORKDIR /app

ARG TECHNITIUM_VERSION=2025.09.22
RUN curl -L -o dnsserver.zip     https://github.com/TechnitiumSoftware/DnsServer/releases/download/${TECHNITIUM_VERSION}/DnsServer_${TECHNITIUM_VERSION}_Linux_x64.zip &&     unzip dnsserver.zip -d dns &&     rm dnsserver.zip

COPY rootfs/ /
COPY scripts/ /opt/scripts/

RUN chmod +x /opt/scripts/*.sh /etc/services.d/*/run /etc/services.d/*/finish

CMD ["/etc/services.d/technitium_dns/run"]
