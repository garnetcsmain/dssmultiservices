# syntax=docker/dockerfile:1

# whisper.cpp is built here rather than installed on maple, so the host keeps
# its Node 18 and gains no build toolchain. Static link keeps the runtime stage
# from needing the ggml shared libraries.
FROM debian:bookworm-slim AS whisper
RUN apt-get update && apt-get install -y --no-install-recommends \
      git build-essential cmake ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /src
RUN git clone --depth 1 https://github.com/ggml-org/whisper.cpp .
RUN cmake -B build -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF \
      -DWHISPER_BUILD_TESTS=OFF -DWHISPER_BUILD_SERVER=OFF \
 && cmake --build build -j"$(nproc)" --target whisper-cli

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg tini \
 && rm -rf /var/lib/apt/lists/*
COPY --from=whisper /src/build/bin/whisper-cli /usr/local/bin/whisper-cli

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

# Recordings are customer call audio and the only copy once Twilio's is deleted.
# Non-root so a container compromise cannot rewrite the archive.
RUN useradd --system --uid 10001 dss \
 && mkdir -p /app/recordings /app/deadletter \
 && chown -R dss:dss /app
USER dss

ENV NODE_ENV=production
EXPOSE 8080

# tini reaps the ffmpeg and whisper children this service spawns; without it
# they accumulate as zombies under PID 1.
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/index.js"]
