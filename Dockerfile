FROM node:14-alpine

# 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# npm 최신 버전 업데이트
RUN npm install -g npm@latest

# 의존성 설치
RUN npm install

# 전체 소스 코드 복사
COPY . .

# 빌드 실행 (예: 프론트엔드 빌드)
RUN npm run build

CMD ["npm", "start"]


FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]                                        
