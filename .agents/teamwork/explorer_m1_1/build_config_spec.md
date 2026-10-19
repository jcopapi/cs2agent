# Milestone 1: Build, Packaging & Tooling Configuration Specification

**Author**: `explorer_m1_1` (Teamwork Explorer)  
**Target Milestone**: Milestone 1 (Repository Foundation & Build Architecture)  
**Project**: CS2 Assistant (`cs2-assistant`)  
**Working Directory**: `c:\Users\conta\Desktop\CS2Agent`  
**Date**: 2026-10-19  

---

## 1. Executive Summary & Architecture Overview

CS2 Assistant is a Windows desktop application combining an Electron host, a pure TypeScript headless core domain engine, a typed IPC preload bridge, and a high-performance React 18+ SPA bundled with Vite and styled with Tailwind CSS (v3).

### 1.1 Dual Compilation & Process Architecture
To achieve instantaneous developer ergonomics, 100% headless automated testability under Vitest across all 11 core domains, and zero runtime friction in Electron, the build architecture uses a dual-stream build model:

```
Source Tree (src/)
├── main/     ──[ tsc -p tsconfig.node.json ]──>  dist/main/index.js (CommonJS, Node 22+)
├── preload/  ──[ tsc -p tsconfig.node.json ]──>  dist/preload/index.js (CommonJS, ContextBridge)
├── core/     ──[ tsc -p tsconfig.node.json ]──>  dist/core/* (Headless Domain Logic)
├── shared/   ──[ tsc -p tsconfig.node.json ]──>  dist/shared/* (Types & Constants)
└── renderer/ ──[ vite build (index.html)   ]──>  dist/renderer/ (HTML, JS, CSS, Assets)
```

1. **Node Compilation Stream (`tsc -p tsconfig.node.json`)**:
   - Compiles `src/main`, `src/preload`, `src/core`, and `src/shared` directly into `dist/`.
   - Uses `module: "NodeNext"` with `moduleResolution: "NodeNext"` (emitting CommonJS when `type: module` is omitted from `package.json`).
   - Ensures Electron loads `dist/main/index.js` natively without experimental ESM loaders or flag overhead.
   - Preserves sourcemaps for debugging.

2. **Web / Renderer Compilation Stream (`vite build`)**:
   - Transpiles and bundles `index.html` and `src/renderer/` into `dist/renderer/`.
   - Configures `base: './'` to guarantee all asset URLs resolve correctly under the Electron `file://` protocol.
   - Injects React Fast Refresh and Tailwind CSS v3 utility classes.

3. **Core Domain Headless Test Stream (`vitest run`)**:
   - Executes directly on TypeScript source files (`src/core/**/*.ts`, `tests/**/*.test.ts`) via Vitest's internal Vite pipeline.
   - Zero compilation wait time during test runs.

---

## 2. `package.json` Specification

### 2.1 Complete File Definition
Target File: `c:\Users\conta\Desktop\CS2Agent\package.json`

```json
{
  "name": "cs2-assistant",
  "version": "1.0.0",
  "private": true,
  "description": "Production-grade, Valve-compliant Windows desktop tactical companion for Counter-Strike 2",
  "main": "dist/main/index.js",
  "scripts": {
    "dev": "vite",
    "build:main": "tsc -p tsconfig.node.json",
    "build:renderer": "vite build",
    "build": "tsc -p tsconfig.node.json && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "tsc --noEmit",
    "typecheck": "tsc --noEmit",
    "start": "electron .",
    "package": "npm run build && electron-builder"
  },
  "dependencies": {
    "@google/genai": "^2.30.0",
    "clsx": "^2.1.1",
    "lucide-react": "^1.59.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^3.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.2",
    "@testing-library/react": "^16.0.1",
    "@types/node": "^22.9.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "electron": "^33.2.1",
    "electron-builder": "^25.1.8",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.6.3",
    "vite": "^5.4.11",
    "vitest": "^2.1.4"
  }
}
```

### 2.2 Script Justifications
- `"build": "tsc -p tsconfig.node.json && vite build"`: Strictly matches the required project command. Sequentially compiles the Electron main/preload/core modules and builds the Vite renderer bundle.
- `"test": "vitest run"`: Strictly matches the required command. Runs all 11 domain tests and E2E suites headlessly and exits with standard exit codes.
- `"dev": "vite"`: Launches the Vite development server on `http://localhost:5173` with instant HMR.
- `"start": "electron ."`: Boots the compiled Electron application using `dist/main/index.js`.
- `"lint"` / `"typecheck": "tsc --noEmit"`: Full project type-checking pass without emitting files.

