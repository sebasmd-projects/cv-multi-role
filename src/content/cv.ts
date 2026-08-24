/**
 * FUENTE DE VERDAD DEL CONTENIDO — ES/EN emparejado.
 *
 * Cada campo traducible es un par `{ es, en }` para que sea imposible añadir
 * contenido en un idioma y olvidarlo en el otro: TypeScript lo exige.
 *
 * REGLAS
 * 1. Ninguna cifra entra aquí sin estar confirmada por Sebastian (§3 del brief).
 *    Las estimaciones honestas llevan `approx: true` y se renderizan con "~".
 * 2. Los términos técnicos NO se traducen (Karate, Azure DevOps, Scrum, Moodle).
 * 3. El inglés no es traducción literal: es reposicionamiento para ATS y
 *    reclutadores anglosajones. Ver README §"Posicionamiento en inglés".
 */

export type T = { es: string; en: string };

/* ── Contacto ───────────────────────────────────────────────────── */

export const contact = {
  fullName: 'Sebastian Morales',
  email: 'sebasmoralesd@gmail.com',
  phone: '+57 300 295 4040',
  location: {
    es: 'Colombia · disponible para remoto',
    en: 'Colombia · open to remote',
  } satisfies T,
  // CADUCADO EN EL BRIEF: decía "Disponible desde abril 2026" y ya es agosto.
  // Una fecha pasada le dice al reclutador "llevo meses sin colocarme".
  availability: {
    es: 'Disponible ahora · Abierto a propuestas',
    en: 'Available now · Open to opportunities',
  } satisfies T,
  links: [
    { kind: 'linkedin' as const, label: 'LinkedIn', url: 'https://www.linkedin.com/in/sebasti%C3%A1n-morales-delgado-33902b1a1/' },
    { kind: 'github' as const, label: 'GitHub', url: 'https://github.com/sebasmd-projects' },
    { kind: 'web' as const, label: 'sebasmoralesd.com', url: 'https://sebasmoralesd.com' },
  ],
};

/* ── Perfil ─────────────────────────────────────────────────────── */

export const profileContent = {
  headline: {
    es: 'Ingeniero de Automatización y Transformación Digital',
    en: 'Automation & Digital Transformation Engineer',
  } satisfies T,
  subtitle: {
    es: 'QA Automation · Backend Python/Java · Integración de sistemas · IA aplicada',
    en: 'QA Automation · Python/Java Backend · Systems Integration · Applied AI',
  } satisfies T,
  summary: {
    es:
      'Ingeniero de automatización con 9 años construyendo el puente entre cómo trabaja un negocio y cómo debería funcionar su software. Mapeo procesos operativos, identifico lo que consume tiempo manual y lo reemplazo con frameworks de automatización, integraciones de API y pipelines CI/CD. Trabajo con Python (Django, DRF), Java (Spring) y Next.js, y he validado sistemas críticos de banca, salud y e-commerce, incluidos modelos de Machine Learning en entornos regulados. Mi criterio de éxito no es la cobertura de pruebas: es cuánto trabajo humano deja de existir.',
    en:
      'Automation engineer with 9 years building the bridge between how a business actually works and how its software should behave. I map operational processes, find where manual time is lost, and replace it with automation frameworks, API integrations and CI/CD pipelines. I work with Python (Django, DRF), Java (Spring) and Next.js, and I have validated business-critical systems in banking, healthcare and e-commerce, including Machine Learning models in regulated environments. My measure of success is not test coverage: it is how much human work stops existing.',
  } satisfies T,
  // Máx. 155 caracteres — verificado en scripts/spike.mjs
  summaryShort: {
    es: 'Ingeniero de automatización y transformación digital. 9 años en QA, backend Python/Java e integración de sistemas en banca, salud y e-commerce.',
    en: 'Automation and digital transformation engineer. 9 years in QA, Python/Java backend and systems integration across banking, health and e-commerce.',
  } satisfies T,
};

/* ── Variantes ──────────────────────────────────────────────────── */

