# Sistema de Gestión de Bienes Institucionales

Sistema completo para la gestión de bienes institucionales con aplicación híbrida (web + móvil).

## 📁 Estructura del Proyecto

```
bienesint/
├── frontend/          # Aplicación Vue.js
│   ├── src/          # Código fuente Vue.js
│   ├── public/       # Archivos públicos
│   ├── dist/         # Build de producción
│   └── package.json  # Dependencias del frontend
├── backend/          # API Node.js/Express
│   ├── server.js     # Servidor principal
│   ├── controllers/  # Controladores
│   ├── routes/       # Rutas de la API
│   └── package.json  # Dependencias del backend
├── shared/           # Archivos compartidos
│   ├── basededatos/  # Scripts y archivos de BD
│   ├── uploads/      # Archivos subidos
│   ├── logs/         # Logs del sistema
│   ├── backups/      # Respaldos
│   ├── docker/       # Configuración Docker
│   └── firebase/     # Configuración Firebase
├── scripts/          # Scripts de utilidad
├── docs/             # Documentación
└── package.json      # Scripts principales
```

## 🚀 Instalación y Configuración

### Instalación Completa

```bash
# Instalar todas las dependencias
npm run install:all
```

### Instalación Individual

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
npm install
```

## 🏃‍♂️ Ejecución

### Desarrollo (Frontend + Backend)

```bash
# Ejecutar ambos servicios en desarrollo
npm run dev

# O ejecutar por separado
npm run dev:frontend  # Puerto 5173
npm run dev:backend   # Puerto 3000
```

### Producción

```bash
# Construir frontend
npm run build

# Iniciar backend
npm start
```

## 📱 Desarrollo Móvil

```bash
# Construir para móvil
npm run mobile:build

# Ejecutar en Android
npm run mobile:android

# Ejecutar en iOS
npm run mobile:ios
```

## 🐳 Docker

```bash
# Construir imágenes
npm run docker:build

# Iniciar servicios
npm run docker:up

# Ver logs
npm run docker:logs

# Detener servicios
npm run docker:down
```

## 🧪 Testing

```bash
# Tests del frontend
npm test

# Tests de la API
npm run test:api

# Tests de la base de datos
npm run test:db
```

## 🗄️ Base de Datos

```bash
# Configurar base de datos
npm run db:configure

# Ejecutar migraciones
npm run db:migrate

# Cargar datos de prueba
npm run db:seed

# Cargar datos completos
npm run data:load
```

## 🔧 Scripts Disponibles

### Frontend

- `dev` - Servidor de desarrollo
- `build` - Construir para producción
- `preview` - Vista previa de producción
- `lint` - Verificar código
- `format` - Formatear código

### Backend

- `start` - Iniciar servidor
- `dev` - Servidor de desarrollo con nodemon
- `test:api` - Probar endpoints
- `test:db` - Probar conexión a BD

### Móvil

- `mobile:build` - Construir para móvil
- `mobile:android` - Ejecutar en Android
- `mobile:ios` - Ejecutar en iOS
- `mobile:sync` - Sincronizar con Capacitor

## 📚 Documentación

La documentación completa se encuentra en el directorio `docs/`:

- [README Completo](docs/README-COMPLETO.md)
- [README Backend](docs/README-BACKEND.md)
- [Guía de Migración](docs/MIGRACION_README.md)
- [Mejoras Implementadas](docs/MEJORAS_IMPLEMENTADAS.md)

## 🔐 Configuración de Seguridad

El sistema incluye:

- Autenticación JWT
- Encriptación de contraseñas
- Validación de entrada
- Rate limiting
- Headers de seguridad

## 📊 Características

- ✅ Gestión completa de bienes
- ✅ Sistema de usuarios y roles
- ✅ Auditoría de cambios
- ✅ Reportes y exportación
- ✅ Aplicación móvil híbrida
- ✅ API REST completa
- ✅ Base de datos MySQL
- ✅ Interfaz moderna con Vue.js
- ✅ Sistema de notificaciones
- ✅ Backup automático

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia ISC.

---

**Desarrollado por:** Instituto Nelson Torres
