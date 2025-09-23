ARG BUILD_FROM
FROM technitium/dns-server:latest

COPY run.sh /run.sh
COPY init.sh /init.sh
COPY scripts/ /scripts/

RUN rm -rf /etc/dns && ln -s /data /etc/dns

WORKDIR /data

RUN chmod +x /run.sh /init.sh /scripts/*.sh

EXPOSE 53/tcp 53/udp 5380/tcp

ENTRYPOINT ["/run.sh"]
