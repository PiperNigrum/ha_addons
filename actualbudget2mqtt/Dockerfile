ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

RUN apk add --no-cache nodejs npm

COPY rootfs / 

WORKDIR /

CMD [ "/run.sh" ]