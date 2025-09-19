ARG BUILD_FROM
FROM ${BUILD_FROM}

ENV LANG C.UTF-8

# Install curl and bash
RUN apk add --no-cache curl bash

# Create service directory
COPY rootfs / 

# Make run script executable
RUN chmod +x /etc/services.d/technitium/run
