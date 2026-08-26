# Puesta en marcha

De cero a sitio publicado. Sigue el orden: cada paso asume el anterior.

**Tiempo estimado:** 40 min en local, 30 min en el servidor.

---

## Antes de empezar

| Necesitas | Valor en este proyecto |
|---|---|
| Node | 22.x (el hosting reporta 22.23.2) |
| Base de datos | MariaDB en cPanel |
| Dominio | sebasmoralesd.com |
| Hosting | Conexcol, cPanel con Node.js Selector (Passenger) |

El **build corre en tu máquina**, no en el servidor. Al servidor solo suben los
archivos ya compilados. Eso evita depender de la memoria y las herramientas del
hosting compartido, y hace que un fallo de build no tumbe el sitio en vivo.

---

## Parte 1 — Local

### 1. Instalar

```bash
git clone https://github.com/sebasmd-projects/cv-multi-rol.git
cd cv-multi-rol
npm install
```

### 2. Crear la base de datos en cPanel

En **cPanel → MySQL® Databases**:

1. Crea la base: `cv` → queda como `cpaneluser_cv`
2. Crea el usuario: `cvadmin` → queda como `cpaneluser_cvadmin`
3. Añade el usuario a la base con **ALL PRIVILEGES**
4. En **Remote MySQL**, añade tu IP si vas a sembrar desde tu máquina

> **Verifica la codificación.** En phpMyAdmin, la base debe decir
> `utf8mb4_unicode_ci`. Con `latin1`, los acentos y las flechas `→` de tus
> métricas se corrompen **sin dar error** y solo lo notarías con el PDF ya
> publicado. Si sale mal:
> ```sql
> ALTER DATABASE `cpaneluser_cv` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> ```

### 3. Configurar el entorno

```bash
cp .env.example .env
```

Rellena `.env`:

```bash
DB_HOST=localhost          # o la IP del servidor si siembras en remoto
DB_NAME=cpaneluser_cv
DB_USER=cpaneluser_cvadmin
DB_PASSWORD=…

AUTH_URL=https://sebasmoralesd.com
AUTH_SECRET=…              # genera: openssl rand -base64 32
ADMIN_EMAIL=sebasmoralesd@gmail.com
ADMIN_PASSWORD_HASH=…      # ver paso 4

SITE_URL=https://sebasmoralesd.com
UPLOADS_DIR=/home/cpaneluser/public_html/uploads
PDF_CACHE_DIR=/home/cpaneluser/tmp/pdf-cache
CRON_TOKEN=…               # genera: openssl rand -hex 24
```

### 4. Generar la contraseña del admin

```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" 'TU-CONTRASEÑA'
```

Pega el resultado en `ADMIN_PASSWORD_HASH`. **La contraseña en claro no se
guarda en ningún archivo.**

### 5. Crear las tablas

```bash
npm run db:generate    # genera drizzle/*.sql desde src/db/schema.ts
npm run db:migrate     # aplica sobre MariaDB
npm run db:charset     # base y tablas a utf8mb4
```

El sitio cachea el CV por etiqueta durante una hora y solo lo invalida al
publicar desde `/admin`. Sembrar desde la terminal pasa por fuera de eso: si el
servidor de desarrollo ya estaba corriendo, reinícialo o no verás los cambios.

`db:charset` no es opcional. cPanel crea las bases en `latin1_swedish_ci` y las
tablas heredan ese juego de caracteres: las tildes pasan, pero «→» se guarda
como «?» y no se recupera salvo volviendo a sembrar. Ejecútalo antes del seed.

> Si `db:migrate` falla por permisos sobre `INFORMATION_SCHEMA` —pasa en
> hosting compartido— abre **phpMyAdmin → SQL** y pega `drizzle/0000_init.sql`
> tal cual. Hace exactamente lo mismo.

### 6. Sembrar el contenido

```bash
npm run db:seed
```

Salida esperada:

```
→ Perfil
→ Variantes
→ Experiencia
→ Habilidades
→ Proyectos (isDraft = true hasta revisión)
→ Formación
→ Traducciones EN: 79 campos
✔ Seed completo.
```

> El seed **trunca y vuelve a sembrar**. No lo ejecutes contra una base con
> ediciones hechas desde `/admin` sin exportar antes.

### 7. Levantar en local

```bash
npm run dev
```

Comprueba, en este orden:

| URL | Qué debes ver |
|---|---|
| `http://localhost:3000` | CV en español, consola con las cinco métricas |
| `http://localhost:3000/en` | El mismo CV en inglés |
| `http://localhost:3000/v/qa` | Titular de QA, contenido reordenado |
| `http://localhost:3000/cv.pdf?v=qa&lang=en` | PDF que se abre y cuyo texto se puede seleccionar |
| `http://localhost:3000/llms.txt` | Texto plano con la trayectoria completa |
| `http://localhost:3000/admin` | Login |

**Prueba también sin JavaScript** (DevTools → Settings → Debugger → Disable
JavaScript). El CV debe leerse entero: la consola aparece completa, sin animar.
Si algo desaparece, hay una regresión.

### 8. Compilar

```bash
npm run build
```

---

## Parte 2 — Servidor

### 9. Crear la aplicación Node en cPanel

**cPanel → Setup Node.js App → Create Application**

| Campo | Valor |
|---|---|
| Node.js version | 22.23.2 |
| Application mode | Production |
| Application root | `cv-multi-rol` |
| Application URL | sebasmoralesd.com |
| Application startup file | `app.js` |

Añade en **Environment variables** todas las de tu `.env`. **No subas el
archivo `.env` al servidor**: cPanel las inyecta él.

### 10. Subir los archivos

Solo estos cuatro, dentro de `~/cv-multi-rol/`:

