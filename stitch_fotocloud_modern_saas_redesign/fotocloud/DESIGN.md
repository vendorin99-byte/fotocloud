---
name: FotoCloud
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f4'
  surface-container: '#f0edee'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e5e2e3'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464c'
  inverse-surface: '#303031'
  inverse-on-surface: '#f3f0f1'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#575e70'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#141b2b'
  on-primary-container: '#7d8497'
  inverse-primary: '#c0c6db'
  secondary: '#585f6c'
  on-secondary: '#ffffff'
  secondary-container: '#dce2f3'
  on-secondary-container: '#5e6572'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#261906'
  on-tertiary-container: '#968065'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce2f7'
  primary-fixed-dim: '#c0c6db'
  on-primary-fixed: '#141b2b'
  on-primary-fixed-variant: '#404758'
  secondary-fixed: '#dce2f3'
  secondary-fixed-dim: '#c0c7d6'
  on-secondary-fixed: '#151c27'
  on-secondary-fixed-variant: '#404754'
  tertiary-fixed: '#f9debf'
  tertiary-fixed-dim: '#dcc2a4'
  on-tertiary-fixed: '#261906'
  on-tertiary-fixed-variant: '#55442d'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e5e2e3'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  title-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is engineered for a professional SaaS environment dedicated to high-end photography. The brand personality is **Professional, Clean, and Elegant**, designed to act as a sophisticated "frame" that recedes into the background, allowing the photographer's work to remain the focal point.

The visual style follows a **Modern Minimalism** approach. It utilizes expansive whitespace, a restrained monochromatic palette, and a rigorous adherence to a grid-based layout. The interface avoids unnecessary decorative elements, favoring high-quality typography and subtle tactile cues to guide the user. For the client-facing galleries, the system shifts into a "Cinema Mode," utilizing high-contrast dark environments to make imagery pop.

## Colors

The palette is intentionally stark to maintain an editorial feel. 

- **Primary & Neutrals:** The core of the interface is built on `#111827` (Ink) for primary actions and headings, and `#FFFFFF` (Paper) for the workspace. `#F9FAFB` provides a soft distinction for secondary UI areas like sidebars or empty states.
- **Borders & Dividers:** Use `#E5E7EB` for all structural divisions. This low-contrast border ensures the UI remains structured without feeling heavy.
- **Status Colors:** These are used sparingly for system feedback (e.g., gallery approval status, upload errors). They should never overwhelm the primary brand colors.
- **Public Gallery Mode:** When viewing galleries, the UI flips to a dark mode using `#111827` as the base background to minimize light bleed around photos.

## Typography

The design system utilizes **Geist** for its technical precision and modern, airy feel. It is a font that suggests both Swiss design discipline and digital-first efficiency.

- **Headlines:** Use tight letter-spacing for large headlines to create a "compact" and authoritative look. 
- **Body Copy:** Maintains a generous line height to ensure readability in long-form settings, such as client notes or gallery descriptions.
- **Labels:** Small labels use an uppercase treatment with slight tracking to differentiate them from body text and to serve as clear UI markers.

## Layout & Spacing

The layout philosophy is based on a **Fixed Grid** for administrative dashboards and a **Fluid Masonry** approach for photo galleries.

- **Grid System:** A 12-column grid with 24px gutters is standard for the SaaS dashboard. 
- **Rhythm:** An 8px linear scale (referenced as multiples of `unit`) governs all padding and margins. 
- **Mobile Adaption:** At the 768px breakpoint, horizontal margins reduce to 16px, and complex grids collapse into a single-column stack. Typography scales down specifically for the mobile viewport to preserve screen real estate.

## Elevation & Depth

This design system avoids heavy shadows to maintain its "flat-plus" aesthetic.

- **Tonal Layers:** Depth is primarily communicated through the use of surface colors. The main workspace is white, while secondary panels use the warm gray accent color.
- **Subtle Shadows:** A single `shadow-sm` is used for cards (`0 1px 2px 0 rgba(0, 0, 0, 0.05)`). This provides just enough lift to distinguish a card from the background without creating visual clutter.
- **Outlines:** All containers use a 1px border in `#E5E7EB`. In the dark gallery mode, these borders shift to a higher contrast or disappear entirely to favor a pure "black-box" experience.

## Shapes

The shape language is a mix of geometric precision and organic softness. 

- **Structural Elements:** Cards and main content containers use a `rounded-xl` (12px) radius, lending a premium and approachable feel to the platform.
- **Interactive Elements:** Buttons, input fields, and tags use a `rounded-lg` (8px) radius. This creates a subtle visual hierarchy where interactive elements appear slightly "sharper" and more precise than the containers they sit within.

## Components

- **Primary Button:** Solid `#111827` background. Text is white. On hover, the background transitions to `#1F2937`. Padding is precisely 10px vertical (2.5 units) and 16px horizontal.
- **Secondary Button:** White background with a 1px border in `#D1D5DB`. Hover state introduces a light gray wash (`#F9FAFB`).
- **Inputs:** Clean white fields with `#E5E7EB` borders. Upon focus, the border color remains the same but a 2px ring of `#111827` appears to signal active state clearly.
- **Cards:** The foundational container. Features a 1px border, the `rounded-xl` corner radius, and 24px (lg) internal padding.
- **Chips/Status Badges:** Small, `rounded-full` elements using the status colors at 10% opacity for the background and 100% opacity for the text.
- **Photo Thumbnails:** Should always maintain a 1px inset border to ensure light-colored photos don't bleed into white backgrounds.