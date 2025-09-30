# Usa una imagen oficial de Node
FROM node:18

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia package.json
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del proyecto
COPY . .

# Construye la app Next.js
RUN npm run build

# Expone el puerto de Next.js
EXPOSE 3000

# Inicia el frontend
CMD ["npm", "run", "start"]
