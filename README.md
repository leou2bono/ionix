# Prueba tecnica Ionix – Gestión de Usuarios, Roles y Tareas

API REST en **Node.js + Express + MongoDB** que implementa autenticación JWT y control de acceso por roles (Administrador, Ejecutor, Auditor).  
Permite gestionar usuarios, tareas y comentarios con reglas de negocio específicas.

---

## 🚀 Características principales

- **Login con JWT** y control de acceso por rol.
- **Roles soportados:**
  - **Administrador:** CRUD de usuarios (solo Ejecutores/Auditores) y CRUD de tareas (restricciones de estado).
  - **Ejecutor:** listar tareas propias, actualizar estado si no vencida, comentar tareas vencidas.
  - **Auditor:** visualizar todas las tareas y sus estados.
- **Contraseñas temporales:** los usuarios deben cambiarla en el primer login.
- **Estados de tarea:** `Asignado`, `En_Progreso`, `Completada`, `Vencida`.

---



