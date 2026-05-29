FROM node:20-alpine
WORKDIR /app

# Sao chép file quản lý thư viện
COPY package*.json ./

# Cài đặt toàn bộ dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Mở cổng 3000
EXPOSE 3000

# Khởi chạy ứng dụng thẳng bằng môi trường dev
CMD ["npm", "run", "dev"]