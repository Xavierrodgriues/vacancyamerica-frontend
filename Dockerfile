# Step 1 Build React app

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_API_URL
RUN VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID VITE_API_URL=$VITE_API_URL npm run build

# Step 2 Serve static files with Nginx

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]