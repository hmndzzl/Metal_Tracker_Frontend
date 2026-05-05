# Usamos el servidor web Nginx en su versión súper ligera
FROM nginx:alpine

# Eliminamos los archivos HTML por defecto que trae Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiamos nuestro HTML, CSS y JS a la carpeta pública de Nginx
COPY . /usr/share/nginx/html

# Exponemos el puerto estándar HTTP
EXPOSE 80

# Comando por defecto para arrancar Nginx y mantenerlo corriendo en primer plano
CMD ["nginx", "-g", "daemon off;"]