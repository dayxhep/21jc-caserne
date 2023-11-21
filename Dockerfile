FROM node:17.9.1

WORKDIR /app

COPY . /app/

RUN npm install -g pm2 \
  && npm install
CMD [ "pm2-runtime", "index.js" ]