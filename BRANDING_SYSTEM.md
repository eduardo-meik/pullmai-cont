# Organization Branding System

This document explains how to use the organization branding system that allows each organization to customize the appearance of the Pullmai application.

## Features

- **Custom Brand Colors**: Organizations can set their primary and secondary brand colors
- **Navigation Customization**: Custom background and text colors for the navigation bar
- **Live Preview**: Real-time preview of changes before saving
- **Color Presets**: Quick selection from predefined color palettes
- **CSS Variables**: Dynamic CSS custom properties that update the entire application
- **Fallback Support**: Default colors are used when no custom branding is set

## Implementation

### 1. Tailwind Configuration

The Tailwind config has been extended with brand-specific color utilities:

```javascript
// Brand colors - customizable per organization
brand: {
  50: 'rgb(var(--brand-50) / <alpha-value>)',
  100: 'rgb(var(--brand-100) / <alpha-value>)',
  // ... through 900
},

// Navigation specific colors
nav: {
  bg: 'rgb(var(--nav-bg) / <alpha-value>)',
  'bg-hover': 'rgb(var(--nav-bg-hover) / <alpha-value>)',
  text: 'var(--nav-text)',
  'text-muted': 'var(--nav-text-muted)',
  // ...
}
```

### 2. Database Schema

Organizations now support a `branding` field:

```typescript
interface Organizacion {
  // ... existing fields
  branding?: BrandingConfig
}

interface BrandingConfig {
  primaryColor?: string      // hex color for primary brand color
  secondaryColor?: string    // hex color for secondary brand color
  navBackgroundColor?: string // hex color for navigation background
  navTextColor?: string      // hex color for navigation text
  logoUrl?: string          // custom logo URL
  customCSS?: string        // custom CSS variables override
}
```

### 3. Components and Hooks

#### `useOrganizationBranding()`
Automatically applies organization branding by setting CSS custom properties on the document root.

#### `BrandSettings` Component
Provides a UI for organizations to customize their branding with:
- Color pickers for each brand element
- Predefined color palettes
- Real-time preview
- Hex code input fields

#### `OrganizationBrandingService`
Service class for saving/loading organization branding configuration.

### 4. Usage in Components

Use the new color utilities in your Tailwind classes:

```tsx
// Navigation bar with organization colors
<nav className="bg-nav-bg text-nav-text">
  <h1 className="text-nav-text">App Title</h1>
  <button className="text-nav-text-muted hover:text-nav-text-hover">
    Button
  </button>
</nav>

// Primary brand colors
<button className="bg-brand-600 hover:bg-brand-700 text-white">
  Primary Button
</button>

// With opacity support
<div className="bg-brand-500/20 border border-brand-200">
  Brand colored background
</div>
```

## Default Colors

When no custom branding is set, the application uses these default colors:

- **Primary Brand**: Blue (#0ea5e9)
- **Navigation Background**: Dark Blue (#075985)  
- **Navigation Text**: White (#ffffff)
- **Navigation Text Muted**: Light Gray (#e5e7eb)

## Setting Organization Branding

### Via Admin Interface

1. Navigate to the organization branding settings page
2. Use the `BrandSettings` component to modify colors
3. Preview changes in real-time
4. Save changes to apply organization-wide

### Programmatically

```typescript
import { OrganizationBrandingService } from '../services/organizationBrandingService'

const branding: BrandingConfig = {
  primaryColor: '#22c55e',      // Green
  navBackgroundColor: '#166534', // Dark Green
  navTextColor: '#ffffff'       // White
}

await OrganizationBrandingService.updateBranding(organizationId, branding)
```

## Color Palette Generation

The system automatically generates color palettes from the primary color:

- Lighter shades (50-400) for backgrounds and subtle elements
- Base color (500) for primary actions
- Darker shades (600-900) for text and emphasis

## Best Practices

1. **Contrast**: Ensure sufficient contrast between text and background colors
2. **Accessibility**: Test colors with accessibility tools to ensure WCAG compliance
3. **Brand Consistency**: Use colors that align with your organization's brand guidelines
4. **Fallbacks**: The system provides automatic fallbacks if custom colors aren't accessible

## Extending the System

To add new customizable elements:

1. Add new CSS custom properties to the default CSS
2. Update the `BrandingConfig` interface
3. Modify the `useOrganizationBranding` hook to apply new properties
4. Add UI controls to the `BrandSettings` component
5. Update the `OrganizationBrandingService` to handle new properties

## Example Implementation

```tsx
// In a dashboard component
function Dashboard() {
  // Branding is automatically applied via useOrganizationBranding()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation uses organization colors */}
      <nav className="bg-nav-bg text-nav-text shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-nav-text text-xl font-semibold">
              Pullmai
            </h1>
            <button className="text-nav-text-muted hover:text-nav-text-hover">
              Menu
            </button>
          </div>
        </div>
      </nav>
      
      {/* Content uses brand colors */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">
          Primary Action
        </button>
      </main>
    </div>
  )
}
```

This system provides a flexible, maintainable way for organizations to customize the application's appearance while maintaining design consistency and accessibility standards.
