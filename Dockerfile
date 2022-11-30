# == Build ==
# docker build . -t wloche/jira-tools:latest
# == Run ==
# docker run -v `pwd`:/usr/src/app -it --rm wloche/jira-tools:latest

# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Bundle app source + install dependencies
COPY . ./
RUN npm install

# Run the app!
CMD [ "node", "sprints-stats.js" ]
