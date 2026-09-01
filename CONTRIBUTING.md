# Contributing to MicroJob Pro

Thank you for your interest in contributing to **MicroJob Pro**! We welcome contributions to enhance features, fix bugs, optimize performance, and improve documentation.

---

## 🛠 Development Workflow

### 1. Fork & Clone
```bash
git clone https://github.com/your-username/microjob-pro.git
cd microjob-pro
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/issue-description
```

### 4. Start Development Server
```bash
npm run dev
```

The app will run on `http://localhost:3000`.

---

## 📋 Coding Guidelines

- **TypeScript**: All source files in `src/` must be strictly typed. Avoid using `any` wherever possible.
- **Styling**: Use **Tailwind CSS** utility classes directly in JSX. Do not create external `.css` files.
- **Icons**: Import all icons exclusively from `lucide-react`.
- **Animations**: Use `motion` from `motion/react` for route transitions and micro-interactions.
- **State Changes**: When modifying `AppContext.tsx`, ensure storage synchronizers maintain backward compatibility with existing `localStorage` keys.

---

## 🧪 Validation & Linting

Before committing your changes, ensure there are no TypeScript or compilation errors:

```bash
# Typecheck
npm run lint

# Production build test
npm run build
```

---

## 🚀 Pull Request Checklist

1. [ ] Branch is rebased onto the latest `main` branch.
2. [ ] `npm run lint` passes with zero errors.
3. [ ] `npm run build` generates clean assets in `dist/`.
4. [ ] Detailed description of changes, screenshots (if applicable), and motivation provided in the PR.
