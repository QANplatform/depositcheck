FROM alpine:3.15.2
WORKDIR /app
COPY app .
RUN apk add --no-cache npm && \
    npm install
ENTRYPOINT [ "node", "/app/index.js" ]