### 2.3 Dependency Rationale
- **`@google/genai` (`^2.30.0`)**: Official Google Gen AI SDK. Satisfies the `>= 2.29.1` requirement. Verified to export both CommonJS (`./dist/node/index.cjs`), ESM (`./dist/node/index.mjs`), and browser typings. Supports `client.interactions.create` with `gemini-3.8-flash` and structured JSON schema output.
- **`react` & `react-dom` (`^18.3.1`)**: Battle-tested UI runtime ensuring maximum compatibility with Electron context bridges, fast rendering, and `@testing-library/react`.
- **`lucide-react` (`^1.59.0`)**: Modern, tree-shakeable SVG icon collection for clean tactical UI indicators (crosshair, shield, radar, terminal, alert, settings, play, rotate).
- **`clsx` (`^2.1.1`) & `tailwind-merge` (`^3.0.0`)**: Industry-standard utilities for clean, collision-free Tailwind class combination and conditional styling.

### 2.4 DevDependency Rationale
- **`electron` (`^33.2.1`)**: Stable Chromium 130 + Node 20.18 desktop runtime with native Windows DPAPI support via `electron.safeStorage`.
- **`vite` (`^5.4.11`) & `@vitejs/plugin-react` (`^4.3.3`)**: Lightning-fast bundler and JSX/TSX transformer with HMR.
- **`typescript` (`^5.6.3`)**: Strict static type safety across all 4 decoupled project layers.
- **`vitest` (`^2.1.4`)**: ESM-native, multi-threaded test runner seamlessly reusing Vite aliases and transforms.
- **`tailwindcss` (`^3.4.17`), `postcss` (`^8.4.47`), `autoprefixer` (`^10.4.20`)**: Explicitly Tailwind v3 as required. Provides predictable utility classes and full custom color palette extension without Tailwind v4 migration breaking changes.
- **`@types/react` (`^18.3.12`), `@types/react-dom` (`^18.3.1`), `@types/node` (`^22.9.0`)**: Exact ambient TypeScript definitions matching Node and React runtimes.
- **`jsdom` (`^25.0.1`), `@testing-library/react` (`^16.0.1`), `@testing-library/jest-dom` (`^6.6.2`)**: Essential headless DOM simulation for Vitest unit and integration suites.

### 2.5 CommonJS vs ESM Policy (`"type": "module"` omitted)
- **Decision**: Do **not** place `"type": "module"` in `package.json`.
- **Rationale**:
  1. Electron main processes running on Windows often encounter ESM loader hooks and path-resolution issues when importing native or compiled modules.
  2. With `"type": "module"` omitted, Node treats `.js` files as CommonJS. `tsc -p tsconfig.node.json` emits standard CommonJS (`require()`, `exports`), which runs with 100% reliability in Electron.
  3. Vite and Vitest handle ESM internally and are completely unaffected by the omission of `"type": "module"` in `package.json`.
  4. Configuration files (`tailwind.config.js`, `postcss.config.js`) use standard `module.exports = { ... }` without triggering ESM syntax warnings.

---

## 3. TypeScript Configuration Architecture

The project requires two coordinated TypeScript configurations:
1. `tsconfig.json`: Governs the React Renderer, Core Domain logic, Shared contracts, Test files, and root config files. Configured with `noEmit: true` (since Vite and Vitest handle transpilation).
2. `tsconfig.node.json`: Governs the Electron Main process, Preload script, Core domain modules, and Shared types. Configured to emit compiled JavaScript to `dist/` for Electron execution.

### 3.1 Base / Renderer Configuration: `tsconfig.json`
Target File: `c:\Users\conta\Desktop\CS2Agent\tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@core/*": ["src/core/*"],
      "@shared/*": ["src/shared/*"],
      "@renderer/*": ["src/renderer/*"]
    }
  },
  "include": [
    "src/renderer/**/*",
    "src/core/**/*",
    "src/shared/**/*",
    "src/types.d.ts",
    "tests/**/*",
    "vite.config.ts",
    "vitest.config.ts"
  ]
}
```

### 3.2 Node / Electron Compilation Configuration: `tsconfig.node.json`
Target File: `c:\Users\conta\Desktop\CS2Agent\tsconfig.node.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "declaration": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@core/*": ["src/core/*"],
      "@shared/*": ["src/shared/*"]
    }
  },
  "include": [
    "src/main/**/*",
    "src/preload/**/*",
    "src/core/**/*",
    "src/shared/**/*"
  ]
}
```

### 3.3 Critical Architectural Insights & Edge Cases

#### Edge Case A: The `rootDir: "./src"` vs `vite.config.ts` Conflict (TS6059)
- **Observed Behavior**: If `vite.config.ts` or `vitest.config.ts` (located at the project root) are included in `tsconfig.node.json` while `rootDir` is set to `"./src"`, TypeScript aborts with:
  ```
  error TS6059: File '.../vite.config.ts' is not under 'rootDir' '.../src'. 'rootDir' is expected to contain all source files.
  ```