export const variants = [
  {
    slug: 'automatizacion',
    isDefault: true,
    label: { es: 'Automatización', en: 'Automation' } satisfies T,
    headline: profileContent.headline,
    summary: profileContent.summary,
    pdf: {
      es: 'Sebastian-Morales-Ingeniero-Automatizacion.pdf',
      en: 'Sebastian-Morales-Automation-Engineer.pdf',
    },
  },
  {
    slug: 'qa',
    isDefault: false,
    label: { es: 'QA', en: 'QA' } satisfies T,
    headline: {
      es: 'QA Automation Engineer / Analista de Calidad Sr.',
      en: 'Senior QA Automation Engineer (SDET)',
    } satisfies T,
    summary: {
      es:
        'Especialista en calidad con 9 años diseñando estrategias de prueba basadas en riesgo sobre sistemas críticos de banca, salud y e-commerce. Construyo frameworks de automatización propios (Selenium, Karate, Robot Framework, Appium) integrados a pipelines CI/CD, y cubro el espectro completo: contratos de API, E2E sobre microservicios, rendimiento con JMeter y validación de modelos de Machine Learning en entornos regulados. Priorizo cobertura donde el negocio pierde dinero, no donde es fácil automatizar.',
      en:
        'Quality specialist with 9 years designing risk-based test strategies for business-critical systems in banking, healthcare and e-commerce. I build in-house automation frameworks (Selenium, Karate, Robot Framework, Appium) wired into CI/CD pipelines, covering the full spectrum: API contracts, E2E across microservices, performance with JMeter, and Machine Learning model validation in regulated environments. I put coverage where the business loses money, not where automation is easy.',
    } satisfies T,
    pdf: {
      es: 'Sebastian-Morales-QA-Automation.pdf',
      en: 'Sebastian-Morales-Senior-QA-Automation-Engineer.pdf',
    },
  },
  {
    slug: 'dev',
    isDefault: false,
    label: { es: 'Desarrollo', en: 'Development' } satisfies T,
    headline: {
      es: 'Desarrollador Full Stack (Python · Java · Next.js)',
      en: 'Full Stack Software Engineer (Python · Java · Next.js)',
    } satisfies T,
    summary: {
      es:
        'Desarrollador full stack con 9 años entregando producto de extremo a extremo: desde el modelo de datos y las APIs REST hasta la interfaz que usa el área operativa. He construido plataformas de e-learning, e-commerce con pasarela de pagos, CRM y ERP sobre arquitectura de microservicios, con Python (Django, DRF), Java (Spring) y Next.js. Diseño pensando en quién mantiene el sistema después de mí: POO, SOLID y pruebas automatizadas desde el primer commit.',
      en:
        'Full stack engineer with 9 years shipping product end to end: from the data model and REST APIs to the interface the operations team actually uses. I have built e-learning platforms, e-commerce with payment gateways, CRM and ERP systems on microservice architectures, using Python (Django, DRF), Java (Spring) and Next.js. I design for whoever maintains the system after me: OOP, SOLID and automated tests from the first commit.',
    } satisfies T,
    pdf: {
      es: 'Sebastian-Morales-Full-Stack.pdf',
      en: 'Sebastian-Morales-Full-Stack-Software-Engineer.pdf',
    },
  },
  {
    slug: 'ai',
    isDefault: false,
    label: { es: 'IA', en: 'AI' } satisfies T,
    headline: {
      es: 'Ingeniero de Automatización con IA aplicada',
      en: 'Applied ML & AI Automation Engineer',
    } satisfies T,
    summary: {
      es:
        'Ingeniero que lleva modelos de Machine Learning a producción en entornos regulados. Construí un clasificador de origen de enfermedad laboral que combina reglas normativas con Decision Trees y SVM, con NLP sobre historias clínicas y análisis de imágenes médicas, elevando la precisión del 60% al 85% con cumplimiento total del manual de calificación. Mi diferencial no es entrenar modelos: es validarlos — precisión, consistencia, trazabilidad y auditabilidad de cada dictamen.',
      en:
        'Engineer who takes Machine Learning models into production inside regulated environments. I built an occupational-disease origin classifier combining statutory rules with Decision Trees and SVM, with NLP over clinical records and medical image analysis, lifting accuracy from 60% to 85% with full compliance to the official assessment manual. My edge is not training models: it is validating them — accuracy, consistency, traceability and auditability of every verdict.',
    } satisfies T,
    pdf: {
      es: 'Sebastian-Morales-IA-Automatizacion.pdf',
      en: 'Sebastian-Morales-Applied-ML-Engineer.pdf',
    },
  },
  {
    slug: 'solutions',
    isDefault: false,
    label: { es: 'Solutions', en: 'Solutions' } satisfies T,
    headline: {
      es: 'Solutions / Business Systems Engineer',
      en: 'Solutions Engineer · Business Systems',
    } satisfies T,
    summary: {
      es:
        'Ingeniero que traduce entre el área operativa y el equipo técnico. Entro a un proceso que se hace a mano, lo mapeo, encuentro dónde se pierde el tiempo y construyo el sistema que lo elimina. Unifiqué CRM, ERP, plataforma e-learning y e-commerce en un solo ecosistema con 40 endpoints de integración, sustituyendo hojas de cálculo por dashboards con indicadores reales. Mido el resultado en horas de trabajo humano que dejan de existir.',
      en:
        'Engineer who translates between operations and the technical team. I step into a process that is still done by hand, map it, find where the time is lost, and build the system that removes it. I unified CRM, ERP, e-learning and e-commerce into a single ecosystem with 40 integration endpoints, replacing spreadsheets with dashboards built on real indicators. I measure the outcome in hours of human work that stop existing.',
    } satisfies T,
    pdf: {
      es: 'Sebastian-Morales-Solutions-Engineer.pdf',
      en: 'Sebastian-Morales-Solutions-Engineer.pdf',
    },
  },
];

/* ── Experiencia ────────────────────────────────────────────────── */

type Achievement = {
  text: T;
  metric?: { label: T; value: string; approx?: boolean };
};

