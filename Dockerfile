# 🚀 Build the runner image
FROM node:20.5.0-alpine as runner
WORKDIR /app


ENV NODE_ENV=production

# Copy files in logical layer order
COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node .yarnrc.yml .
COPY --chown=node:node .yarn/ .yarn/

COPY --chown=node:node .pnp.cjs .
COPY --chown=node:node .pnp.loader.mjs .

# Copy over runtime
COPY --chown=node:node src/ src/

# ⚙️ Configure the default command
USER node
CMD ["yarn", "node", "."]
