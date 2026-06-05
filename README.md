# GymApp - Sistema de Gestión Sala de Pesas UCN

El sistema corresponde a una aplicación web para la gestión de usuarios y acceso a la sala de pesas del gimnasio UCN. La aplicación permite registrar usuarios desde una vista administrativa e iniciar sesión desde el frontend utilizando RUT y contraseña.

## Tecnologías utilizadas

* Frontend: Angular 20
* Backend: .NET 10 Web API
* Base de datos: SQLite
* Contenedores: Docker y Docker Compose
* Servidor frontend: Nginx

## Estructura del proyecto

```txt
GymApp
├── GymBackend
│   ├── Controllers
│   ├── DTOs
│   ├── Data
│   ├── Models
│   ├── Migrations
│   ├── Dockerfile
│   └── Program.cs
│
├── GymFrontend
│   ├── src
│   ├── public
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── angular.json
│   └── package.json
│
└── docker-compose.yml
```

## Requisitos previos

Para ejecutar el proyecto se necesita tener instalado:

* Git
* Docker Desktop o Docker Engine
* Docker Compose

En Windows, Docker Desktop debe estar configurado con WSL 2.

## Clonar el repositorio

```bash
git clone https://github.com/JovenCharles/gymapp-plataformas.git
cd gymapp-plataformas
```

## Ejecutar el proyecto con Docker

Desde la carpeta raíz del proyecto, ejecutar:

```bash
docker compose up --build
```

Esto levantará dos servicios:

* Frontend Angular servido con Nginx
* Backend .NET 10 Web API

## Acceso a la aplicación

Frontend:

```txt
http://localhost:4200
```

Backend / Swagger:

```txt
http://localhost:5008/swagger
```

## Flujo de prueba

1. Abrir el frontend en `http://localhost:4200`.
2. Ingresar como administrador usando el perfil demo.
3. Entrar a la sección **Gestión de Usuarios**.
4. Crear un usuario con RUT, nombre, correo, contraseña y tipo de usuario.
5. Volver al login.
6. Iniciar sesión con el RUT y contraseña del usuario creado.

## Endpoints principales del backend

```txt
POST /api/Auth/register
POST /api/Auth/login
GET  /api/Auth/users
```

## Notas importantes

La base de datos SQLite se crea automáticamente al iniciar el backend si no existe previamente.

En ambiente Docker, los usuarios deben registrarse nuevamente si se elimina el contenedor o la base de datos generada.

## Comandos útiles

Detener los contenedores:

```bash
docker compose down
```

Reconstruir el proyecto:

```bash
docker compose up --build
```

Ver contenedores activos:

```bash
docker ps
```
