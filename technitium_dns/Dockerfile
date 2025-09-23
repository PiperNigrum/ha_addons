ARG BUILD_FROM
FROM technitium/dns-server:latest

# Kopiere alles aus rootfs ins Container-Root
COPY rootfs/ /

RUN rm -rf /etc/dns && ln -s /data /etc/dns

WORKDIR /data

EXPOSE 53/tcp 53/udp 5380/tcp
