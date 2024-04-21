ARG NODE_VERSION=${NODE_VERSION:-18.17-alpine}
FROM node:${NODE_VERSION}

LABEL maintainer="Seth9"

RUN mkdir -p /home/app
RUN chown node /home/app
RUN apk add --no-cache openssh-client git

USER node
WORKDIR /home/app

COPY --chown=node ./docker/entrypoint.sh .
RUN chmod +x entrypoint.sh
RUN mkdir -p /home/app/SquadJS

ENTRYPOINT ["/home/app/entrypoint.sh"]