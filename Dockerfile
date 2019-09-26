FROM mhart/alpine-node:11.12

WORKDIR /app

# install api node_modules
COPY ./app/package.json /app/package.json
COPY ./app/yarn.lock /app/yarn.lock
RUN yarn install

# copy files
COPY app /app

ENTRYPOINT ["node", "index.js"]