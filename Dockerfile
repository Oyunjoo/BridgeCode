# frontend/Dockerfile
FROM node:14-alpine as build
WORKDIR /app

RUN npm install -g npm@latest
COPY package*.json ./

RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]                                        
