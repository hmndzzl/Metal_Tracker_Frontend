# 🤘 METAL TRACKER VAULT - Frontend (Vanilla JS)

## Creado por Hugo Méndez - 241265

> **Repositorio del backend:** [https://github.com/hmndzzl/Metal_Tracker_Backend](https://github.com/hmndzzl/Metal_Tracker_Backend)
>
> **App publicada:** http://34.171.199.135:8080/

---

Interfaz gráfica oficial para el sistema de gestión de catálogo musical "Metal Tracker". Este cliente web ha sido desarrollado siguiendo una arquitectura estricta de **Cero Frameworks** (Zero-Dependency), utilizando exclusivamente HTML5, CSS3 y JavaScript puro (Vanilla JS).

## 🚀 Cómo correr el proyecto localmente

Este proyecto está completamente dockerizado utilizando Nginx para facilitar su ejecución y despliegue estático.

1. Clona este repositorio y muévete a la carpeta `app`:
   ```bash
   git clone https://github.com/hmndzzl/Metal_Tracker_Frontend.git
   cd Metal_Tracker_Frontend/app
   ```

2. *(Opcional)* Si necesitas cambiar la configuración del puerto para el servidor web local, puedes basarte en el archivo `docker-compose.example.yml` para ajustar el tuyo:
   ```bash
   cp docker-compose.example.yml docker-compose.yml
   ```

3. Construye y levanta los contenedores usando Docker Compose:
   ```bash
   docker compose up --build -d
   ```

4. El servidor web Nginx servirá los archivos estáticos en `http://localhost:8080`.

**Nota Importante:** Es indispensable que el Backend de Metal Tracker esté en ejecución en el puerto `3000` para que el frontend pueda consumir la API y gestionar la autenticación.

## 🏗️ Arquitectura y Patrones de Diseño

El proyecto implementa prácticas modernas de desarrollo frontend sin depender de librerías externas como React o Angular:

*   **Delegación de Eventos (Event Delegation):** Optimización de memoria asignando *Event Listeners* a contenedores padre en lugar de a cada tarjeta individual generada dinámicamente.
*   **Modularidad de Código:** Separación de responsabilidades con ECMAScript Modules (`type="module"`).
    *   `api.js`: Abstracción de la capa de red (Fetch API, control de sesiones fantasma y JWT).
    *   `ui.js`: Funciones puras de renderizado del DOM e inyección de HTML seguro.
    *   `app.js`: Cerebro de la aplicación, manejo de estados y controladores de eventos principales.
*   **RBAC (Role-Based Access Control):** Renderizado condicional de la interfaz (botones de edición, eliminación, formularios de administración) basado en el rol del usuario decodificado desde la sesión.
*   **Estilo Brutalista:** Diseño UI/UX enfocado en alto contraste, tipografía monoespaciada y experiencia inmersiva construido puramente en Vanilla CSS.

## 🧠 Reflexión Tecnológica

Utilizar **Vanilla JS, HTML5 y CSS3 puros** para este frontend representó un excelente ejercicio para consolidar las bases reales del desarrollo web. Trabajar sin frameworks me forzó a diseñar y orquestar el Document Object Model (DOM) de manera manual. 

El mayor desafío técnico fue coordinar el estado visual de la UI de forma fluida junto con las llamadas asíncronas de la red, asegurando la consistencia entre lo que ve el usuario y lo que procesa la base de datos. Implementar mecánicas como el cierre de sesiones automáticas centralizando el manejo de promesas (Fetch API) demostró el nivel de robustez que se puede alcanzar arquitectando un sistema "Cero Frameworks". Completar el desarrollo desde estas bases sólidas es la mejor manera de entender y valorar las problemáticas que herramientas complejas como React o Angular resuelven por debajo del capó.

## 📁 Estructura del Proyecto

```text
Metal_Tracker_Frontend/
├── app/
│   ├── css/
│   │   └── style.css            # Estilos centralizados y diseño de UI
│   ├── js/
│   │   ├── api.js               # Capa de red, endpoints HTTP y vigilante de sesión
│   │   ├── app.js               # Controladores principales e inicialización
│   │   └── ui.js                # Construcción y manipulación dinámica del DOM
│   ├── Dockerfile               # Instrucciones del contenedor Nginx Alpine
│   ├── docker-compose.yml       # Configuración principal de orquestación
│   ├── docker-compose.example.yml 
│   └── index.html               # Punto de entrada y esqueleto de la UI
├── .gitignore                   # Exclusión de archivos basuras
└── README.md                    # Documentación
```