# 🌐 Derecho Virtual - Asistente Legal con IA

Este proyecto es una plataforma web desarrollada con Vite, React, TypeScript y Supabase que permite a usuarios registrados interactuar con un asistente legal virtual llamado **LexIA**, especializado en derecho español y europeo. El sistema soporta tanto OpenAI (GPT-4.1) como Google Gemini como proveedores de IA, definidos mediante clave API almacenada localmente.

---

## 🚀 Tecnologías principales

* **Frontend**: React + Vite + TypeScript
* **UI Framework**: shadcn/ui con Tailwind CSS
* **Backend**: Supabase (PostgreSQL + Auth + Storage)
* **IA**: OpenAI GPT-4.1, Google Gemini 1.5-pro (por clave API), o LM Studio (servidor local)

---

## 🔄 Características implementadas

* ✉️ Registro e inicio de sesión con Supabase Auth con diseño mejorado
* 📅 Historial de mensajes por usuario guardado en la tabla `messages`
* 🧰 Interfaz de chat completa con diseño moderno, animaciones y soporte para LM Studio (servidor local)
* 🔐 Configuración de proveedor IA (OpenAI, Gemini o LM Studio) con almacenamiento seguro en `localStorage` y manejo inteligente de la API Key
* 🚪 Cierre de sesión y limpieza de almacenamiento local
* 🌟 Prompt del sistema ajustado para consultas legales
* 🔎 Navegación limpia con `react-router-dom`
* 🎨 Diseño y experiencia de usuario (UI/UX) mejorados en las páginas de login, signup, chat y configuración de API Key
* 🔧 Estructura modular y escalable con `src/components`, `src/pages`, `src/hooks`, etc.

---

## 🌐 Configuración local

### Requisitos previos

* Node.js (>= 18)
* Supabase project configurado con tabla `messages`

### Instalación

```bash
# Clona el repositorio
git clone https://github.com/Pabandres85/Derecho-virtual.git
cd Derecho-virtual

# Instala dependencias
npm install

# Ejecuta en modo desarrollo
npm run dev
```

---

## 🐳 Docker

Para compilar y ejecutar el proyecto usando Docker, no necesitas tener Node.js ni npm instalados localmente. Docker se encargará de gestionar el entorno de compilación y ejecución.

### Requisitos previos de Docker

* Docker Desktop (o Docker Engine) instalado y funcionando.

### Construcción de la imagen Docker

Para construir la imagen de Docker, navega a la raíz del proyecto (donde se encuentra el `Dockerfile`) y ejecuta el siguiente comando:

```bash
docker build -t derecho-virtual .
```

Este comando creará una imagen Docker llamada `derecho-virtual` que contiene la aplicación compilada y un servidor Nginx configurado para servirla.

### Ejecución del contenedor Docker

Una vez que la imagen ha sido construida, puedes ejecutar la aplicación en un contenedor Docker utilizando el siguiente comando:

```bash
docker run -p 80:80 derecho-virtual
```

Esto mapeará el puerto 80 del contenedor al puerto 80 de tu máquina local, permitiéndote acceder a la aplicación desde tu navegador web en `http://localhost:80` (o la dirección IP de tu máquina si estás en un entorno diferente).

El contenedor usará la configuración de Nginx (`nginx.conf`) y servirá los archivos estáticos de la aplicación.

---

## 🔢 Configuración de Supabase

### Tabla `messages`

```sql
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamp with time zone default now()
);
```

### Seguridad (RLS)

```sql
alter table public.messages enable row level security;
create policy "Users can insert their messages"
  on public.messages for insert
  with check (auth.uid() = user_id);

create policy "Users can select their messages"
  on public.messages for select
  using (auth.uid() = user_id);
```

---

## 📊 Uso

1. Regístrate con email y contraseña.
2. Ve a la sección "API Key" para configurar tu proveedor de IA.
3. Escoge tu proveedor preferido: `OpenAI`, `Google Gemini`, o `LM Studio (Servidor Local)`.
   *   Para `OpenAI` o `Google Gemini`, introduce tu clave API. Si seleccionas `LM Studio`, el campo de la clave API se ocultará ya que no es necesaria.
4. Haz clic en "Guardar Clave".
5. Vuelve al chat y realiza tus preguntas legales. El historial de mensajes se guardará automáticamente.

---

## 🌟 Créditos

Desarrollado por [Pabandres85](https://github.com/Pabandres85)

---

## 🚨 Licencia

Este proyecto es de uso educativo y prototípico. No sustituye asesoría legal profesional. Puedes usarlo bajo los términos de la licencia MIT.

---

## ✨ Mejoras futuras (sugerencias)

* Exportar historial a PDF
* Modo oscuro
* Integración con jurisprudencia (BOE, EUR-Lex)
* Chat en tiempo real con WebSockets
* Notificaciones push y PWA

---

Si deseas colaborar, mejora el README, abre un PR o contacta al autor. ¡Gracias por visitar Derecho Virtual!

