FROM node:20.14.0-alpine AS build

WORKDIR /public
# Install pnpm
RUN npm install -g pnpm
# Copy all the files, but with some excluded (see .dockerignore)
COPY . .
# Put the auth token in the correct format in .npmrc for artifact registry access
ARG TOKEN
# Insert new line
RUN echo "" >> .npmrc
RUN echo "//europe-west1-npm.pkg.dev/azd-dev-artifacts/azd-d-artifacts-art-euwe1-npmrepo/:_authToken=\"$TOKEN\"" >> .npmrc
# Install the packages
RUN pnpm install --force
# Build the application
RUN pnpm run build

FROM nginx:1.18-alpine AS keun-deploy

# Test the following...
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /public .
ENTRYPOINT ["nginx", "-g", "daemon off;"]