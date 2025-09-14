# Technitium DNS Addon

Dieses Addon integriert den Technitium DNS Server in Home Assistant OS.
Es basiert auf dem offiziellen Docker-Image [`technitium/dns-server`](https://hub.docker.com/r/technitium/dns-server) und unterstützt mehrere Architekturen.

## Weboberfläche

- Zugriff: `http://<dein-haos>:5380`

## Ports

- DNS: `53/tcp`, `53/udp`
- Web UI: `5380/tcp`

## Hinweise

- Stelle sicher, dass kein anderer Dienst Port 53 verwendet.
- Konfiguration erfolgt über die Weboberläche.