export const experiences: Array<{
  role: T;
  company: string;
  client?: string;
  mode: 'remoto' | 'hibrido' | 'presencial' | 'paralelo';
  startDate: string;
  endDate: string | null;
  context: T;
  achievements: Achievement[];
  tech: string[];
}> = [
  {
    // "Analista de Pruebas" → "Test Automation Engineer": ver README.
    role: {
      es: 'Analista de Pruebas · célula Galatea',
      en: 'Test Automation Engineer · Galatea squad',
    },
    company: 'Choucair Testing',
    client: 'Bancolombia',
    mode: 'hibrido',
    startDate: '2024-09',
    endDate: '2026-03',
    context: {
      es: 'Soporte y mejora continua de sistemas críticos de banca sobre arquitectura de microservicios, en preproducción y producción.',
      en: 'Continuous support and improvement of business-critical banking systems on a microservice architecture, across pre-production and production.',
    },
    achievements: [
      {
        text: {
          es: 'Construí y mantuve suites automatizadas end-to-end sobre flujos críticos de negocio, integradas en pipelines de Azure DevOps, sustituyendo la validación manual en cada liberación.',
          en: 'Built and maintained end-to-end automated suites over business-critical flows, wired into Azure DevOps pipelines, replacing manual validation on every release.',
        },
        metric: {
          label: { es: 'Flujos críticos automatizados', en: 'Critical flows automated' },
          value: '32',
        },
      },
      {
        text: {
          es: 'Eliminé el ciclo de regresión manual, que consumía tres días laborales de un analista por liberación.',
          en: 'Eliminated the manual regression cycle, which consumed three working days of an analyst per release.',
        },
        metric: {
          label: { es: 'Regresión por ciclo', en: 'Regression per cycle' },
          value: '12 h → 1 h',
        },
      },
      {
        text: {
          es: 'Liberé horas de validación manual por analista en cada ciclo de liberación, reasignadas a análisis de riesgo y pruebas exploratorias.',
          en: 'Freed manual validation hours per analyst on every release cycle, reallocated to risk analysis and exploratory testing.',
        },
        metric: {
          label: { es: 'Validación manual eliminada', en: 'Manual validation removed' },
          value: '24 h',
          approx: true,
        },
      },
      {
        text: {
          es: 'Automaticé la validación de APIs REST con Karate, cubriendo contratos, lógica de negocio y flujos completos entre microservicios.',
          en: 'Automated REST API validation with Karate, covering contracts, business logic and complete flows across microservices.',
        },
      },
      {
        text: {
          es: 'Diseñé pruebas de aceptación para procesos ETL en AWS Glue, garantizando integridad y trazabilidad de datos críticos desde la ingesta hasta el consumo.',
          en: 'Designed acceptance tests for AWS Glue ETL processes, guaranteeing integrity and traceability of critical data from ingestion through consumption.',
        },
      },
      {
        text: {
          es: 'Reduje el tiempo de resolución de incidentes en producción aplicando análisis de causa raíz, con workarounds inmediatos y correcciones definitivas.',
          en: 'Cut production incident resolution time through root cause analysis, pairing immediate workarounds with permanent fixes.',
        },
      },
      {
        text: {
          es: 'Ejecuté pruebas de rendimiento con JMeter, identificando cuellos de botella antes de que impactaran a usuarios finales.',
          en: 'Ran performance tests with JMeter, surfacing bottlenecks before they reached end users.',
        },
      },
      {
        text: {
          es: 'Apliqué estrategia de pruebas basada en riesgo para priorizar la cobertura donde el negocio realmente lo necesitaba.',
          en: 'Applied risk-based test strategy to concentrate coverage where the business actually needed it.',
        },
      },
    ],
    tech: ['Karate', 'Azure DevOps', 'AWS Glue', 'JMeter', 'Microservicios', 'SQL', 'Git', 'Scrum', 'AWS Cognito', 'Docker'],
  },
  {
    role: {
      es: 'Desarrollador Full Stack + Analista de Calidad',
      en: 'Full Stack Developer & QA Engineer',
    },
    company: 'Fundación Agua Viva',
    mode: 'remoto',
    startDate: '2022-01',
    endDate: '2024-08', // AJUSTADO: resuelve el solapamiento con Choucair.
    context: {
      es: 'Un ecosistema disperso de herramientas administrativas, académicas y de venta que había que unificar.',
      en: 'A scattered ecosystem of administrative, academic and sales tools that had to be unified.',
    },
    achievements: [
      {
        text: {
          es: 'Integré CRM, ERP y plataforma e-learning (Moodle) en un solo sistema con arquitectura de microservicios y APIs REST, centralizando procesos operativos, financieros y académicos que antes vivían separados.',
          en: 'Integrated CRM, ERP and the Moodle e-learning platform into a single system on a microservice architecture with REST APIs, centralising operational, financial and academic processes that previously lived apart.',
        },
        metric: {
          label: { es: 'Endpoints de integración', en: 'Integration endpoints' },
          value: '40',
        },
      },
      {
        text: {
          es: 'Sustituí el CRM y el ERP en hojas de cálculo por módulos de plataforma, eliminando la gestión manual de certificados, notas, cursos, reportes y matrículas.',
          en: 'Replaced the spreadsheet-based CRM and ERP with platform modules, removing manual handling of certificates, grades, courses, reports and enrolments.',
        },
        metric: {
          label: { es: 'Sistemas unificados', en: 'Systems unified' },
          value: '4',
        },
      },
      {
        text: {
          es: 'Sostuve la operación académica de la plataforma a lo largo de mi periodo.',
          en: 'Supported the platform’s academic operation throughout my tenure.',
        },
        metric: {
          label: { es: 'Estudiantes por semestre', en: 'Students per term' },
          value: '10–30',
          approx: true,
        },
      },
      {
        text: {
          es: 'Implementé e-commerce con pasarela Wompi, asegurando transacciones auditables de extremo a extremo.',
          en: 'Implemented e-commerce with the Wompi payment gateway, making transactions auditable end to end.',
        },
      },
      {
        text: {
          es: 'Consumí los servicios web de Moodle para sincronizar usuarios, cursos y evaluaciones automáticamente, eliminando la carga manual de datos académicos.',
          en: 'Consumed Moodle web services to synchronise users, courses and assessments automatically, removing manual entry of academic data.',
        },
      },
      {
        text: {
          es: 'Desarrollé dashboards de métricas e indicadores para que las decisiones operativas dejaran de tomarse sobre hojas de cálculo.',
          en: 'Built metrics and indicator dashboards so operational decisions stopped being made on spreadsheets.',
        },
      },
      {
        text: {
          es: 'Construí frameworks de automatización propios para web y APIs (Selenium, Karate) y pruebas móviles multi-dispositivo, estandarizando la validación de cada entrega.',
          en: 'Built in-house automation frameworks for web and APIs (Selenium, Karate) plus multi-device mobile testing, standardising validation on every delivery.',
        },
      },
      {
        text: {
          es: 'Diseñé el sistema de roles y permisos que hizo viable centralizar la información sin perder control de acceso.',
          en: 'Designed the roles and permissions system that made centralising the data viable without losing access control.',
        },
      },
    ],
    tech: ['Python', 'Django', 'JavaScript', 'Java', 'Moodle', 'Wompi', 'Selenium', 'Karate', 'JMeter', 'Appium', 'Jira', 'GitLab', 'SQL', 'POO/SOLID'],
  },
  {
    role: {
      es: 'Desarrollador Full Stack + Analista de Calidad',
      en: 'Full Stack Developer & QA Engineer',
    },
    company: 'Esstrategia S.A.S',
    mode: 'presencial',
    startDate: '2017-01',
    endDate: '2021-12',
    context: {
      es: 'Plataforma médica para calificar pérdida de capacidad laboral y determinar el origen de una enfermedad (laboral o común) — un proceso regulado que se hacía a mano sobre historias clínicas.',
      en: 'A medical platform to assess occupational disability and determine whether a condition is work-related or ordinary — a regulated process previously done by hand over clinical records.',
    },
    achievements: [
      {
        text: {
          es: 'Diseñé y desarrollé el sistema de clasificación de origen combinando las reglas del manual de calificación con modelos de Machine Learning (Decision Trees, SVM).',
          en: 'Designed and built the origin classification system, combining the statutory assessment manual’s rules with Machine Learning models (Decision Trees, SVM).',
        },
        metric: {
          label: { es: 'Precisión del clasificador', en: 'Classifier accuracy' },
          value: '60% → 85%',
        },
      },
      {
        text: {
          es: 'Alcancé el cumplimiento total del manual de calificación PCLO (pérdida de capacidad laboral y ocupacional) en cada dictamen emitido.',
          en: 'Reached full compliance with the PCLO occupational disability assessment manual on every verdict issued.',
        },
        metric: {
          label: { es: 'Cumplimiento del manual PCLO', en: 'PCLO manual compliance' },
          value: '100%',
        },
      },
      {
        text: {
          es: 'Implementé análisis de imágenes (radiografías, documentos) y NLP sobre historias clínicas para extraer los datos que antes leía una persona.',
          en: 'Implemented image analysis (X-rays, documents) and NLP over clinical records to extract the data a person used to read manually.',
        },
      },
      {
        text: {
          es: 'Construí mecanismos de autoevaluación y autocorrección de los modelos para sostener la coherencia de los dictámenes en escenarios variables.',
          en: 'Built self-evaluation and self-correction mechanisms so the models held verdict consistency across variable scenarios.',
        },
      },
      {
        text: {
          es: 'Validé los modelos como QA en un entorno regulado: precisión, consistencia, trazabilidad y auditabilidad de cada resultado.',
          en: 'Validated the models as QA inside a regulated environment: accuracy, consistency, traceability and auditability of every result.',
        },
      },
      {
        text: {
          es: 'Automaticé el testing con Robot Framework (Python) y suites para APIs REST y microservicios integrados a múltiples fuentes de datos clínicos.',
          en: 'Automated testing with Robot Framework (Python) plus suites for REST APIs and microservices integrated with multiple clinical data sources.',
        },
      },
      {
        text: {
          es: 'Sumé una plataforma e-learning para certificar médicos laborales y módulos CRM/ERP con dashboards operativos.',
          en: 'Added an e-learning platform to certify occupational physicians, plus CRM/ERP modules with operational dashboards.',
        },
      },
    ],
    tech: ['Python', 'Scikit-Learn', 'NLP', 'Procesamiento de imágenes', 'Robot Framework', 'PostgreSQL', 'MongoDB', 'Docker', 'JMeter', 'Cucumber', 'Git'],
  },
];

