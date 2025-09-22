# Home Assistant Base Image (Multi-Arch, Alpine)
ARG BUILD_FROM=ghcr.io/home-assistant/aarch64-base:latest
FROM ${BUILD_FROM}

WORKDIR /app

ARG BUILD_ARCH
ARG TECHNITIUM_VERSION=2025.09.22

# Alpine: Tools installieren
RUN apk add --no-cache curl unzip tzdata

# Architekturabhängig die richtige Binary laden
RUN if [ "$BUILD_ARCH" = "amd64" ]; then \
        ARCH=x64; \
    elif [ "$BUILD_ARCH" = "aarch64" ]; then \
        ARCH=arm64; \
    elif [ "$BUILD_ARCH" = "armv7" ]; then \
        ARCH=arm32; \
    else \
        echo "Unsupported architecture $BUILD_ARCH"; exit 1; \
    fi && \
    curl -L -o dnsserver.zip \
        https://github.com/TechnitiumSoftware/DnsServer/releases/download/${TECHNITIUM_VERSION}/DnsServer_${TECHNITIUM_VERSION}_Linux_${ARCH}.zip && \
    unzip dnsserver.zip -d dns && \
    rm dnsserver.zip

# Skripte kopieren
COPY rootfs/ /
COPY scripts/ /opt/scripts/

RUN chmod +x /opt/scripts/*.sh /etc/services.d/*/run /etc/services.d/*/finish

CMD ["/etc/services.d/technitium_dns/run"]
