#!/usr/bin/env bash
ARCH=$(uname -m)

echo "Erkannte Architektur: $ARCH"

case "$ARCH" in
  armv7l)
    echo "Lade Technitium DNS für ARMv7..."
    curl -L https://github.com/TechnitiumSoftware/DnsServer/releases/latest/download/dns-server-linux-arm.tar.gz \
      | tar xz -C /opt
    ;;
  aarch64)
    echo "Lade Technitium DNS für ARM64..."
    curl -L https://github.com/TechnitiumSoftware/DnsServer/releases/latest/download/dns-server-linux-arm64.tar.gz \
      | tar xz -C /opt
    ;;
  *)
    echo "Nicht unterstützte Architektur: $ARCH"
    exit 1
    ;;
esac

echo "Starte Technitium DNS Server..."
exec /opt/start.sh