/* ── Habilidades ────────────────────────────────────────────────── */

type Tier = 'nucleo' | 'solido' | 'en_uso';

export const skillGroups: Array<{ name: T; skills: Array<[string, Tier]> }> = [
  {
    name: { es: 'Automatización e integración', en: 'Automation & integration' },
    skills: [
      ['Frameworks de automatización (diseño propio)', 'nucleo'],
      ['Selenium WebDriver', 'nucleo'],
      ['Karate', 'nucleo'],
      ['Robot Framework', 'nucleo'],
      ['APIs REST', 'nucleo'],
      ['Appium', 'solido'],
      ['Page Object Model', 'solido'],
      ['Screenplay', 'solido'],
      ['Serenity BDD', 'en_uso'],
      ['Cucumber', 'solido'],
      ['ETL', 'solido'],
    ],
  },
  {
    name: { es: 'Desarrollo', en: 'Development' },
    skills: [
      ['Python (Django, DRF)', 'nucleo'],
      ['Java (Spring, Maven, Gradle)', 'solido'],
      ['JavaScript', 'solido'],
      ['Next.js', 'solido'],
      ['React', 'solido'],
      ['Pandas / NumPy', 'solido'],
      ['POO · SOLID · FIRST', 'nucleo'],
      ['HTML/CSS', 'solido'],
      ['C#', 'en_uso'],
    ],
  },
  {
    name: { es: 'Datos e IA', en: 'Data & AI' },
    skills: [
      ['SQL / PL/SQL', 'nucleo'],
      ['PostgreSQL', 'solido'],
      ['MongoDB', 'solido'],
      ['MariaDB', 'solido'],
      ['Machine Learning (Scikit-Learn)', 'solido'],
      ['NLP', 'solido'],
      ['Procesamiento de imágenes', 'solido'],
      ['Decision Trees · SVM', 'solido'],
      ['Dashboards e indicadores', 'solido'],
      ['Business Analytics', 'en_uso'],
    ],
  },
  {
    name: { es: 'Calidad', en: 'Quality' },
    skills: [
      ['Estrategia de pruebas basada en riesgo', 'nucleo'],
      ['E2E · UI · API', 'nucleo'],
      ['Regresión · Smoke · Funcionales', 'nucleo'],
      ['Rendimiento (JMeter)', 'solido'],
      ['BDD · TDD · ATDD · DDT', 'solido'],
      ['Caja negra y blanca', 'solido'],
      ['Estimación y planes de prueba', 'solido'],
      ['Accesibilidad', 'en_uso'],
    ],
  },
  {
    name: { es: 'Infraestructura y flujo de trabajo', en: 'Infrastructure & workflow' },
    skills: [
      ['Git · GitLab · GitHub', 'nucleo'],
      ['Azure DevOps', 'nucleo'],
      ['CI/CD', 'nucleo'],
      ['Docker', 'solido'],
      ['Postman', 'solido'],
      ['Jira · Bugtracking', 'solido'],
      ['Scrum', 'solido'],
      ['AWS Glue', 'en_uso'],
      ['AWS Cognito', 'en_uso'],
    ],
  },
  {
    name: { es: 'Negocio y equipo', en: 'Business & collaboration' },
    skills: [
      ['Análisis de procesos', 'nucleo'],
      ['Traducción negocio↔técnica', 'nucleo'],
      ['Comunicación con áreas operativas', 'nucleo'],
      ['Trabajo remoto y asíncrono', 'nucleo'],
      ['Gestión de proyectos TI', 'solido'],
      ['Gestión del cambio', 'solido'],
      ['Pensamiento analítico', 'nucleo'],
    ],
  },
];

