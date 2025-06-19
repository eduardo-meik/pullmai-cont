# Datos de Ejemplo para ContractHub

Este directorio contiene datos de ejemplo para poblar la base de datos de ContractHub con contratos realistas que demuestran todas las funcionalidades del sistema.

## 📋 Contenido

### Contratos Incluidos

Los datos de ejemplo incluyen **13 contratos** distribuidos en **7 proyectos diferentes**:

#### 🔧 Sistema ERP (2 contratos)
- **Desarrollo de Sistema ERP**: Contrato principal de desarrollo
- **Licencias de Software ERP**: Licencias anuales del sistema

#### 🏢 Expansión Oficinas (2 contratos)
- **Arrendamiento Oficina Principal**: Contrato de arriendo mensual
- **Mobiliario y Equipamiento**: Suministro de mobiliario

#### 📱 Marketing Digital (2 contratos)
- **Campaña Publicitaria Digital**: Servicios de marketing mensual
- **Producción de Contenido Audiovisual**: Contenido trimestral

#### 👥 Recursos Humanos (2 contratos)
- **Consultoría en Gestión del Talento**: Servicios de consultoría
- **Contrato Gerente de Ventas**: Contrato laboral

#### 🌍 Ventas Internacionales (2 contratos)
- **Acuerdo de Distribución Internacional**: Contrato de distribución
- **Servicios de Traducción**: Traducción de documentos

#### 🔧 Mantenimiento y Soporte (2 contratos)
- **Mantenimiento de Equipos Informáticos**: Soporte técnico mensual
- **Suministro de Material de Oficina**: Suministros mensuales

#### 📊 Auditoría y Compliance (1 contrato)
- **Auditoría Financiera Anual 2023**: Servicios de auditoría externa

### Ejemplos de Estados
- **Activos**: Contratos en ejecución actual
- **Aprobados**: Contratos listos para comenzar
- **En Revisión**: Contratos pendientes de aprobación
- **Borrador**: Contratos en preparación
- **Vencidos**: Contratos que ya terminaron
- **Renovados**: Contratos que fueron renovados

## 🚀 Cómo usar

### Opción 1: Desde la Interfaz (Recomendado)

1. Inicia sesión como administrador
2. Ve a la sección de administración
3. Busca el componente "Poblar Base de Datos"
4. Haz clic en "Poblar Base de Datos"
5. Espera a que se complete el proceso

### Opción 2: Desde Script

```bash
# Ejecutar el script directamente
npm run populate-db

# O usando Node.js
node src/scripts/poblarBaseDatos.ts
```

### Opción 3: Programáticamente

```typescript
import { poblarBaseDatos } from './scripts/poblarBaseDatos'

// Ejecutar la población
await poblarBaseDatos()
```

## 🧹 Limpiar Datos

Para eliminar todos los contratos de ejemplo:

### Desde la Interfaz
1. Ve al componente "Poblar Base de Datos"
2. Haz clic en "Limpiar Datos de Ejemplo"

### Programáticamente
Los contratos de ejemplo se marcan con `metadatos.origen = 'datos-ejemplo'` para facilitar su identificación y eliminación.

## 📊 Características Destacadas

### Variedad de Datos
- **Montos**: Desde $2.4M hasta $85M CLP
- **Duraciones**: Desde contratos únicos hasta 3 años
- **Periodicidad**: Único, mensual, trimestral, semestral, anual
- **Categorías**: Servicios, compras, ventas, arrendamiento, laboral, etc.
- **Tipos Económicos**: Ingresos, egresos, compras, ventas

### Datos Realistas
- **Fechas coherentes**: Las fechas de creación son anteriores a las de inicio
- **Contrapartes variadas**: Empresas, personas naturales, proveedores
- **Departamentos**: Tecnología, Administración, Marketing, RRHH, Ventas, Finanzas
- **Estados lógicos**: Progresión natural de estados de contrato

### Metadatos Completos
- **Auditoría**: Cada contrato incluye registros de auditoría
- **Etiquetas**: Etiquetas descriptivas para búsqueda y filtrado
- **Trazabilidad**: Información de creación y modificación
- **Organización**: Todos los contratos pertenecen a la misma organización

## 🔧 Personalización

### Modificar Contratos Existentes

Edita el archivo `contratosEjemplo.ts` para:
- Cambiar montos, fechas o descripciones
- Agregar nuevos contratos
- Modificar proyectos o categorías
- Actualizar contrapartes

### Agregar Nuevos Contratos

```typescript
{
  titulo: "Nuevo Contrato",
  descripcion: "Descripción del contrato",
  contraparte: "Nombre de la Contraparte",
  fechaInicio: new Date('2024-01-01'),
  fechaTermino: new Date('2024-12-31'),
  monto: 1000000,
  moneda: 'CLP',
  pdfUrl: 'https://example.com/contrato.pdf',
  categoria: CategoriaContrato.SERVICIOS,
  periodicidad: Periodicidad.MENSUAL,
  tipo: TipoEconomico.EGRESO,
  proyecto: 'Mi Proyecto',
  estado: EstadoContrato.ACTIVO,
  organizacionId: 'org-001',
  departamento: 'Mi Departamento',
  responsableId: 'user-001',
  documentoNombre: 'contrato.pdf',
  documentoTamaño: 1000000,
  etiquetas: ['tag1', 'tag2']
}
```

## ⚠️ Consideraciones

### Seguridad
- Solo usuarios autenticados pueden poblar la base de datos
- Los contratos se asocian automáticamente a la organización del usuario
- Se crean registros de auditoría para trazabilidad

### Rendimiento
- La población se hace de forma secuencial para evitar sobrecarga
- Se incluyen indicadores de progreso
- Manejo de errores individual por contrato

### Limpieza
- Los datos de ejemplo se pueden eliminar completamente
- No afecta otros datos de la base de datos
- Eliminación segura de registros relacionados

## 📈 Casos de Uso

### Testing
- Pruebas de funcionalidades de filtrado
- Validación de cálculos de estadísticas
- Testing de componentes con datos reales

### Demostración
- Mostrar capacidades del sistema
- Entrenar usuarios nuevos
- Presentaciones a clientes

### Desarrollo
- Datos consistentes para desarrollo
- Pruebas de rendimiento
- Validación de nuevas características

## 🐛 Resolución de Problemas

### Error: "Ya existen contratos de ejemplo"
- Usa la función de limpiar datos antes de poblar nuevamente
- O modifica el filtro de verificación en el código

### Error de permisos
- Verifica que el usuario esté autenticado
- Confirma que Firebase esté configurado correctamente
- Revisa las reglas de seguridad de Firestore

### Contratos no aparecen
- Verifica filtros activos en la interfaz
- Confirma que la organización coincida
- Revisa los filtros de rol y permisos
