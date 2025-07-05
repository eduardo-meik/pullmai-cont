# Configuration Module

Production-ready configuration management system for the application.

## Features

### 🔧 System Configuration (Super Admin Only)
- **General Settings**: Application name, language, timezone, session timeout
- **Security Settings**: Password policies, authentication settings, audit configuration
- **Notification Settings**: Email templates, notification preferences
- **Maintenance Mode**: System-wide maintenance configuration

### 🏢 Organization Configuration (Org Admin)
- **Organization Details**: Name, description, contact information
- **Branding**: Logo, colors, custom styling
- **User Management**: Default roles, permissions
- **Contract & Project Settings**: Default templates, workflows

### ⚡ Key Capabilities

1. **Role-Based Access Control**
   - Super Admin: Full system configuration access
   - Org Admin: Organization-specific settings only
   - Proper permission validation

2. **Data Validation & Audit**
   - Form validation before saving
   - Audit logging for all configuration changes
   - Change history tracking

3. **Import/Export**
   - JSON-based configuration export
   - Secure configuration import with validation
   - Backup and restore capabilities

4. **Real-time Updates**
   - Live configuration loading
   - Auto-save indicators
   - Change conflict detection

## Usage

### Basic Integration

```tsx
import ConfigurationModule from './Components/configuration/ConfigurationModule'

// In your routing configuration
<Route path="/configuration" element={<ConfigurationModule />} />
```

### Required Permissions

- User must have `UserRole.ORG_ADMIN` or `UserRole.SUPER_ADMIN`
- Proper authentication context must be available
- Toast context for user feedback

### API Dependencies

The module requires the following services:
- `ConfigurationService`: Backend configuration management
- `AuthContext`: User authentication and role verification
- `ToastContext`: User feedback notifications

## Configuration Sections

### 1. General Configuration
Handles basic application/organization settings:
- Application/Organization name
- Default language and timezone
- Session timeout (system only)
- File upload limits (system only)
- Maintenance mode (system only)

### 2. Organization Configuration
Organization-specific settings:
- Organization details and contact info
- Business settings and preferences
- Default configurations for new users

### 3. Security Configuration (System Only)
Security policies and settings:
- Password complexity requirements
- Login attempt limits
- Session management
- Audit configuration

### 4. Notification Configuration (System Only)
Email and notification settings:
- SMTP configuration
- Email templates
- Notification preferences
- Webhook endpoints

### 5. Branding Configuration
Visual customization options:
- Organization logo
- Color schemes
- Custom CSS
- White-label settings

### 6. Template Configuration (System Only)
Document and email templates:
- Contract templates
- Email templates
- Report templates
- Custom field definitions

## Technical Implementation

### State Management
- React hooks for local state
- Optimistic updates with rollback
- Loading states for better UX

### Form Handling
- Controlled components
- Real-time validation
- Auto-save capabilities

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- Retry mechanisms

### Performance
- Lazy loading of configuration sections
- Optimized re-renders
- Efficient API calls

## Security Considerations

1. **Authentication**: All configuration access requires valid authentication
2. **Authorization**: Role-based access control strictly enforced
3. **Audit Trail**: All changes are logged with user and timestamp
4. **Validation**: Server-side validation for all configuration changes
5. **Encryption**: Sensitive configuration data is encrypted at rest

## Testing

### Unit Tests
- Component rendering tests
- Form validation tests
- Permission handling tests

### Integration Tests
- Configuration save/load workflows
- Import/export functionality
- Role-based access scenarios

### E2E Tests
- Full configuration management workflows
- Cross-browser compatibility
- Performance testing

## Monitoring & Analytics

- Configuration change tracking
- Usage analytics
- Performance metrics
- Error rate monitoring

## Troubleshooting

### Common Issues

1. **Permission Denied**: Verify user role and authentication status
2. **Save Failures**: Check network connectivity and server status
3. **Import Errors**: Validate JSON format and configuration schema
4. **Loading Issues**: Clear browser cache and check API connectivity

### Debug Mode

Set environment variable `DEBUG=configuration` to enable detailed logging.

## Contributing

1. Follow the existing code structure
2. Add comprehensive tests for new features
3. Update documentation for any changes
4. Ensure proper TypeScript typing
5. Follow the established patterns for API integration

## Version History

- **v1.0.0**: Initial production release
- Complete configuration management system
- Role-based access control
- Import/export functionality
- Audit logging
- Production-ready security features