```
.next/standalone/     ← el servidor compilado
.next/static/         → copiar a .next/standalone/.next/static/
public/               → copiar a .next/standalone/public/
app.js
package.json
scripts/              ← para poder correr el spike
```

Las dos copias del medio son fáciles de olvidar y el síntoma es un sitio sin
estilos ni imágenes:

```bash
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

### 11. Verificar el entorno (fase 0)

En **cPanel → Terminal**:

```bash
cd ~/cv-multi-rol
source /home/cpaneluser/nodevenv/cv-multi-rol/22/bin/activate
node scripts/spike.mjs
```

Debe salir todo en verde:

```
✔  Node >= 22                    v22.23.2
✔  Entorno Passenger             PORT=…
✔  MariaDB + utf8mb4             10.11.x · utf8mb4/utf8mb4_unicode_ci
✔  Uploads escribible            /home/…/uploads
✔  Caché PDF escribible          /home/…/tmp/pdf-cache
✔  @react-pdf/renderer en memoria  38.4 KB generados
✔  Memoria disponible            RSS actual 62 MB
```

**Cualquier ✖ se resuelve antes de seguir.** Los dos que más aparecen:

- *Caché PDF no escribible* → `mkdir -p ~/tmp/pdf-cache && chmod 755 ~/tmp/pdf-cache`
- *charset latin1* → vuelve al paso 2 y corrige la base **antes** de sembrar

### 12. Arrancar

En **Setup Node.js App**, pulsa **Restart**. Luego:

```
https://sebasmoralesd.com
```

### 13. Forzar HTTPS y dominio canónico

En `~/public_html/.htaccess`, **antes** del bloque de Passenger:

```apache
RewriteEngine On

# HTTPS obligatorio
RewriteCond %{HTTPS} !=on
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Un solo dominio: sin www
RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
RewriteRule ^(.*)$ https://%1/$1 [R=301,L]
```

Sin esto tendrías cuatro URL para el mismo CV (`http`, `https`, con y sin
`www`) y el buscador repartiría la autoridad entre ellas.

---

## Parte 3 — Verificación

Recorre esta lista con el sitio ya en vivo:

- [ ] `/` carga y la consola muestra las cinco métricas
- [ ] `/en` muestra el CV en inglés
- [ ] Cambiar de variante reordena el contenido y cambia el titular
- [ ] `/cv.pdf?v=qa&lang=en` descarga con **texto seleccionable** y enlaces vivos
- [ ] El nombre del archivo PDF cambia según variante e idioma
- [ ] `/robots.txt` incluye `Sitemap:` y bloquea `/admin`
- [ ] `/sitemap.xml` lista `/` y los casos de estudio publicados
- [ ] `/llms.txt` devuelve texto plano legible
- [ ] `/admin` pide login y rechaza una contraseña incorrecta
- [ ] Editar en `/admin` y pulsar **Publicar** se refleja en `/` sin redesplegar
- [ ] Sin JavaScript, el CV se lee entero
- [ ] Navegación completa con teclado, con foco visible sobre fondo oscuro
- [ ] Sin errores en consola
- [ ] Responsive de 320 px a 2560 px

Y luego, en Lighthouse móvil: **95+ en las cuatro categorías**.

---

## Uso diario

### Cambiar contenido

`/admin` → editar → **Publicar**. El sitio y los diez PDF se refrescan solos.
No hace falta redesplegar.

### Traducir al inglés

`/admin/variantes` → columna **EN**. Se guarda al salir de cada campo.
Vaciar un campo borra la traducción y ese campo vuelve a mostrar el español.

El contador del panel dice cuántos campos siguen sin traducir.

### Aprobar un caso de estudio

`/admin` → **Pendientes de revisión** → **Revisar** → aprobar.
Hasta entonces no aparece en el sitio ni en el PDF.

### Actualizar el código

```bash
# En local
git pull && npm install && npm run build

# Subir .next/standalone, .next/static, public (paso 10)
# cPanel → Setup Node.js App → Restart
```

### Volver atrás

Antes de cada despliegue, en el servidor:

```bash
cp -r ~/cv-multi-rol ~/cv-multi-rol.backup-$(date +%F)
```

Para revertir: renombra la carpeta de vuelta y pulsa **Restart**. La base de
datos no se toca en un despliegue, así que el contenido sobrevive intacto.

---

## Cuando algo falla

| Síntoma | Causa habitual | Solución |
|---|---|---|
| 503 de Passenger | Falta `.next/standalone` o `app.js` | Revisa el paso 10 |
| Sitio sin estilos | No copiaste `.next/static` | `cp -r .next/static .next/standalone/.next/static` |
| Acentos rotos, `→` corrupto | Base en `latin1` | Paso 2, y **volver a sembrar** |
| `/cv.pdf` da 500 | `PDF_CACHE_DIR` no escribible | `mkdir -p ~/tmp/pdf-cache` |
| `/admin` en bucle de login | `AUTH_URL` mal | Deben coincidir con el dominio real |
| Todo en español pese a `/en` | `proxy.ts` no se ejecuta | Ver abajo |
| 429 al descargar | Limitador: 10 PDF por minuto | Es lo esperado; espera un minuto |

### Si `proxy.ts` no se ejecuta bajo Passenger

Es el riesgo conocido de este despliegue, y por eso la fase 0 va primero.
El respaldo está pensado y cuesta un día, no un rediseño:

1. Mueve la CSP de `proxy.ts` a `headers()` en `next.config.ts`, con
   `'strict-dynamic'` y sin nonce.
2. Sustituye el rewrite de idioma por dos árboles físicos: `app/(es)/` y
   `app/en/`, ambos renderizando `CvPage` con distinto `locale`.

En Next 15 el archivo se llama `middleware.ts`; el contenido no cambia.