/* ── Muestra de trabajo ─────────────────────────────────────────── */
/* BORRADOR: redactado a partir de §2.3 y §3 del brief. `isDraft: true`
   bloquea la publicación hasta que Sebastian los revise uno por uno.     */

export const projects = [
  {
    slug: 'clasificador-origen-enfermedad-laboral',
    featured: true,
    isConfidential: true,
    title: {
      es: 'Clasificador de origen de enfermedad laboral',
      en: 'Occupational disease origin classifier',
    } satisfies T,
    problem: {
      es: 'Determinar si una enfermedad es de origen laboral o común es un proceso regulado que un equipo médico resolvía leyendo historias clínicas, radiografías y documentos a mano. Cada dictamen dependía del criterio del profesional que lo firmara, lo que hacía difícil sostener la coherencia entre casos comparables.',
      en: 'Deciding whether a condition is work-related or ordinary is a regulated process that a medical team resolved by reading clinical records, X-rays and documents by hand. Every verdict depended on whoever signed it, which made consistency across comparable cases hard to sustain.',
    } satisfies T,
    decision: {
      es: 'No sustituir al médico por un modelo, sino codificar primero las reglas del manual de calificación PCLO como capa determinista y usar Machine Learning solo donde el manual admite interpretación. Un modelo puro habría sido imposible de auditar ante un ente regulador.',
      en: 'Not to replace the physician with a model, but to encode the PCLO assessment manual as a deterministic layer first, and apply Machine Learning only where the manual allows interpretation. A pure model would have been impossible to audit before a regulator.',
    } satisfies T,
    architecture: {
      es: 'Extracción con NLP sobre historias clínicas y análisis de imágenes sobre radiografías y documentos escaneados; motor de reglas del manual PCLO; clasificadores Decision Tree y SVM (Scikit-Learn) sobre las variables resultantes; capa de autoevaluación que contrasta la salida del modelo con la del motor de reglas y marca las divergencias para revisión humana.',
      en: 'NLP extraction over clinical records plus image analysis over X-rays and scanned documents; a rules engine for the PCLO manual; Decision Tree and SVM classifiers (Scikit-Learn) over the resulting variables; and a self-evaluation layer that contrasts model output against the rules engine and flags divergences for human review.',
    } satisfies T,
    result: {
      es: 'La precisión de clasificación del tipo de origen pasó del 60% al 85%, con cumplimiento del 100% del manual PCLO en cada dictamen emitido y trazabilidad completa de cómo se llegó a cada resultado.',
      en: 'Origin classification accuracy went from 60% to 85%, with 100% compliance to the PCLO manual on every verdict issued and full traceability of how each result was reached.',
    } satisfies T,
    learning: {
      es: 'En un dominio regulado, la explicabilidad no es un extra: es el requisito que decide si el sistema puede usarse. El motor de reglas no fue una limitación del modelo, fue lo que lo hizo desplegable.',
      en: 'In a regulated domain, explainability is not an extra: it is the requirement that decides whether the system can be used at all. The rules engine was not a limitation on the model — it was what made it deployable.',
    } satisfies T,
  },
  {
    slug: 'unificacion-crm-erp-moodle-ecommerce',
    featured: true,
    isConfidential: true,
    title: {
      es: 'Unificación de CRM, ERP, Moodle y e-commerce',
      en: 'Unifying CRM, ERP, Moodle and e-commerce',
    } satisfies T,
    problem: {
      es: 'La operación vivía repartida entre hojas de cálculo para CRM y ERP, una plataforma Moodle aparte y ventas sin trazabilidad. Matrículas, notas, certificados y reportes se movían a mano entre sistemas que no se hablaban, y cada indicador exigía reconstruir los datos desde cero.',
      en: 'Operations lived split across spreadsheets for CRM and ERP, a separate Moodle instance and sales with no traceability. Enrolments, grades, certificates and reports moved by hand between systems that did not talk to each other, and every indicator required rebuilding the data from scratch.',
    } satisfies T,
    decision: {
      es: 'Integrar en lugar de reemplazar. Moodle funcionaba bien como plataforma académica, así que se conservó y se consumieron sus servicios web, en vez de migrar contenido a un sistema nuevo. El esfuerzo se concentró en la capa de integración y en el modelo de roles y permisos.',
      en: 'Integrate rather than replace. Moodle worked well as an academic platform, so it was kept and its web services consumed instead of migrating content into something new. The effort went into the integration layer and the roles and permissions model.',
    } satisfies T,
    architecture: {
      es: 'Microservicios en Python/Django expuestos como APIs REST, con unos 40 endpoints de integración; sincronización automática de usuarios, cursos y evaluaciones contra los servicios web de Moodle; e-commerce con pasarela Wompi para transacciones auditables; dashboards de indicadores sobre la base unificada; sistema transversal de roles y permisos.',
      en: 'Python/Django microservices exposed as REST APIs, with around 40 integration endpoints; automatic synchronisation of users, courses and assessments against Moodle web services; e-commerce with the Wompi gateway for auditable transactions; indicator dashboards over the unified data; and a cross-cutting roles and permissions system.',
    } satisfies T,
    result: {
      es: 'Cuatro sistemas colapsaron en uno. La gestión de certificados, notas, cursos, reportes y matrículas dejó de hacerse a mano, y la operación académica sostuvo entre 10 y 30 estudiantes por semestre sin carga manual de datos.',
      en: 'Four systems collapsed into one. Certificate, grade, course, report and enrolment handling stopped being manual, and the academic operation supported between 10 and 30 students per term with no manual data entry.',
    } satisfies T,
    learning: {
      es: 'Centralizar información sin resolver antes el control de acceso es una forma elegante de crear un problema nuevo. El sistema de roles no fue un módulo más: fue el requisito que hizo viable todo lo demás.',
      en: 'Centralising information before solving access control is an elegant way to create a new problem. The roles system was not just another module: it was the requirement that made everything else viable.',
    } satisfies T,
  },
  {
    slug: 'automatizacion-e2e-apis-banca',
    featured: true,
    isConfidential: true,
    title: {
      es: 'Automatización E2E y de APIs en banca',
      en: 'E2E and API automation in banking',
    } satisfies T,
    problem: {
      es: 'Cada liberación de los sistemas críticos exigía un ciclo de regresión manual de unas doce horas — tres días laborales de un analista — sobre flujos de negocio que atravesaban múltiples microservicios. El cuello de botella no era construir, era validar.',
      en: 'Every release of the business-critical systems required roughly twelve hours of manual regression — three working days for an analyst — over business flows crossing multiple microservices. The bottleneck was not building; it was validating.',
    } satisfies T,
    decision: {
      es: 'Cubrir primero los contratos de API con Karate antes que la interfaz. Los fallos de integración entre microservicios eran más caros y más frecuentes que los de UI, y una suite de contratos es más rápida y más estable que una E2E equivalente.',
      en: 'Cover API contracts with Karate before touching the interface. Integration failures between microservices were costlier and more frequent than UI ones, and a contract suite is faster and more stable than the equivalent E2E.',
    } satisfies T,
    architecture: {
      es: 'Suites Karate para contratos, lógica de negocio y flujos entre microservicios; suites E2E sobre los flujos críticos de negocio; ejecución integrada en pipelines de Azure DevOps disparada en cada liberación; JMeter para escenarios de rendimiento; priorización de cobertura por estrategia basada en riesgo.',
      en: 'Karate suites for contracts, business logic and cross-microservice flows; E2E suites over the critical business flows; execution wired into Azure DevOps pipelines triggered on every release; JMeter for performance scenarios; coverage prioritised by risk-based strategy.',
    } satisfies T,
    result: {
      es: '32 flujos críticos automatizados y el ciclo de regresión reducido de 12 horas manuales a 1 hora automatizada, liberando unas 24 horas de validación por analista y ciclo para análisis de riesgo y pruebas exploratorias.',
      en: '32 critical flows automated and the regression cycle cut from 12 manual hours to 1 automated hour, freeing around 24 hours of validation per analyst per cycle for risk analysis and exploratory testing.',
    } satisfies T,
    learning: {
      es: 'La automatización que se ejecuta a mano no elimina trabajo, lo mueve. El valor apareció cuando la suite dejó de ser algo que alguien lanza y pasó a ser algo que el pipeline exige.',
      en: 'Automation that someone has to launch does not remove work, it relocates it. The value appeared when the suite stopped being something a person runs and became something the pipeline demands.',
    } satisfies T,
  },
  {
    slug: 'validacion-etl-aws-glue',
    featured: false,
    isConfidential: true,
    title: {
      es: 'Validación de ETL en AWS Glue',
      en: 'ETL validation on AWS Glue',
    } satisfies T,
    problem: {
      es: 'Los procesos ETL movían datos críticos desde la ingesta hasta el consumo, pero la validación se hacía por muestreo al final de la cadena. Un error de transformación intermedio podía llegar a un consumidor sin que nadie lo detectara hasta que el dato ya se había usado.',
      en: 'ETL processes moved critical data from ingestion through consumption, but validation was sampled at the end of the chain. A mid-chain transformation error could reach a consumer unnoticed until the data had already been used.',
    } satisfies T,
    decision: {
      es: 'Tratar el pipeline de datos como un sistema con contratos, no como un script. Definir criterios de aceptación por etapa — integridad, trazabilidad, conformidad de esquema — en vez de verificar únicamente el resultado final.',
      en: 'Treat the data pipeline as a system with contracts, not as a script. Define acceptance criteria per stage — integrity, traceability, schema conformity — instead of only checking the final output.',
    } satisfies T,
    architecture: {
      es: 'Pruebas de aceptación sobre los jobs de AWS Glue con verificación de integridad referencial y conteos entre etapas, validación de esquema en cada transformación y consultas SQL de reconciliación entre origen y destino.',
      en: 'Acceptance tests over AWS Glue jobs with referential integrity and row-count checks between stages, schema validation at each transformation, and SQL reconciliation queries between source and destination.',
    } satisfies T,
    result: {
      es: 'Integridad y trazabilidad garantizadas de extremo a extremo sobre los datos críticos, con los errores de transformación detectados en la etapa donde se originan y no en el consumidor final.',
      en: 'Integrity and traceability guaranteed end to end over the critical data, with transformation errors caught at the stage where they originate rather than at the final consumer.',
    } satisfies T,
    learning: {
      es: 'Un dato incorrecto que pasa la validación es más costoso que un pipeline caído: el segundo se nota, el primero se propaga.',
      en: 'Bad data that passes validation costs more than a broken pipeline: the second one is noticed, the first one spreads.',
    } satisfies T,
  },
  {
    slug: 'este-sitio',
    featured: true,
    isConfidential: false,
    repoUrl: 'https://github.com/sebasmd-projects/cv-multi-rol',
    liveUrl: 'https://sebasmoralesd.com',
    title: {
      es: 'Este sitio',
      en: 'This site',
    } satisfies T,
    problem: {
      es: 'Un mismo perfil se lee distinto según quién lo evalúa: un equipo de QA, uno de desarrollo y uno de datos buscan cosas diferentes en la misma trayectoria. Mantener cinco CV en paralelo, en dos idiomas, es exactamente el tipo de trabajo manual que este perfil se dedica a eliminar.',
      en: 'The same profile reads differently depending on who evaluates it: a QA team, a development team and a data team look for different things in the same career. Maintaining five parallel CVs in two languages is exactly the kind of manual work this profile exists to remove.',
    } satisfies T,
    decision: {
      es: 'Un solo conjunto de datos, cinco variantes de posicionamiento y dos idiomas resueltos por reglas de visibilidad y prioridad en base de datos, no por archivos duplicados. Editar una vez en el panel actualiza el sitio y los diez PDF sin volver a desplegar.',
      en: 'One dataset, five positioning variants and two languages resolved through visibility and priority rules in the database, not duplicated files. Editing once in the admin panel updates the site and all ten PDFs without redeploying.',
    } satisfies T,
    architecture: {
      es: 'Next.js App Router con TypeScript estricto y componentes de servidor por defecto; MariaDB vía Drizzle sobre mysql2; Auth.js para el panel privado; generación de PDF por variante e idioma con @react-pdf/renderer y caché en disco por hash; analítica sin cookies, sin IP y sin país; desplegado en cPanel bajo Passenger en modo standalone.',
      en: 'Next.js App Router with strict TypeScript and server components by default; MariaDB via Drizzle over mysql2; Auth.js for the private admin; per-variant, per-language PDF generation with @react-pdf/renderer cached on disk by hash; cookieless analytics with no IP and no country; deployed on cPanel under Passenger in standalone mode.',
    } satisfies T,
    result: {
      es: 'El repositorio es público y el sitio es la demostración: el mismo dato, servido según el contexto, sin trabajo manual.',
      en: 'The repository is public and the site is the demonstration: the same data, served according to context, with no manual work.',
    } satisfies T,
    learning: {
      es: 'Las restricciones del hosting compartido — sin Docker, sin edge, un solo proceso Node — obligaron a decisiones más simples y más rápidas de las que habría tomado con infraestructura ilimitada.',
      en: 'The constraints of shared hosting — no Docker, no edge, a single Node process — forced simpler and faster decisions than unlimited infrastructure would have.',
    } satisfies T,
  },
];

