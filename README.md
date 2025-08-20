# JarvysAI Website

A modern, high-performance Next.js website for JarvysAI Software House, featuring AI solutions and cutting-edge web technologies.

## 🚀 **Performance Optimizations Implemented**

This website has been extensively optimized for performance:

- **Reduced Animation Complexity**: Animations adapt to device capabilities
- **Conditional Rendering**: Heavy components only render when appropriate
- **Particle System Optimization**: Reduced particle counts for better performance
- **Mobile-First Design**: Simplified animations on mobile devices
- **Reduced Motion Support**: Respects user preferences for minimal motion
- **Performance Monitoring**: Real-time Core Web Vitals tracking

## 🛠️ **Getting Started**

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Server
The website will be available at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.56.1:3000

## 📱 **Performance Features**

- **Adaptive Animations**: Automatically adjusts based on device performance
- **Lazy Loading**: Components load only when needed
- **Optimized Particles**: Reduced complexity for better performance
- **Mobile Optimization**: Simplified effects on mobile devices
- **Performance Monitoring**: Built-in performance tracking

## 🎨 **Technologies Used**

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **Animations**: CSS animations with performance optimization
- **Particles**: tsparticles with conditional rendering
- **Icons**: React Icons
- **Performance**: Custom performance monitoring

## 📊 **Performance Metrics**

The website is optimized to achieve:
- **FCP**: < 2 seconds
- **LCP**: < 2.5 seconds  
- **FID**: < 100ms
- **CLS**: < 0.1

## 🔧 **Customization**

### Performance Settings
Modify performance thresholds in `src/utils/performance.ts`:
```typescript
export const getReducedAnimationSettings = () => {
  // Customize your performance settings here
};
```

### Animation Control
Control animations through CSS variables and device detection:
```css
@media (prefers-reduced-motion: reduce) {
  /* Reduced motion styles */
}
```

## 🚀 **Deployment**

The website is optimized for Vercel deployment with automatic performance optimizations.

## 📚 **Documentation**

For detailed performance optimization documentation, see:
- `PERFORMANCE_OPTIMIZATIONS.md` - Comprehensive performance guide
- `src/utils/performance.ts` - Performance utility functions

## 🤝 **Contributing**

When adding new features:
1. Ensure they respect reduced motion preferences
2. Test on low-end devices
3. Add performance monitoring where appropriate
4. Document performance impact

---

**Built with ❤️ by JarvysAI Team**
