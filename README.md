# 🌐 Derecho Virtual - Asistente Legal con IA

Este proyecto es una plataforma web desarrollada con Vite, React, TypeScript y Supabase que permite a usuarios registrados interactuar con un asistente legal virtual llamado **LexIA**, especializado en derecho español y europeo. El sistema soporta tanto OpenAI (GPT-4.1) como Google Gemini como proveedores de IA, definidos mediante clave API almacenada localmente.

---

## 🚀 Tecnologías principales

* **Frontend**: React + Vite + TypeScript
* **UI Framework**: shadcn/ui con Tailwind CSS
* **Backend**: Supabase (PostgreSQL + Auth + Storage)
* **IA**: OpenAI GPT-4.1 o Google Gemini 1.5-pro (por clave API)

---

## 🔄 Características implementadas

* ✉️ Registro e inicio de sesión con Supabase Auth
* 📅 Historial de mensajes por usuario guardado en la tabla `messages`
* 🧰 Interfaz de chat completa con timestamps, scroll y entrada
* 🔐 Configuración de proveedor IA (OpenAI o Gemini) con almacenamiento seguro en `localStorage`
* 🚪 Cierre de sesión y limpieza de almacenamiento local
* 🌟 Prompt del sistema ajustado para consultas legales
* 🔎 Navegación limpia con `react-router-dom`
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
2. Ingresa tu clave API en la sección "API Key".
3. Escoge proveedor: `OpenAI` o `Google Gemini`
4. Realiza tus preguntas legales y revisa el historial

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