- **Observed Alternative**: If `rootDir` is omitted, TypeScript calculates the common source directory as the root folder, which causes `src/main/index.ts` to be emitted into `dist/src/main/index.js` instead of `dist/main/index.js`, breaking `package.json` `"main": "dist/main/index.js"`.
- **Resolution**: Keep `tsconfig.node.json`'s `rootDir: "./src"` strictly scoped to `src/main/**/*`, `src/preload/**/*`, `src/core/**/*`, and `src/shared/**/*`. Place `vite.config.ts` and `vitest.config.ts` in `tsconfig.json` (where `noEmit: true` is configured). This ensures type checking covers Vite config without corrupting `dist/` output paths.

#### Edge Case B: TypeScript Modern ModuleResolution
- **Observed Behavior**: In modern TypeScript, `"moduleResolution": "node"` (node10) triggers:
  ```
  error TS5108: Option 'moduleResolution=node10' has been removed. Please remove it from your configuration.
  ```
- **Resolution**: Use `"module": "NodeNext"` and `"moduleResolution": "NodeNext"` in `tsconfig.node.json`. Verified experimentally to compile cleanly and emit robust CommonJS without requiring `.js` extensions on relative TypeScript imports when `"type": "module"` is absent.

---

## 4. Vite Configuration (`vite.config.ts`)

Target File: `c:\Users\conta\Desktop\CS2Agent\vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './', // CRITICAL for Electron: relative asset paths under file:// protocol
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
```

