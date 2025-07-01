# 🏥 Clínica Salud

Bienvenido a la aplicación web de **Clínica Salud**. Esta plataforma te permite gestionar turnos médicos, visualizar historias clínicas, administrar usuarios y mucho más, todo desde una interfaz moderna y amigable.

---

## 🧭 Secciones de la Aplicación

### 1. **Pantalla de Inicio**
Pantalla de bienvenida con navegación hacia:
- Inicio
- Iniciar sesión
- Registro de nuevos usuarios

---

### 2. **Inicio**
Muestra una vista general de la clínica y acceso a las diferentes secciones según el tipo de usuario.

---

### 3. **Iniciar Sesión**
Accede con tu correo electrónico y contraseña para gestionar turnos médicos.

---

### 4. **Registro**
Registro para nuevos usuarios:
- Pacientes
- Especialistas (pueden asociar sus especialidades y datos profesionales)
- Al finalizar el registro se envía mediante un correo para validar el usuario

---

### 5. **Gestión de Usuarios (solo Administradores)**
Sección exclusiva para administradores, que permite:
- Gestionar habilitación/deshabilitación de especialistas
- Verificación de email
- Visualizar informes con gráficos en tiempo real o por rango de fechas:
  - Turnos por especialidad
  - Turnos por médico
  - Turnos por día
  - Log de ingresos
- Descargar reportes en PDF o Excel
- Visualizar y filtrar historias clínicas por paciente o especialista

---

### 6. **Solicitar Turnos**
- Selección de especialidad, profesional, fecha y horario disponible
- Los **administradores** pueden solicitar turnos en nombre de pacientes

---

### 7. **Mis Turnos**
- **Especialistas**: visualizan sus turnos, filtran por especialidad o paciente, cambios de estados, y completan historia clínica al finalizar
- **Pacientes**: visualizan sus turnos y completan encuesta de satisfacción post-consulta
- Visualización clara del estado de cada turno: solicitado, aceptado, realizado, cancelado, etc.

---

### 8. **Pacientes (solo para Especialistas)**
- Visualización de todos los pacientes que atendieron
- Acceso a su historial clínico completo
- Opción de descarga de historias clínicas en PDF

---

### 9. **Turnos de la Clínica (solo para Administradores)**
- Vista global de todos los turnos tomados
- Filtros por especialidad o profesional
- Posibilidad de cancelar turnos desde la administración

---

## 🩺 Historia Clínica
- Visualización detallada de atenciones médicas por paciente
- Filtro por especialista y paciente
- Campos dinámicos 
- Estilo visual con directivas personalizadas 
- Descarga en PDF por especialidad

---

## 👨‍⚕️ Especialistas
- Gestión de horarios por día
- Intervalos de 30 minutos configurables
- Interfaz dinámica con chips y botones
- Guardado individual de disponibilidad por día

---

## 👥 Pacientes
- Solicitud de turnos según especialidad y profesional
- Fechas en formato: `09 de Septiembre`
- Horarios en formato: `13:15`
- Soporte de funcionalidad extendida para administradores

---

## 🧱 Tecnologías Utilizadas

| Tecnología            | Uso                                   |
|-----------------------|---------------------------------------|
| Angular 17+           | Frontend principal                    |
| Supabase              | Backend como servicio (BaaS)          |
| Firebase Hosting      | Deploy de la app                      |
| NG Charts (Chart.js)  | Visualización de gráficos             |
| FileSaver + XLSX      | Exportaciones a Excel                 |
| jsPDF                 | Exportaciones a PDF                   |
| Bootstrap             | Estilos y layout responsive           |
| SCSS / Animaciones    | Estilo visual moderno y transiciones |

---

## 🧭 Navegación según Rol

| Rol           | Acceso a funcionalidades                                         |
|---------------|------------------------------------------------------------------|
| Administrador | Gestión de usuarios, informes, turnos globales, historia clínica |
| Especialista  | Gestión de turnos propios, pacientes, historias clínicas         |
| Paciente      | Solicitud y visualización de turnos, encuestas                   |

---

## 🧪 Próximas Mejoras

- Notificaciones por correo electrónico al tomar o cancelar turnos
- Adjuntar archivos médicos en historia clínica
- Mensajería interna entre paciente y profesional
- Dashboard con indicadores generales

---

## 👨‍💻 Autor

**Elias Teruel**  
📍 UTN Avellaneda | Técnico Superior en Sistemas  
💼 Experiencia en DevOps, Full Stack y automatización de despliegues  
📧 Contacto: https://www.linkedin.com/in/elias-teruel

---

