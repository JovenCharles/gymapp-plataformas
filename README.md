# GymApp - Sistema de Gestión Sala de Pesas UCN

GymApp es una aplicación web para la gestión de usuarios, horarios y reservas de la sala de pesas del gimnasio UCN.  
El sistema permite administrar usuarios desde un portal administrativo, iniciar sesión con perfiles diferenciados y gestionar reservas de bloques horarios desde el frontend.

## Tecnologías utilizadas

* Frontend: Angular 21
* Backend: .NET 10 Web API
* Base de datos: PostgreSQL
* Autenticación: JWT
* Contenedores: Docker y Docker Compose
* Servidor frontend: Nginx
* CI/CD: GitHub Actions + Docker Hub

## Estructura del proyecto

```txt
GymApp
├── .github
│   └── workflows
│       └── docker-build-push.yml
│
├── GymBackend
│   ├── Controllers
│   ├── DTOs
│   ├── Data
│   ├── Models
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
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
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

## Ejecución en ambiente local

Desde la carpeta raíz del proyecto, ejecutar:

```bash
docker compose up --build
```

Esto levanta los siguientes servicios:

* Frontend Angular servido con Nginx
* Backend .NET 10 Web API
* Base de datos PostgreSQL

## Acceso local

Frontend:

```txt
http://localhost:4200
```

Portal administrativo:

```txt
http://localhost:4200/admin
```

Backend / Swagger:

```txt
http://localhost:5008/swagger/index.html
```

## Credenciales administrador por defecto

Al iniciar el backend, si no existe un usuario administrador, el sistema crea automáticamente un administrador por defecto.

```txt
Usuario: admin
Contraseña: 123456
```

Este usuario permite ingresar al portal administrativo y registrar nuevos usuarios desde la sección **Gestión de Usuarios**.

## Funcionalidades principales

### Usuario normal

* Inicio de sesión mediante RUT y contraseña.
* Visualización de horarios disponibles.
* Reserva de bloques horarios en la Sala de Pesas.
* Visualización del historial de reservas.
* Cancelación de reservas con confirmación previa.
* Visualización de perfil de usuario.
* Cierre de sesión.

### Administrador

* Inicio de sesión mediante usuario y contraseña.
* Dashboard administrativo con monitoreo del sistema.
* Visualización de usuarios registrados.
* Registro de nuevos usuarios.
* Visualización de reservas recientes.
* Cierre de sesión.

## Flujo de prueba recomendado

1. Abrir el portal administrativo en `http://localhost:4200/admin`.
2. Iniciar sesión con:

   ```txt
   Usuario: admin
   Contraseña: 123456
   ```

3. Entrar a **Gestión de Usuarios**.
4. Crear un usuario normal con RUT, nombre, correo, contraseña y tipo de usuario.
5. Cerrar sesión.
6. Entrar al login de usuario en `http://localhost:4200/login`.
7. Iniciar sesión con el RUT y contraseña del usuario creado.
8. Reservar un bloque horario.
9. Revisar el historial de reservas.
10. Cancelar una reserva utilizando el modal de confirmación.
11. Volver al portal administrador y revisar el dashboard.

## Endpoints principales del backend

```txt
POST   /api/Auth/register
POST   /api/Auth/login
POST   /api/Auth/admin-login
GET    /api/Auth/users

GET    /api/Schedules

GET    /api/Reservations
GET    /api/Reservations/user/{userId}
POST   /api/Reservations
DELETE /api/Reservations/{id}
```

## Base de datos

La base de datos utilizada es PostgreSQL.

Al iniciar el backend, el sistema realiza una inicialización automática:

* Crea las tablas necesarias si no existen.
* Crea un usuario administrador por defecto si no existe.
* Crea bloques horarios por defecto si no existen.

Los bloques horarios iniciales son creados para los días:

```txt
Lunes, Martes, Miércoles, Jueves, Viernes y Sábado
```

Con los siguientes horarios:

```txt
08:00 - 09:30
09:30 - 11:00
11:00 - 12:30
13:00 - 14:30
```

Cada bloque tiene una capacidad inicial de 20 cupos.

## Reiniciar base de datos desde cero

Para eliminar completamente los contenedores, redes y volúmenes asociados al proyecto:

```bash
docker compose down -v --remove-orphans
```

Luego volver a levantar:

```bash
docker compose up --build
```

Al hacer esto, se eliminan los usuarios y reservas existentes. Sin embargo, el sistema vuelve a crear automáticamente el administrador por defecto y los horarios iniciales.

## Ejecución usando imágenes de Docker Hub

El proyecto cuenta con un archivo `docker-compose.prod.yml` que permite ejecutar la aplicación utilizando las imágenes publicadas en Docker Hub.

Ejecutar:

```bash
docker compose -f docker-compose.prod.yml down -v --remove-orphans
docker compose -f docker-compose.prod.yml up
```

Servicios disponibles:

Frontend productivo:

```txt
http://localhost:8081
```

Backend / Swagger productivo:

```txt
http://localhost:5009/swagger/index.html
```

Imágenes utilizadas:

```txt
jovencharles/gymaster-frontend:latest
jovencharles/gymaster-backend:latest
postgres:16-alpine
```

## CI/CD con GitHub Actions

El proyecto incorpora un workflow de GitHub Actions ubicado en:

```txt
.github/workflows/docker-build-push.yml
```

Este workflow se ejecuta automáticamente al realizar un push sobre la rama `main`.

El pipeline realiza las siguientes acciones:

1. Clona el repositorio.
2. Inicia sesión en Docker Hub utilizando secrets.
3. Construye la imagen Docker del frontend Angular.
4. Construye la imagen Docker del backend .NET.
5. Publica ambas imágenes en Docker Hub.

Imágenes publicadas:

```txt
jovencharles/gymaster-frontend:latest
jovencharles/gymaster-backend:latest
```

Además, cada imagen se publica con un tag asociado al hash del commit.

## Secrets utilizados en GitHub Actions

En el repositorio de GitHub se configuraron los siguientes secrets:

```txt
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

Estos permiten que GitHub Actions pueda iniciar sesión en Docker Hub y publicar las imágenes generadas.

## Comandos útiles

Detener contenedores sin eliminar la base de datos:

```bash
docker compose down
```

Levantar y reconstruir el proyecto local:

```bash
docker compose up --build
```

Ver contenedores activos:

```bash
docker ps
```

Ver logs del backend:

```bash
docker compose logs -f backend
```

Ver logs de la base de datos:

```bash
docker compose logs -f database
```

Probar ambiente productivo con imágenes de Docker Hub:

```bash
docker compose -f docker-compose.prod.yml up
```

## Consideraciones para despliegue en máquinas virtuales

El proyecto está preparado para ser desplegado posteriormente en máquinas virtuales utilizando las imágenes publicadas en Docker Hub.

La arquitectura propuesta considera:

```txt
VM 1: Frontend Angular + Nginx
VM 2: Backend .NET Web API
VM 3: PostgreSQL principal
VM 4: PostgreSQL respaldo
```

El flujo esperado de despliegue es:

```txt
Push a main
↓
GitHub Actions
↓
Build de imágenes Docker
↓
Publicación en Docker Hub
↓
VMs descargan las imágenes publicadas
↓
Aplicación desplegada
```