### Key Vite Configurations Explained
1. `base: './'`:
   In Electron production mode, `BrowserWindow.loadFile('dist/renderer/index.html')` serves the app via the `file://` scheme. If `base` is `'/'` (Vite's default), generated `<script>` and `<link>` tags request `/assets/...` from the disk root (`C:/assets/...`), resulting in a blank white screen. Setting `base: './'` ensures relative paths (`./assets/...`).
2. `build.outDir: 'dist/renderer'`:
   Outputs the web bundle into a dedicated subfolder within `dist/`, keeping it distinct from `dist/main` and `dist/preload`.
3. `emptyOutDir: true`:
   Cleans old build artifacts prior to bundling.
4. `server.port: 5173` & `strictPort: true`:
   Locks the dev server port so the Electron main process can reliably load `http://localhost:5173` during development without port-hunting.

---

## 5. Vitest Configuration (`vitest.config.ts`)

Target File: `c:\Users\conta\Desktop\CS2Agent\vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.test.{ts,tsx}',
      'src/tests/**/*.test.{ts,tsx}',
    ],
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/core/**/*',
        'src/shared/**/*',
      ],
      exclude: [
        'src/types.d.ts',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
    },
  },
});
```

### Companion Setup File: `tests/setup.ts`
Target File: `c:\Users\conta\Desktop\CS2Agent\tests\setup.ts`

```typescript
import '@testing-library/jest-dom';
```

### Key Vitest Configurations Explained
1. `globals: true`: Exposes `describe`, `it`, `test`, `expect`, `beforeEach`, `afterEach`, `vi` globally across all test files.
2. `environment: 'jsdom'`: Provides DOM emulation for React components and renderer hooks while remaining fast enough for pure domain tests.
3. `include`: Broadly captures test files located in both root `tests/` (as specified in `PROJECT.md`) and `src/tests/` (as specified in `survey_report.md`).
4. `coverage.include`: Focuses coverage metrics specifically on pure domain logic (`src/core/**/*`) and contracts (`src/shared/**/*`).

---

## 6. Tailwind CSS & PostCSS Configuration

### 6.1 `tailwind.config.js`
Target File: `c:\Users\conta\Desktop\CS2Agent\tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/renderer/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Precision Minimalist Dark Palette (Charcoal / Near-Black)
        background: {
          DEFAULT: '#09090b', // zinc-950 base background
          container: '#121215', // dark charcoal surface
          panel: '#18181c', // elevated card/panel
          elevated: '#202026', // hover/interactive surface
        },
        border: {
          subtle: '#27272a', // zinc-800 1px subtle border
          elevated: '#3f3f46', // zinc-700 active/highlight border
          active: '#52525b', // zinc-600 focus border
        },
        // Tactical Functional Accents (Strictly zero gamer-RGB clutter)
        tactical: {
          cyan: {
            DEFAULT: '#06b6d4', // cyan-500: Lineups, utility paths, inferred observations
            light: '#22d3ee', // cyan-400
            dark: '#0891b2', // cyan-600
          },
          emerald: {
            DEFAULT: '#10b981', // emerald-500: Confirmed observations, success states
            light: '#34d399', // emerald-400
            dark: '#059669', // emerald-600
          },
          amber: {
            DEFAULT: '#f59e0b', // amber-500: Reported observations, caution, simulation
            light: '#fbbf24', // amber-400
            dark: '#d97706', // amber-600
          },
          rose: {
            DEFAULT: '#f43f5e', // rose-500: Bomb timer countdown, critical danger
            light: '#fb7185', // rose-400
            dark: '#e11d48', // rose-600
          },
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'Courier New',
          'monospace',
        ],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        hud: '0 4px 12px 0 rgba(0, 0, 0, 0.75)',
      },
    },
  },
  plugins: [],
};
```

### 6.2 `postcss.config.js`
Target File: `c:\Users\conta\Desktop\CS2Agent\postcss.config.js`

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 6.3 Baseline CSS Directives (`src/renderer/index.css`)
Target File: `c:\Users\conta\Desktop\CS2Agent\src\renderer\index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  *, ::before, ::after {
    border-color: #27272a;
  }

  html, body {
    background-color: #09090b;
    color: #f4f4f5;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    margin: 0;
    padding: 0;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
  }
}
```

---

## 7. Minimal `index.html` Entry Point

Target File: `c:\Users\conta\Desktop\CS2Agent\index.html`

```html
<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:* ws://localhost:* https://generativelanguage.googleapis.com;"
    />
    <title>CS2 Assistant</title>
  </head>
  <body class="bg-[#09090b] text-[#f4f4f5] overflow-hidden select-none m-0 p-0">
    <div id="root"></div>
    <script type="module" src="/src/renderer/main.tsx"></script>
  </body>
</html>
```

### Minimal Entry Component (`src/renderer/main.tsx` & `App.tsx`)
To ensure `npm run build` succeeds immediately once files are placed:

Target File: `c:\Users\conta\Desktop\CS2Agent\src\renderer\main.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
```

Target File: `c:\Users\conta\Desktop\CS2Agent\src\renderer\App.tsx`
```tsx
import React from 'react';

export default function App(): JSX.Element {
  return (
    <div className="flex h-screen w-screen flex-col bg-background text-zinc-100">
      <header className="flex h-12 items-center justify-between border-b border-border-subtle px-4">
        <h1 className="text-sm font-semibold tracking-wider text-zinc-200">CS2 ASSISTANT</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-background-container px-2.5 py-0.5 text-xs text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          STANDBY
        </span>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <p className="text-xs text-zinc-500">Repository Foundation Initialized</p>
      </main>
    </div>
  );
}
```

---

## 8. Windows Environment Caveat & Fix

During environment probing on this Windows host, an unclosed double quote was detected in the system `$env:PATH`:
`C:\Program Files\dotnet"`
When npm batch scripts or child process spawners (such as `cmd.exe /c npx`) parse the `PATH` string with an unclosed double quote, path resolution breaks, causing errors such as:
`'"node"' is not recognized as an internal or external command, operable program or batch file.`

### Fix:
Before executing terminal build or test commands in PowerShell sessions, sanitize the PATH:
```powershell
$env:PATH = ($env:PATH -replace 'dotnet"', 'dotnet')
```
This guarantees all Node, npm, and tsc subprocesses spawn without errors.

---

## 9. Summary Specification Checklist

| Item | Target File | Status / Verification Criteria |
| :--- | :--- | :--- |
| **package.json** | `c:\Users\conta\Desktop\CS2Agent\package.json` | Fully specified with scripts (`build`, `test`, `dev`), `@google/genai` `^2.30.0`, Tailwind v3, Electron 33, Vitest 2. |
| **tsconfig.json** | `c:\Users\conta\Desktop\CS2Agent\tsconfig.json` | Renderer/Core/Shared/Tests/Configs with `noEmit: true`, `bundler` resolution, path aliases. |
| **tsconfig.node.json** | `c:\Users\conta\Desktop\CS2Agent\tsconfig.node.json` | Main/Preload/Core/Shared compilation to `dist/`, `rootDir: "./src"`, `module: NodeNext`. |
| **vite.config.ts** | `c:\Users\conta\Desktop\CS2Agent\vite.config.ts` | React plugin, `base: './'`, `outDir: 'dist/renderer'`, path aliases matching tsconfig. |
| **vitest.config.ts** | `c:\Users\conta\Desktop\CS2Agent\vitest.config.ts` | `jsdom` environment, `globals: true`, multi-pattern test inclusion, V8 coverage. |
| **tailwind.config.js** | `c:\Users\conta\Desktop\CS2Agent\tailwind.config.js` | Tailwind v3 syntax, precision dark palette (zinc-950, charcoal, tactical cyan/emerald/amber/rose). |
| **postcss.config.js** | `c:\Users\conta\Desktop\CS2Agent\postcss.config.js` | Standard Tailwind + Autoprefixer plugin registration. |
| **index.html** | `c:\Users\conta\Desktop\CS2Agent\index.html` | Minimal entry point with strict CSP and zero white-flash dark styling. |
