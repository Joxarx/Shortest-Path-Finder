# Usar una imagen base de Nginx
FROM nginx:latest

# Copiar los archivos de la aplicación al directorio de Nginx
COPY . /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80