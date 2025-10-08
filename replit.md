# Black Leo Ventures - Corporate Website

## Overview
Black Leo Ventures is a startup funding and investor connection platform. This project delivers a premium, SEO-optimized corporate website to showcase their services, value proposition, case studies, and funding process. The business vision is to connect startups with investors through a platform featuring exceptional UI/UX design, aiming for significant market potential in the startup ecosystem.

## User Preferences
- Frontend-only implementation (no backend/API)
- Vercel hosting optimized
- SEO-ready with comprehensive meta tags
- Responsive design for all devices
- Professional, trustworthy design aesthetic
- Fast loading and optimized performance

## System Architecture
The website is a 100% frontend-only corporate site built with React, Vite, and TypeScript. Styling is handled with Tailwind CSS and `shadcn/ui` components. It is optimized for Vercel deployment.

### UI/UX Decisions
- **Brand Colors**: Primary yellow (`#FFD700`) with alternative themes (Violet, Red, Brown). Black and White accents.
- **Logo**: Consistent `h-16` logo size for premium brand presence.
- **Color Theme Switcher**: Dedicated `/theme` page accessible via footer links, offering 4 color options (Yellow, Violet, Red, Brown) with `localStorage` persistence.
- **Typography**: Inter for body, Space Grotesk for accents.
- **Night Mode**: Dark/light mode toggle available on the theme page and header, with system preference support and `localStorage` persistence.
- **Responsive Design**: Mobile-first approach for all screen sizes.
- **Animations**:
    - Scroll reveal effects.
    - Animated metrics counters.
    - Interactive card hover effects.
    - Gradient animations in hero section.
    - Cinematic TV display with rotating service messages (3-second intervals), live broadcast indicators, and audio visualization.
    - Pulse, shimmer, and float effects.
    - Accessibility: Respects `prefers-reduced-motion` settings.

### Technical Implementations
- **Core Features**:
    - **Hero Section**: Compelling headlines, dual CTAs, cinematic TV display showcasing "Your Growth Partner" with live broadcast animation, rotating service messages, service badges, animated audio visualization, scanline effects.
    - **Pain Points Section**: Interactive cards addressing fundraising challenges.
    - **Value Proposition**: 5-point advantage, including Pitch Deck Analysis & Improvement.
    - **Flexible Partnership Models**: Detailed fee structures including Fee-Based, Equity Partnership, and Custom Solutions.
    - **Case Studies**: Founder testimonials with animated metrics.
    - **Process Flow**: 4-step funding system.
    - **FAQ Section**: Comprehensive Q&A.
    - **Final CTA**: Conversion-focused.
    - **Professional Footer**: Complete navigation, trust badges, clickable logo.
    - **Floating WhatsApp**: Persistent contact button.
    - **Theme Page**: Dedicated page for color customization.
- **SEO Optimization**: Comprehensive meta tags, Open Graph tags, semantic HTML, optimized page titles/descriptions, schema markup readiness.
- **Project Structure**: Organized `src` directory with `pages`, `components` (including `ui` for shadcn, theme providers, toggles, animated elements, scroll reveals, and WhatsApp button), `App.tsx`, and `index.css`.

## External Dependencies
- **Vercel**: For deployment and serverless functions.
- **Google Gemini AI**: Used for AI-powered tools like Pitch Practice (via `@google/genai` package and `GOOGLE_API_KEY`).
- **`shadcn/ui`**: UI component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide-React**: Icon library (specifically for Indian Rupee icon).
- **External Links**:
    - LinkedIn: `https://www.linkedin.com/company/black-leo-ventures`
    - Grants Portal: `https://getgrants.in/`
    - Scheduling Tool: `https://zcal.co/blackleoventures/30min`
    - WhatsApp Integration: `wa.me` links for CTAs.