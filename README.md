# cv-multi-rol

CV digital de **Sebastian Morales** — ingeniero de automatización y transformación digital.

Una sola página, cinco variantes de posicionamiento, dos idiomas, panel de
administración privado y diez PDF generados desde base de datos.
Desplegado en cPanel (Conexcol) bajo Passenger, sobre MariaDB.

> ¿Primera vez? Empieza por **[GETTINGSTART.md](./GETTINGSTART.md)**.
> Este archivo explica *cómo está construido*; el otro, *cómo ponerlo a andar*.

---

## Descripción

El sitio es la demostración de lo que dice el CV: **el mismo dato, servido
según el contexto, sin trabajo manual.**

Un equipo de QA, uno de desarrollo y uno de datos buscan cosas distintas en la
misma trayectoria. Mantener cinco CV en paralelo, en dos idiomas, es exactamente
el tipo de trabajo repetitivo que este perfil se dedica a eliminar. Así que hay
un solo conjunto de datos y las variantes se resuelven con reglas de visibilidad
y prioridad en base de datos.

Editar una vez en `/admin` actualiza el sitio y los diez PDF sin redesplegar.

---

## Stack

| Capa | Decisión | Por qué |
|---|---|---|
| Framework | Next.js 16 App Router, TypeScript estricto, RSC por defecto | |
| Estilos | Tailwind + tokens CSS propios | |
| Base de datos | MariaDB vía **Drizzle** sobre `mysql2` | Prisma necesita un query engine binario compilado contra la glibc del host: en hosting compartido es la causa número uno de despliegues que fallan sin diagnóstico |
| Auth | Auth.js, credenciales, bcrypt coste 12, sesión 8 h, un solo admin | Sin registro ni recuperación por correo: cada una de esas rutas es superficie de ataque que este sitio no necesita |
| PDF | `@react-pdf/renderer` en route handler | Puppeteer/Chromium no existe en cPanel |
| 3D | `react-three-fiber`, techo 200 KB gzip, carga diferida | Fuera del presupuesto de 120 KB de `/` |
| Deploy | cPanel + Passenger, `output: 'standalone'` | Sin Docker, sin Edge, un solo proceso Node |

---

## Cómo está organizado

```
proxy.ts                  i18n + nonce de CSP   ← la pieza frágil del despliegue
next.config.ts            standalone
app.js                    arranque para Passenger
drizzle/0000_init.sql     migración ejecutable a mano si drizzle-kit falla

src/
  content/cv.ts           FUENTE DE VERDAD del contenido — ES/EN emparejado
  db/schema.ts            18 tablas, incluida `translation`
  db/client.ts            pool único, connectionLimit 5
  db/seed.ts              siembra §2 completo en los dos idiomas
  lib/i18n.ts             locales, diccionario de interfaz, formato de fechas
  lib/queries.ts          UNA lectura agregada por página + merge + reglas
  lib/actions.ts          escrituras: zod, sesión, audit_log, revalidateTag
  lib/seo.ts              metadata, hreflang, JSON-LD
  lib/rate-limit.ts       limitador en memoria
  lib/fonts.ts            los tres roles tipográficos
  auth.ts                 Auth.js
  components/
    boot-console.tsx      ELEMENTO FIRMA — isla de cliente
    sections.tsx          trayectoria, habilidades, trabajo, formación, contacto
    cv-page.tsx           composición del CV completo
    ambient.tsx           observador; carga la escena solo si procede
    ambient-scene.tsx     campo de puntos r3f — fuera del bundle inicial
    track.tsx             evento de vista, falla en silencio
  pdf/cv-document.tsx     PDF sobrio, compatible con ATS
  app/
    [locale]/             CV público: /, /v/[slug], /proyecto/[slug]
    admin/                panel privado
    cv.pdf/route.ts       generación con caché en disco
    api/track/route.ts    analítica sin cookies
    sitemap.ts robots.ts llms.txt/
scripts/spike.mjs         verificación de fase 0
```

---

## Las decisiones que conviene entender antes de tocar nada

### El español es la fuente de verdad; el inglés es un override

Las tablas base guardan español. El inglés vive en `translation` con clave
`(entity_type, entity_id, field, locale)`. Si falta un campo, cae al español:
**una traducción incompleta nunca deja un hueco en la página.**

En `src/content/cv.ts` cada campo traducible es un par `{ es, en }`, así que
TypeScript impide añadir contenido en un idioma y olvidarlo en el otro.
Verificado en el seed: 79 campos ES, 79 traducciones EN.

Los términos técnicos no se traducen: `Karate`, `Azure DevOps`, `Moodle`,
`Wompi`, `Scrum`, `Selenium`, `Robot Framework`.

### El inglés no es traducción, es reposicionamiento

| ES | EN | Por qué |
|---|---|---|
| Ingeniero de Automatización y Transformación Digital | Automation & Digital Transformation Engineer | Directo |
| Analista de Pruebas | **Test Automation Engineer** | *Test Analyst* describe en inglés a quien ejecuta casos ajenos — lo contrario de las viñetas de Galatea |
| Analista de Calidad | **QA Engineer** | *Quality Analyst* baja el nivel percibido fuera de Latinoamérica |
| QA Automation Sr. | **Senior QA Automation Engineer (SDET)** | *SDET* tiene más volumen de búsqueda |
| AI Automation Engineer | **Applied ML & AI Automation Engineer** | Lo primero atrae, lo segundo se sostiene en entrevista técnica |

