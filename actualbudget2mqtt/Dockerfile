ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

RUN apk add --no-cache nodejs npm

COPY rootfs / 


# Rechte/Zeilenenden noch mal hart absichern (falls Git sie nicht mitliefert)
RUN chmod +x /etc/services.d/actualbudget2mqtt/run \
 && sed -i 's/\r$//' /etc/services.d/actualbudget2mqtt/


WORKDIR /

CMD [ "/run.sh" ]