# Frontend TP DAO - Polymorph Rides

Aplicacion frontend para la gestion de una empresa de alquiler de autos.
Incluye modulos de clientes, empleados, autos, alquileres, sanciones, mantenimiento, seguros y reportes.

## Tecnologias usadas

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- daisyUI
- Lucide React (iconos)
- Wouter (ruteo)
- Axios (consumo de API)
- Recharts + jsPDF (graficos y exportacion)

## Requisitos previos

- Node.js 20 o superior (recomendado)
- npm (viene con Node)
- Backend corriendo en `http://localhost:3000`

Nota: Este frontend consume endpoints hardcodeados a `localhost:3000` en los servicios de `src/services`.

## Como levantar el proyecto

1. Clonar el repositorio.
2. Instalar dependencias:

```bash
npm install
```

3. Levantar en desarrollo:

```bash
npm run dev
```

4. Abrir la URL que muestra Vite en consola (normalmente `http://localhost:5173`).

## Scripts utiles

```bash
npm run dev      # Levanta el proyecto en modo desarrollo
npm run build    # Compila TypeScript y genera build de produccion
npm run preview  # Previsualiza el build generado
npm run lint     # Ejecuta ESLint
```

## Que pueden probar en la app

Desde la home se navega a estos modulos principales:

- Gestion integral: clientes, empleados y autos.
- Alquileres y sanciones: alta de alquileres, sanciones y tipos de danos.
- Mantenimiento: ordenes de mantenimiento y detalle por orden.
- Reportes y estadisticas: panel de metricas, reportes y exportacion.
- Seguros: gestion de seguros y tipos de seguros.

Rutas principales (definidas en `src/main.tsx`):

- `/`
- `/clients-employees-cars`
- `/car-rentals`
- `/add-rental`
- `/sanciones`
- `/tipos-danos`
- `/car-maintenance`
- `/stadistic`
- `/car-insurance`

## Uso de Lucide React (iconos)

El paquete ya esta instalado y se usa en muchos componentes.

1. Importar el icono:

```tsx
import { Plus, Search } from "lucide-react";
```

2. Usarlo como componente React:

```tsx
<button className="btn btn-primary">
  <Plus size={16} />
  Crear
</button>
```

Consejos:

- Se puede controlar tamano con `size={16}` y grosor con `strokeWidth={1.75}`.
- Para color/tamano via CSS, usar clases Tailwind (`className="w-4 h-4 text-base-content"`).

## Uso de daisyUI

`daisyUI` ya esta configurado en `src/index.css` con:

- `@plugin "daisyui";`
- `@plugin "daisyui/theme" { ... }`

Es decir, ya hay un tema propio (`mytheme`) activo por defecto.

### Ejemplos rapidos

Boton:

```tsx
<button className="btn btn-secondary">Guardar</button>
```

Card:

```tsx
<div className="card bg-base-200 shadow-xl">
  <div className="card-body">
    <h2 className="card-title">Auto</h2>
    <p>Detalle del vehiculo</p>
  </div>
</div>
```

Input:

```tsx
<input className="input input-bordered w-full" placeholder="Buscar..." />
```

## Donde tocar estilos

- Estilos globales y tema: `src/index.css`
- Componentes de UI: `src/components/*`

Si quieren cambiar colores base del sistema, editen las variables `--color-*` del bloque de tema en `src/index.css`.

## Conexion con backend

Los servicios estan en `src/services`.
La mayoria apunta a rutas como:

- `http://localhost:3000/api/autos`
- `http://localhost:3000/api/rentals`
- `http://localhost:3000/api/mantenimiento`
- `http://localhost:3000/api/reportes`

Si el backend corre en otro host/puerto, actualicen esas URLs.

## Problemas comunes

- Error de CORS o `Network Error`: verificar que el backend este prendido en `localhost:3000`.
- Pantalla en blanco al iniciar: revisar consola del navegador y correr `npm run lint`.
- No cargan estilos: confirmar que `src/index.css` este importado en `src/main.tsx`.

## Equipo (facu)

Sugerencia de flujo para trabajar entre companeros:

1. Cada feature en su rama (`feature/nombre-corto`).
2. Commits chicos y descriptivos.
3. Antes de mergear: `npm run lint` y probar navegacion basica.

No tengan miedo de probar cosas! 
