# Optional: deploy via Docker instead of Nixpacks.
# Railway will use this automatically if "Builder" is set to Dockerfile.
FROM node:20-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
