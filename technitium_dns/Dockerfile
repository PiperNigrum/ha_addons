# Nutzt das offizielle Technitium Multi-Arch-Image
FROM technitium/dns-server:latest

# Arbeitsverzeichnis
WORKDIR /app

# Copy für Supervisor Skripte
COPY rootfs/ /

# Startscript ausführbar machen
RUN chmod +x /etc/services.d/technitium_dns/run /etc/services.d/technitium_dns/finish

CMD ["/etc/services.d/technitium_dns/run"]