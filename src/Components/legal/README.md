# Páginas Legales - PullMai

Este directorio contiene las páginas legales para la aplicación PullMai, cumpliendo con las regulaciones de protección de datos de Chile y la Unión Europea.

## Páginas Creadas

### 1. Términos y Condiciones (`TermsAndConditions.tsx`)
- **Ruta**: `/terms`
- **Propósito**: Define los términos de uso de la plataforma PullMai
- **Contenido incluye**:
  - Aceptación de términos
  - Descripción del servicio de gestión de contratos
  - Registro y responsabilidades del usuario
  - Uso aceptable de la plataforma
  - Propiedad intelectual
  - Seguridad de datos
  - Limitación de responsabilidad
  - Ley aplicable (Chile)

### 2. Política de Privacidad (`PrivacyPolicy.tsx`)
- **Ruta**: `/privacy`
- **Propósito**: Explica cómo se recopilan, usan y protegen los datos personales
- **Cumplimiento legal**:
  - Ley N° 19.628 sobre Protección de la Vida Privada (Chile)
  - Reglamento General de Protección de Datos (RGPD - UE)
- **Contenido incluye**:
  - Tipos de datos recopilados
  - Finalidades del tratamiento
  - Base legal para el procesamiento
  - Derechos del usuario (acceso, rectificación, supresión, etc.)
  - Seguridad de datos implementada
  - Transferencias internacionales
  - Conservación de datos
  - Información de contacto para ejercer derechos

## Características de Diseño

### Consistencia Visual
- **Colores**: Usa la paleta de colores definida en `tailwind.config.cjs`
  - `primary-600` para enlaces y acentos
  - `neutral-900` para títulos
  - `neutral-700` para texto principal
- **Iconos**: Heroicons para mantener consistencia con el resto de la app
- **Layout**: Diseño responsivo con contenedor centrado máximo de 4xl

### Navegación
- **Enlaces de retorno**: Botón "Volver al registro" que lleva a `/signup`
- **Enlaces internos**: Referencias cruzadas entre términos y política de privacidad
- **Rutas definidas** en `App.tsx`:
  - `/terms` → `TermsAndConditions`
  - `/privacy` → `PrivacyPolicy`

### Experiencia de Usuario
- **Animaciones**: Usa las clases de animación definidas en Tailwind
- **Responsive**: Diseño adaptado para móvil y escritorio
- **Legibilidad**: Tipografía clara con espaciado adecuado
- **Accesibilidad**: Estructura semántica con headers apropiados

## Integración con el Sistema

### ModernSignup.tsx
Las páginas legales están integradas con el formulario de registro:
```tsx
<Link to="/terms" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
  términos y condiciones
</Link>
<Link to="/privacy" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
  política de privacidad
</Link>
```

### Rutas Públicas
Ambas páginas son accesibles sin autenticación, permitiendo que los usuarios las revisen antes de registrarse.

## Consideraciones Legales

### Protección de Datos en Chile
- Cumple con la Ley N° 19.628
- Define claramente el responsable del tratamiento
- Especifica los derechos del titular de datos
- Establece procedimientos para ejercer derechos

### RGPD (Unión Europea)
- Base legal clara para cada tipo de procesamiento
- Derechos extendidos (portabilidad, oposición, etc.)
- Información sobre transferencias internacionales
- Contacto del Delegado de Protección de Datos

### Funcionalidades de PullMai Cubiertas
- Gestión de contratos y organizaciones
- Sistema de roles y permisos (RBAC)
- Almacenamiento de documentos PDF
- Colaboración entre organizaciones
- Importación/exportación de datos
- Auditoría y registros de actividad

## Mantenimiento

### Actualizaciones Necesarias
- **Fecha**: Actualizar automáticamente la fecha de última modificación
- **Contacto**: Reemplazar información de contacto placeholder
- **Legal**: Revisar periódicamente para conformidad legal
- **Funcionalidades**: Actualizar cuando se agreguen nuevas características

### Localización
Las páginas están en español para usuarios de Chile. Para expansión internacional, considerar:
- Traducción a otros idiomas
- Adaptación a marcos legales locales
- URLs localizadas (`/es/terms`, `/en/terms`, etc.)

## Archivos Relacionados

- `src/Components/App.tsx` - Configuración de rutas
- `src/Components/auth/ModernSignup.tsx` - Integración con formulario
- `tailwind.config.cjs` - Configuración de estilos
- `src/Components/legal/` - Directorio de páginas legales

## Próximos Pasos Recomendados

1. **Revisión Legal**: Hacer revisar por un abogado especializado en protección de datos
2. **Personalización**: Actualizar información de contacto y direcciones reales
3. **Testing**: Verificar navegación y responsive design
4. **SEO**: Agregar meta tags apropiados para mejor indexación
5. **Analytics**: Considerar tracking de visualizaciones para compliance
