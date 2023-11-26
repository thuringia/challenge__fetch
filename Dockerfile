FROM oven/bun:latest

COPY package.json ./
COPY bun.lockb ./
COPY *.ts ./

RUN bun install

RUN bun compile

