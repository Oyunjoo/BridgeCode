FROM node:alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 최종 스테이지: Nginx를 사용하여 빌드 결과물을 서빙
FROM nginx:alpine
COPY --from=build /dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
