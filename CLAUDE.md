# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 3D shoe configurator built with Next.js 15, React Three Fiber, and Anthropic's Claude API. Users can interact with 3D models in two modes: manual material selection via UI controls, or natural language commands through an AI-powered chat interface.

## Development Commands

- **Start development server**: `npm run dev` (uses Turbopack)
- **Production build**: `npm run build` (includes TypeScript checking and linting)
- **Start production server**: `npm start`
- **Run linting**: `npm run lint`
- **Clean build cache**: `rm -rf .next` (useful when encountering build manifest errors)

## Architecture

### Core Application Flow

1. **Configuration Loading**: App loads `/public/config.json` which defines available 3D models, camera settings, and scene parameters
2. **3D Scene Setup**: React Three Fiber Canvas renders the 3D scene with lighting, environment, and camera controls
3. **Material Discovery**: When a GLB/GLTF model loads, `ModelViewer` component traverses the scene graph to extract all materials
4. **State Management**: Materials are stored in React state at the app level and passed down to both UI components and chat interface
5. **Two Interaction Modes**: Users can either manually adjust colors via `MaterialList` UI or use natural language via `ChatInterface`

### Key Components Architecture

- **`src/app/page.tsx`**: Main application component that orchestrates state management between 3D scene and UI
- **`src/components/Scene.tsx`**: Sets up Three.js scene with lighting, environment, ground plane, and camera controls
- **`src/components/ModelViewer.tsx`**: Handles GLB model loading and material extraction using useGLTF hook
- **`src/components/MaterialList.tsx`**: Renders manual color picker interface for each discovered material
- **`src/components/ChatInterface.tsx`**: AI-powered chat interface with fallback keyword matching when API unavailable
- **`src/components/ModeSwitch.tsx`**: Toggle between manual and chat modes

### Material Management System

Materials are discovered dynamically by traversing the loaded 3D model's scene graph. The system:

1. Identifies all mesh objects in the GLB file
2. Extracts materials (handling both single materials and material arrays)
3. Creates a `Record<string, THREE.Material>` mapping material names to Three.js material instances
4. Updates material colors directly on Three.js objects while maintaining React state synchronization

### AI Chat Integration

The chat interface uses Anthropic's Claude API via `/api/claude` endpoint:

- **Primary Mode**: Full AI processing with material name matching and color interpretation
- **Fallback Mode**: Local keyword matching when API key unavailable or API fails
- **Material Matching**: AI analyzes user input like "change shoelaces to blue" and maps to actual material names in the 3D model
- **Color Processing**: Converts natural language colors to hex codes

### Environment Configuration

- **API Key**: Set `ANTHROPIC_API_KEY` in `.env.local` for AI chat functionality
- **3D Models**: Place GLB files in `/public/models/` directory
- **Model Configuration**: Update `/public/config.json` to add new models or adjust scene settings

### TypeScript Considerations

When working with Three.js materials, use proper type guards instead of `any`:
```typescript
// Good
const mat = material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | THREE.MeshBasicMaterial
if ('color' in mat) {
  mat.color = new THREE.Color(color)
}

// Bad
const mat = material as any
mat.color = new THREE.Color(color)
```

### Build and Deployment Notes

- Project uses Next.js 15 with Turbopack for faster development builds
- All TypeScript and ESLint errors must be resolved before production builds succeed
- 3D models should be optimized GLB files to ensure reasonable loading times
- The app supports both static generation and server-side rendering depending on component usage