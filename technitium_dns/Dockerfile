ARG BUILD_FROM
FROM ${BUILD_FROM}

ENV LANG C.UTF-8

RUN apk add --no-cache curl bash

COPY run.sh /run.sh
RUN chmod +x /run.sh

CMD ["/run.sh"]
