# 🔥 Firestore Indexes Management

## 📋 Overview
This document explains how to manage Firestore indexes for the ContractHub application. Compound queries in Firestore require specific indexes to function properly.

## 🚨 Common Index Errors
When you see errors like:
```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/...
```

This means you need to create a composite index for the query.

## 📁 Index Configuration
All indexes are defined in `firestore.indexes.json`. The current indexes support:

### Contratos Collection
- **proyecto + fechaCreacion**: For getting contracts by project ordered by creation date
- **proyectoId + fechaCreacion**: For getting contracts by project ID ordered by creation date  
- **organizacionId + fechaCreacion**: For getting organization contracts ordered by creation date
- **organizacionId + estado + fechaCreacion**: For filtered organization queries

## 🚀 Deploying Indexes

### Method 1: Firebase CLI (Recommended)
```bash
# Deploy all indexes
firebase deploy --only firestore:indexes

# Deploy with specific project
firebase deploy --only firestore:indexes --project pullmai-e0bb0
```

### Method 2: Firebase Console
1. Copy the error URL from the console
2. Visit the URL to auto-create the index
3. Wait for the index to build (can take several minutes)

## 🛠️ Adding New Indexes

### Step 1: Update firestore.indexes.json
```json
{
  "indexes": [
    {
      "collectionGroup": "contratos",
      "queryScope": "COLLECTION", 
      "fields": [
        {
          "fieldPath": "newField",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "fechaCreacion", 
          "order": "DESCENDING"
        }
      ]
    }
  ]
}
```

### Step 2: Deploy
```bash
firebase deploy --only firestore:indexes
```

## 📊 Query Patterns That Need Indexes

### Single Field Queries (No Index Needed)
```typescript
where('organizacionId', '==', 'org-001')
```

### Compound Queries (Index Required)
```typescript
// Requires: organizacionId (ASC) + fechaCreacion (DESC)
query(
  collection(db, 'contratos'),
  where('organizacionId', '==', 'org-001'),
  orderBy('fechaCreacion', 'desc')
)
```

### Array Contains + Order By (Index Required)
```typescript  
// Requires: etiquetas (ARRAY) + fechaCreacion (DESC)
query(
  collection(db, 'contratos'),
  where('etiquetas', 'array-contains', 'urgent'),
  orderBy('fechaCreacion', 'desc')
)
```

## ⚠️ Index Limitations
- Maximum 200 composite indexes per database
- Array fields can only be used once per query
- Inequality filters require the field to be in orderBy
- Each unique combination needs its own index

## 🔧 Troubleshooting

### Index Building Time
- Simple indexes: 1-2 minutes
- Complex indexes: 5-10 minutes  
- Large datasets: Can take hours

### Index Status Check
```bash
firebase firestore:indexes
```

### Clear Local Cache
```bash
firebase logout
firebase login
```

## 📝 Index Naming Convention
Use descriptive field combinations:
- `collection_field1_field2_order`
- Example: `contratos_organizacionId_fechaCreacion_desc`

## 🔍 Performance Tips
1. **Limit fields**: Only index fields actually used in queries
2. **Order matters**: Field order in index must match query order
3. **Test locally**: Use Firestore emulator for development
4. **Monitor usage**: Remove unused indexes to save costs

## 📚 Useful Commands
```bash
# List all indexes
firebase firestore:indexes

# Delete specific index (use with caution)
firebase firestore:indexes:delete [INDEX_ID]

# Check Firestore rules
firebase firestore:rules

# Deploy rules and indexes together
firebase deploy --only firestore
```

## 🆘 Emergency Index Creation
If production is down due to missing index:
1. Get the console URL from the error
2. Visit URL and click "Create Index"
3. Wait for index to build
4. Update `firestore.indexes.json` locally
5. Deploy to sync configuration

---
*Last updated: June 2025*
*For more info: [Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)*
