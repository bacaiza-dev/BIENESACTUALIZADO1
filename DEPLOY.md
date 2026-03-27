# Guía de Despliegue - Sistema de Gestión de Bienes INT

Esta guía te explicará paso a paso cómo instalar y ejecutar el sistema en una nueva computadora con Windows.

## 1. Requisitos Previos

Antes de copiar el sistema, asegúrate de instalar lo siguiente en la nueva máquina:

1.  **Docker Desktop**: Es vital para ejecutar los contenedores (Base de datos, Backend y Frontend).
    - Descargar e instalar desde: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
    - Reinicia la PC tras la instalación si te lo pide.
2.  **Git (Opcional)**: Si planeas descargar el código desde un repositorio.
    - Descargar: [https://git-scm.com/downloads](https://git-scm.com/downloads)

## 2. Copiar el Proyecto

Tienes dos opciones para llevar el código a la otra máquina:

### Opción A: Copiar Carpeta

1.  Copia toda la carpeta `bienesint` (donde tienes el proyecto actualmente) a un pendrive o nube.
2.  Pégala en la nueva máquina (ej: `C:\Proyectos\bienesint`).
3.  **Importante**: No necesitas copiar la carpeta `node_modules` (son miles de archivos pesados), Docker las creará de nuevo.

### Opción B: Clonar Repositorio (Si usas GitHub/GitLab)

```bash
git clone <url-de-tu-repositorio>
cd bienesint
```

## 3. Configuración Inicial

1.  Abre la carpeta del proyecto en **Visual Studio Code** o simplemente navega a ella con la terminal (PowerShell o CMD).
2.  Asegúrate de que **Docker Desktop** esté abierto y corriendo (icono de la ballena verde).

## 4. Iniciar el Sistema

Ejecuta el siguiente comando en la terminal dentro de la carpeta del proyecto:

```bash
docker-compose up -d --build
```

- `up`: Levanta los servicios.
- `-d`: En modo "detach" (segundo plano, para liberar la terminal).
- `--build`: Fuerza a construir las imágenes desde cero (recomendado la primera vez).

Este proceso puede tardar unos minutos la primera vez, ya que descargará MySQL y configurará Node.js.

## 5. Verificar Instalación

Una vez termine el comando anterior:

1.  **Frontend**: Abre tu navegador y ve a [http://localhost](http://localhost) (o puerto 80). Deberías ver la pantalla de Login del sistema.
2.  **Backend**: Puedes probar [http://localhost:3000/api/health](http://localhost:3000/api/health) (o similar, según rutas) para ver si responde.

## 6. Solución de Problemas Comunes

- **Error "ports are not available"**: Si el puerto 3306 (MySQL) o 80 (Web) está ocupado, edita el archivo `docker-compose.yml` y cambia los puertos de la izquierda:
  ```yaml
  ports:
    - "8080:80" # Cambia a 8080 si el 80 falla
    - "3307:3306" # Tu configuración actual ya usa 3307 para evitar conflictos
  ```
- **Base de Datos Vacía**: El sistema está configurado para iniciar con los datos de `shared/database/init/01-intbienes.sql`. Si necesitas migrar datos reales, tendrás que exportar tu base de datos actual e importarla en la nueva máquina.

## 7. Comandos Útiles

- **Detener el sistema**: `docker-compose down`
- **Reiniciar solo el backend** (tras cambios de código): `docker-compose restart backend`
- **Ver logs**: `docker-compose logs -f`
