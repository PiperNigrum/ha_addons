
ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG=C.UTF-8

# Install Node.js and npm (for Alpine base; use apt-get on Debian bases)
RUN apk add --no-cache nodejs npm

# ---- App deploy ----
WORKDIR /opt/actualbudget2mqtt
COPY app/package*.json ./
RUN npm ci --omit=dev
COPY app/ ./

# ---- s6 services ----
COPY rootfs/ /

# Ensure run/finish are executable and LF-only (in case Git attrs are lost)
RUN chmod +x /etc/services.d/actualbudget2mqtt/run  && sed -i 's/$//' /etc/services.d/actualbudget2mqtt/run  && [ ! -f /etc/services.d/actualbudget2mqtt/finish ] || chmod +x /etc/services.d/actualbudget2mqtt/finish  && [ ! -f /etc/services.d/actualbudget2mqtt/finish ] || sed -i 's/$//' /etc/services.d/actualbudget2mqtt/finish
