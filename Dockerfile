# -------------------------------------------------------------
# Stage 1: Build Frontend (React 19 + Vite)
# -------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Build Backend (Go)
# -------------------------------------------------------------
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/go.mod ./
COPY backend/ ./

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/bin/server ./cmd/server/main.go

# -------------------------------------------------------------
# Stage 3: Minimal Production Image
# -------------------------------------------------------------
FROM alpine:3.20 AS runner
WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata

# Directory for file-backed JSON database
RUN mkdir -p /app/data

# Copy compiled frontend SPA & Go server binary
COPY --from=frontend-builder /app/dist /app/dist
COPY --from=backend-builder /app/bin/server /app/server

ENV PORT=8080
ENV DATA_DIR=/app/data
ENV STATIC_DIR=/app/dist

EXPOSE 8080

CMD ["/app/server"]