### Una sola lectura agregada por página

`getCv(locale, variantSlug)` trae las tablas completas en un `Promise.all`,
indexa las traducciones en un `Map` y resuelve idioma y reglas en memoria.
Son unos cientos de filas: encadenar consultas filtradas costaría más viajes a
MariaDB y dispersaría el merge en diez sitios distintos.

Cacheado con la etiqueta `cv`. Publicar desde `/admin` la invalida.

### Las reglas de variante tienen un valor por defecto útil

Sin regla, un bloque **es visible y conserva su orden natural**. Solo se crea
fila en `variant_rule` cuando hay una excepción. Eso mantiene la tabla pequeña
y hace que añadir un bloque nuevo funcione sin tocar las cinco variantes.

### Las cifras salen de la base de datos, nunca del código

La consola del hero lee las métricas de `achievement.metric_value`. Corregir un
número en `/admin` lo cambia en el hero, en el cuerpo del CV, en el PDF y en
`llms.txt`. Las estimaciones honestas llevan `is_approximate` y se muestran con
`~` más la palabra «estimado» — nunca solo el símbolo, que no se lee en voz alta.

### El PDF no hereda la estética del sitio

Un ATS lee el archivo antes que una persona. Eso impone columna única lógica,
texto seleccionable, encabezados estándar, cero texto dentro de imágenes y cero
tablas de maquetación. La marca se reduce a un filete ámbar y a la jerarquía
tipográfica.

El ámbar del sitio (`#FFC14D`) no contrasta sobre blanco, así que el PDF usa
`#B26B00`. Es el mismo gesto de marca resuelto para otro soporte.

### La analítica no guarda nada identificable

`Event` registra tipo, ruta, variante, idioma y referrer. Sin cookies, sin IP,
sin país. La cabecera de IP se usa **solo** como llave del limitador en memoria
y nunca toca la base de datos.

### El limitador vive en memoria a propósito

Passenger corre un solo proceso: no hay instancias que sincronizar. Si algún día
hubiera más de un worker, `src/lib/rate-limit.ts` debe pasar a una tabla o a
Redis. Está anotado en el propio archivo.

---

## Accesibilidad y rendimiento

- **Contraste verificado par por par.** `--line` (#232739) da 1.3:1 sobre
  `--surface`: sirve para divisores decorativos, **no** para comunicar estado.
  Los controles usan `--muted` en reposo y `--phosphor` en foco. El anillo de
  foco es `--signal`, que sí contrasta.
- **El nivel de habilidad se comunica con texto además de color**: núcleo ·
  sólido · en uso. Nada depende solo del color.
- **Objetivos táctiles ≥ 44 px** en la consola y en el conmutador de variante.
- **Sin JavaScript el CV se lee entero.** La consola se renderiza en el
  servidor; el tecleo escalonado es CSS. Solo la búsqueda con `/` y las flechas
  necesitan JS, y degradan en silencio porque el conmutador son enlaces reales.
- **`prefers-reduced-motion` apaga todo**, incluida la pieza 3D.
- **Tres islas de cliente en el sitio público**, todas pequeñas:
  `boot-console.tsx` (el elemento firma), `track.tsx` (una llamada `fetch`) y
  `ambient.tsx` (solo el observador). La escena 3D vive en `ambient-scene.tsx`,
  que se importa con `dynamic(..., { ssr: false })` y **no entra en el bundle
  inicial**: bajo 768 px o con `prefers-reduced-motion` no se descarga nunca.
- **Numeración solo donde hay secuencia real**: la trayectoria la tiene, las
  habilidades y los proyectos no.

---

## Rutas

```
/                       CV público, variante por defecto, español
/v/[slug]               qa · dev · ai · solutions   (canonical → /, noindex)
/proyecto/[slug]        caso de estudio
/en  /en/v/[slug]  /en/proyecto/[slug]
/cv.pdf?v=qa&lang=en    descarga
/api/track              eventos anónimos
/sitemap.xml  /robots.txt  /llms.txt

/admin                  resumen: traducción pendiente, borradores, publicar
/admin/login            un solo administrador
/admin/variantes        edición lado a lado ES | EN + visibilidad y prioridad
/admin/perfil           datos de contacto y meta description
/admin/experiencia      puestos, logros y métricas
/admin/habilidades      nivel y evidencia
/admin/proyectos        casos de estudio y aprobación de borradores
/admin/pdf              los diez archivos, con enlace real
/admin/seo              políticas de crawlers de IA
/admin/analitica        panel de transparencia
```

El inglés usa `/en/proyecto/...`, no `/en/project/...`: un solo árbol de
archivos, sin rutas duplicadas que puedan divergir.

---

## Estado

| Fase | Alcance | Estado |
|---|---|---|
| 0 | Verificación en el hosting real | **pendiente** — `node scripts/spike.mjs` |
| 1 | Esquema, migraciones, seed, auth | hecho |
| 2 | CRUD del admin y sistema de variantes | hecho — variantes, perfil, experiencia, habilidades, proyectos, PDF, SEO |
| 3 | CV público bilingüe, casos de estudio, SEO | hecho |
| 4 | PDF por variante e idioma + caché | hecho |
| 5 | Analítica, transparencia, políticas de IA | hecho |
| 6 | View Transitions, pieza 3D | hecho |
| 7 | Auditoría Lighthouse/a11y + despliegue | pendiente |