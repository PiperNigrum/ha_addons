ARG BUILD_FROM
FROM ${BUILD_FROM}

ENV LANG C.UTF-8

RUN apk add --no-cache curl bash

# Architektur erkennen und passende Version laden
RUN ARCH=$(uname -m) && \
    case "$ARCH" in \
      armv7l) URL="dns-server-linux-arm.tar.gz" ;; \
      aarch64) URL="dns-server-linux-arm64.tar.gz" ;; \
      *) echo "Unsupported architecture: $ARCH" && exit 1 ;; \
    esac && \
    curl -L "https://github.com/TechnitiumSoftware/DnsServer/releases/latest/download/$URL" \
    | tar xz -C /opt

WORKDIR /opt

CMD ["/opt/start.sh"]
