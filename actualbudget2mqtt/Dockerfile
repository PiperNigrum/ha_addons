# --- Dockerfile ---

# Home Assistant-Add-ons verwenden i. d. R. dieses Muster:
ARG BUILD_FROM
FROM $BUILD_FROM

# Linter: "ENV key=value" statt "ENV key value"
ENV LANG=C.UTF-8

# Node.js + npm (für Alpine-Base; bei Debian entsprechend apt-get)
RUN apk add --no-cache nodejs npm

# ---- App deployen ----
WORKDIR /opt/actualbudget2mqtt
COPY package*.json ./
RUN npm ci --omit=dev
COPY index.js ./

# ---- s6-Dienstdateien ----
COPY rootfs/ /

# Rechte & Zeilenenden absichern (falls Git sie nicht mitliefert)
RUN chmod +x /etc/services.d/actualbudget2mqtt/run \
 && sed -i 's/\r$//' /etc/services.d/actualbudget2mqtt/run
