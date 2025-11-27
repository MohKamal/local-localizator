# 📚 Local Localizator — Developer Documentation

> **A React + Electron app for managing multi-language translation projects**

This documentation is intended for **developers contributing to or extending** the `local-localizator` codebase. It covers architecture, key components, data flow, testing, and contribution guidelines.

---

## 🗂️ Project Structure

```
src/
├── components/          # Reusable UI components
├── models/              # Core data models (e.g., Project)
├── providers/           # React Context providers (state management)
├── services/            # Business logic & I/O (e.g., projectService, statisticsService)
├── pipes/               # Data transformation utilities
├── utils/               # Constants & helpers (languages, project types)
├── __tests__/           # Unit & integration tests
└── main.jsx             # Electron + React entry point
```

---

## 🔑 Core Concepts

### 1. **Project Model**
- The `Project` class is the **central data unit**.
- Contains metadata, languages, translation keys, and file structure rules.
- Supports two object structures: **flated** (flat key-value) or **nested** (hierarchical JSON).
- Auto-generates file paths using templates like `/{lang}/local.json`.

### 2. **State Management**
- Uses **React Context** (not Redux):
  - `useProject()` — holds `selectedProject`
  - `useView()` — manages UI state: `'dashboard' | 'project-details' | 'import'`
  - `useI18n()` — handles app language (UI only, not project translations)

> ⚠️ **Note**: Project data is **not stored in React state** — it lives in `Project` instances managed by `projectService`.

### 3. **File I/O Flow**
```
UI Action → Project Method → projectService.save() → Electron (main) → Disk
```
- All disk operations go through `window.electronAPI`.
- Project files are stored as pretty-printed JSON (`.prj` extension).

---

## 🏗️ Key Classes & Services

### `Project` (`/models/project.js`)
Represents a translation project.

#### Key Methods:
| Method | Description |
|-------|-------------|
| `createKey(key, desc, values)` | Adds a new translation key |
| `updateKey(oldKey, ..., newKey)` | Renames or updates a key |
| `save()` | Persists to disk + updates stats |
| `saveFiles()` | Exports translations to target language files |
| `calculation()` | Recomputes progress, empty slots, status |

> ✅ **Best Practice**: Always call `project.save()` after mutating translation data.

---

### `ProjectService` (`/services/project.service.js`)
Handles CRUD operations for `Project` instances.

#### Public API:
```js
await projectService.save(project)
const project = await projectService.load("project.prj")
await projectService.delete(project)
const projects = await projectService.scan() // loads all .prj files
```

> 💡 Uses `Promise.allSettled()` to skip corrupted files during scan.

---

### `StatisticsService` (`/services/statistics.service.js`)
Computes translation metrics.

#### Key Methods:
| Method | Returns |
|-------|--------|
| `getKeyCount(project)` | Number of unique keys (from base language) |
| `getSlotsCount(project)` | Total translation slots = keys × languages |
| `getEmptySlots(project)` | `{ en: 2, fr: 5 }` — empty slots per language |
| `getTranslatedProgress(project)` | `%` complete (0–100) |

> ⚡ All methods are **synchronous** (no file I/O) → fast and testable.

---

## 🧪 Testing Strategy

### Unit Tests (Jest)
- Located in `__tests__/`
- Mock Electron API and external dependencies
- Focus on **business logic**, not UI rendering

#### Example: Testing Project Creation
```js
test("throws if no languages provided", () => {
  expect(() => new Project({ name: "Test", folder: "/test", languages: [] }))
    .toThrow("At least one language is required");
});
```

### How to Run
```bash
npm test                  # run all tests
npm test -- --coverage    # with coverage report
```

> ✅ **Coverage Goal**: >80% for `models/` and `services/`

---

## 🎨 UI Components (React)

### Key Components
| Component | Purpose |
|---------|--------|
| `Dashboard` | Main app shell (nav + view router) |
| `ProjectDetails` | Edit project metadata & translations |
| `NewProjectModal` | Create/edit project form |
| `TranslationTable` | Grid editor for translation keys |
| `LanguageSelector` | Switch app UI language |

### Animation & UX
- Uses **Framer Motion** for smooth transitions
- All buttons use `whileHover`/`whileTap` micro-interactions
- Modal system with proper focus trapping & a11y labels

> 🔍 **Performance Tip**: Heavy lists (e.g., translation table) should use `React.memo` + stable props.

---

## 🌐 Internationalization (i18n)

### Two Layers of Translation:
1. **App UI** — managed by `useI18n()` context
   - Stored in JSON files (e.g., `en.json`, `fr.json`)
   - Keys like `"dashboard.title"`, `"button.save"`
2. **Project Translations** — stored in `Project.translation`
   - User-defined content (e.g., `"welcome_message": "Hello!"`)

> ❌ Do **not** confuse the two! Project translations are **data**, not UI strings.

---

## 🛠️ Development Workflow

### Setup
```bash
git clone ...
npm install
npm start  # launches Electron dev app
```

### Electron API Contract (`window.electronAPI`)
Your renderer process can call:
```js
// File I/O
await window.electronAPI.saveData(data, filename)
await window.electronAPI.loadData(filename)
await window.electronAPI.deleteProject(filename)

// Dialogs
await window.electronAPI.openFolderDialog()

// Utils
await window.electronAPI.pathJoin(dir, file)
await window.electronAPI.scanProject() // returns { type, path }[]
```

> 📂 Project files are saved in the user’s chosen folder (not app data directory).

---

## 📝 Contribution Guidelines

1. **Write tests** for new logic in `models/` or `services/`
2. **Use `useCallback`/`useMemo`** in components to prevent re-renders
3. **Validate inputs** in constructors/methods (fail fast)
4. **Handle errors gracefully** — never crash on bad project files
5. **Keep UI strings translatable** — use `t("key")` everywhere

### Naming Conventions
- **Classes**: `PascalCase` (`Project`, `StatisticsService`)
- **Components**: `PascalCase` (`ProjectDetails`)
- **Services**: `camelCase` singleton (`projectService`)
- **Methods**: `camelCase` (`getTranslatedProgress`)

---

## 🚀 Future Roadmap (Ideas)

- [ ] Undo/redo stack for translation edits
- [ ] Auto-backup project files
- [ ] Cloud sync (Firebase)
- [ ] Real-time collaboration
- [ ] Export to YAML formats

---

> ✨ **You’re ready to contribute!**  
> Questions? Open a GitHub issue or tag `@dev-team` in PRs.

📄 *Generated on: November 27, 2025*  
🔗 *Project: local-localizator*