/* ── Formación ──────────────────────────────────────────────────── */

export const education = [
  {
    institution: 'Fundación Universitaria Católica del Norte',
    title: { es: 'Ingeniería Informática', en: 'Computer Engineering' } satisfies T,
    level: { es: 'Pregrado', en: 'Bachelor’s degree' } satisfies T,
    status: 'en_curso' as const,
    startDate: '2020-01',
    endDate: null,
  },
];

export const certifications = [
  {
    institution: 'Universidad Choucair',
    name: { es: 'Metodología de testing Choucair', en: 'Choucair testing methodology' } satisfies T,
    status: 'culminado' as const,
    startDate: '2024-09',
    endDate: '2024-10',
  },
  {
    institution: 'Udemy',
    name: { es: 'Machine Learning', en: 'Machine Learning' } satisfies T,
    status: 'culminado' as const,
    startDate: '2018-01',
    endDate: '2018-12',
  },
  {
    institution: 'Udemy',
    name: { es: 'Java', en: 'Java' } satisfies T,
    status: 'culminado' as const,
    startDate: '2017-01',
    endDate: '2017-12',
  },
  {
    institution: 'Udemy',
    name: { es: 'Python', en: 'Python' } satisfies T,
    status: 'culminado' as const,
    startDate: '2017-01',
    endDate: '2017-12',
  },
];

export const languages = [
  { name: { es: 'Español', en: 'Spanish' } satisfies T, level: 'Nativo / Native', reading: 'nativo', writing: 'nativo', speaking: 'nativo' },
  { name: { es: 'Inglés', en: 'English' } satisfies T, level: 'B2', reading: 'B2', writing: 'B2', speaking: 'B2' },
];

/* ── Palabras clave SEO (§10) ───────────────────────────────────── */

export const knowsAbout = {
  es: [
    'Automatización de procesos', 'QA Automation', 'Python', 'Java',
    'Machine Learning', 'Microservicios', 'CI/CD', 'Karate', 'Selenium',
    'Transformación digital', 'RPA', 'Integración de sistemas',
  ],
  en: [
    'Process automation', 'QA Automation', 'Python', 'Java',
    'Machine Learning', 'Microservices', 'CI/CD', 'Karate', 'Selenium',
    'Digital transformation', 'RPA', 'Systems integration',
  ],
};
