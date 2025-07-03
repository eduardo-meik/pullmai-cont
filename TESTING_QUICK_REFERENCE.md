# 🎯 Testing Quick Reference - PullMai

Guía rápida para ejecutar tests eficientemente en diferentes escenarios.

## 🚀 Testing Workflows Principales

### 1. Smoke Test (5 minutos)
```
✅ Registro básico → Login → Dashboard → Crear contrato → Logout
```

### 2. Core Functionality Test (15 minutos)
```
✅ Gestión completa de contratos (CRUD)
✅ Gestión básica de proyectos
✅ Navegación principal
✅ Permisos básicos
```

### 3. Full Regression Test (45 minutos)
```
✅ Todos los workflows del checklist principal
✅ Casos edge y validaciones
✅ Testing de permisos RBAC
✅ Responsive design
```

## 🔧 Setup de Testing

### Datos de Prueba Mínimos
```bash
# Usuarios Test
admin@pullmai.test / AdminTest123!
manager@pullmai.test / ManagerTest123!
user@pullmai.test / UserTest123!

# Organizaciones
- TechCorp Solutions
- Innovate Digital Labs
- Consulting Partners LLC

# Contratos Sample
- Desarrollo Sistema CRM ($75,000)
- Soporte Técnico Anual ($24,000)
- Consultoría DevOps ($15,000)
```

### URLs de Testing
```bash
# Local Development
http://localhost:5180/

# Staging (si existe)
https://staging.pullmai.com/

# Production
https://app.pullmai.com/
```

## 📋 Checklist Rápido por Módulo

### Autenticación ⚡
- [ ] Signup email/password
- [ ] Signup Google/GitHub
- [ ] Login credenciales
- [ ] Forgot password
- [ ] Logout

### Contratos 📄
- [ ] Lista/filtros
- [ ] Crear básico
- [ ] Crear con PDF
- [ ] Editar
- [ ] Eliminar
- [ ] Detalle completo

### Proyectos 📁
- [ ] Lista proyectos
- [ ] Crear proyecto
- [ ] Asociar contratos
- [ ] Detalle proyecto
- [ ] Editar proyecto

### Organizaciones 🏢
- [ ] Lista organizaciones
- [ ] Detalle organización
- [ ] Gestión accesos
- [ ] Importar contratos

### RBAC 🔒
- [ ] Admin: acceso total
- [ ] Manager: proyectos asignados
- [ ] User: recursos específicos
- [ ] Navegación por permisos

## 🐛 Casos de Error Críticos

### High Priority Bugs
- [ ] No se puede crear contrato
- [ ] Login infinito/falla
- [ ] Permisos no funcionan
- [ ] PDFs no cargan
- [ ] Dashboard no carga

### Medium Priority
- [ ] Filtros no funcionan
- [ ] Navegación rota
- [ ] Validaciones débiles
- [ ] UI inconsistente

### Low Priority
- [ ] Texto/typos
- [ ] Colores/estilo
- [ ] Animaciones
- [ ] Performance menor

## 📱 Device Testing Matrix

| Device Type | Priority | Screen Size | Testing Focus |
|-------------|----------|-------------|---------------|
| Desktop | High | 1920x1080+ | Full functionality |
| Laptop | High | 1366x768+ | Complete workflows |
| Tablet | Medium | 768-1024px | Navigation & forms |
| Mobile | Medium | 320-767px | Critical paths only |

## 🌐 Browser Testing Priority

| Browser | Priority | Version | Notes |
|---------|----------|---------|-------|
| Chrome | High | Latest | Primary development |
| Firefox | Medium | Latest | Secondary support |
| Safari | Medium | Latest | MacOS users |
| Edge | Low | Latest | Enterprise users |

## ⚠️ Critical Test Scenarios

### 1. Security Tests
```
✅ Unauthorized access attempts
✅ SQL injection in forms
✅ XSS prevention
✅ CSRF protection
✅ File upload security
```

### 2. Performance Tests
```
✅ Page load < 3s
✅ Large dataset handling
✅ Concurrent users
✅ Memory leaks
✅ Network failure recovery
```

### 3. Integration Tests
```
✅ Firebase auth flow
✅ Firestore data sync
✅ File storage upload
✅ Email notifications
✅ External API calls
```

## 🔄 Testing Automation

### Manual Testing (Current)
- Use checklist systematically
- Document bugs with screenshots
- Test in incognito/private mode
- Clear cache between tests

### Future Automation Candidates
```javascript
// High ROI automation targets
- Login/logout flows
- CRUD operations
- Form validations
- Navigation testing
- Permission checking
```

## 📊 Bug Reporting Template

```markdown
**Title**: [Module] Brief description
**Priority**: Critical/High/Medium/Low
**Browser**: Chrome 115.0.5790.110
**Device**: Desktop/Mobile
**User Role**: Admin/Manager/User

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:
**Actual Result**:
**Screenshots**:
**Console Errors**:
```

## 🎯 Testing Success Criteria

### Ready for Production
- [ ] 100% critical workflows pass
- [ ] 95% high priority features work
- [ ] No critical security issues
- [ ] Performance benchmarks met
- [ ] Mobile usability acceptable

### Quality Gates
- [ ] Smoke tests: 0 failures
- [ ] Core functionality: <2 medium bugs
- [ ] RBAC: 100% permission tests pass
- [ ] Security: No critical vulnerabilities
- [ ] UX: No major usability blockers

---

**Quick Access**: Keep this document open during testing sessions  
**Update Frequency**: After each major feature release  
**Owner**: QA Team Lead
