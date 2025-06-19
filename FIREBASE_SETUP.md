# Guía para solucionar el problema de Firebase vacío

## Problema Identificado
La base de datos de Firebase está vacía porque **las reglas de seguridad de Firestore están bloqueando las escrituras**. Los scripts fallan con errores de permisos.

## Soluciones

### Opción 1: Configurar Reglas de Firestore Permisivas (Recomendado para desarrollo)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `pullmai-e0bb0`
3. Ve a **Firestore Database** → **Rules**
4. Reemplaza las reglas actuales con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir todas las operaciones durante desarrollo
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Haz clic en **"Publicar"**

### Opción 2: Usar Firebase CLI (Si tienes Firebase CLI instalado)

```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Inicializar proyecto
firebase init firestore

# Usar las reglas del archivo firestore-dev.rules
firebase deploy --only firestore:rules
```

### Opción 3: Usar el Script TypeScript que ya funciona

Una vez que las reglas estén configuradas, puedes usar:

```bash
npm run populate-db
```

## Scripts Disponibles

### Python (Después de configurar reglas)
```bash
python populate_firebase_rest.py
```

### TypeScript (Recomendado)
```bash
npm run populate-db
```

## Verificación

Después de configurar las reglas, puedes verificar que funciona:

1. Ejecuta cualquiera de los scripts
2. Ve a Firebase Console → Firestore Database
3. Deberías ver 13 contratos en la colección `contratos`

## ⚠️ IMPORTANTE para Producción

Las reglas permisivas (`allow read, write: if true;`) son **SOLO para desarrollo**. 

Para producción, implementa reglas como:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contratos/{contractId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.responsableId;
    }
  }
}
```

## Estado Actual

- ✅ Scripts de población creados (Python y TypeScript)
- ✅ Datos de ejemplo preparados (13 contratos)
- ✅ Configuración de Firebase verificada
- ❌ **Reglas de Firestore demasiado restrictivas** ← Esto hay que arreglar

## Próximos Pasos

1. **Configura las reglas de Firestore** (Opción 1 recomendada)
2. **Ejecuta el script de población**
3. **Verifica los datos en Firebase Console**
4. **Prueba la aplicación React**
