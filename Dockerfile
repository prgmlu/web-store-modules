FROM node

RUN npm i npm@latest -g

# setup work directory, relative path will be inside this directory
# we need this because Jest can't find tests without this work directory
WORKDIR /mall-workdir/
# copy the node dependency list to WORKDIR
COPY package-lock.json package-lock.json
COPY package.json package.json
# copy lerna configuration to WORKDIR
COPY lerna.json lerna.json
# copy packages to WORKDIR
COPY packages/ packages/
# copy assets to WORKDIR
COPY assets/ assets/

# install npm dependencies
RUN npm install
# lerna boot strap all dependencies
RUN npx lerna bootstrap --hoist