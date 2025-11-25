# 🤝 Contributing to Local Localizator

Thank you for your interest in contributing to **Local Localizator**! Whether you're fixing a typo, improving the UI, adding a new language parser, or suggesting a feature—we welcome your help to make this tool even better for developers around the world.

Please take a moment to review this guide to ensure a smooth and collaborative experience.

---

## 📌 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How Can I Help?](#-how-can-i-help)
- [Getting Started](#-getting-started)
- [Development Setup](#-development-setup)
- [Project Structure](#-project-structure)
- [Commit & Pull Request Guidelines](#-commit--pull-request-guidelines)
- [Reporting Bugs](#-reporting-bugs)
- [Suggesting Features](#-suggesting-features)
- [License](#-license)

---

## 🧾 Code of Conduct

By participating, you agree to uphold a respectful, inclusive, and harassment-free environment. See our [Code of Conduct](CODE_OF_CONDUCT.md) for details.

---

## 🙌 How Can I Help?

You can contribute in many ways:

- **Bug fixes**: Tackle open issues labeled `bug` or `good first issue`.
- **Features**: Implement new functionality (e.g., support for YAML, CSV export).
- **Documentation**: Improve READMEs, user guides, or in-app tooltips.
- **Testing**: Write or improve unit/E2E tests.
- **Localization**: Help translate Local Localizator’s own UI!
- **Design & UX**: Suggest improvements to the interface or workflow.

---

## 🚀 Getting Started

1. **Fork** the repository to your GitHub account.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/MohKamal/local-localizator.git
   cd Local Localizator
   ```
3. Create a new **feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

4. Create a new **bug branch**:
   ```bash
   git checkout -b fix/your-bug-name
   ```

---

## ⚙️ Development Setup

### Prerequisites
- Node.js ≥ v18
- npm, pnpm, or yarn (we recommend **pnpm**)

### Install Dependencies
```bash
pnpm install
```

### Start the Dev App
```bash
pnpm dev
```
This launches the Electron app with hot-reloading via Vite + React 19.

### Build for Production
```bash
pnpm build
pnpm package
```

---

## 🗂️ Project Structure

```
Local Localizator/
|__ electron/
│   ├── main/              # Electron main process (Node.js)
│   ├── preload/           # Preload script (secure bridge)
├── src/
├── public/                # Static assets
└── vite.config.ts         # Build & dev config
```

---

## 📝 Commit & Pull Request Guidelines

- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/)  
  Examples:  
  - `feat: add CSV export for translations`  
  - `fix: prevent app crash when loading empty JSON`  
  - `docs: update contributing guide`

- **Pull Requests**:
  - Reference relevant issues (e.g., `Closes #12`)
  - Include a clear description of the change
  - Ensure your code follows existing style (we use Prettier + ESLint)
  - Test your changes manually (and add unit tests if possible)

---

## 🐞 Reporting Bugs

1. Check if the issue already exists in [GitHub Issues](https://github.com/MohKamal/local-localizator/issues).
2. If not, open a **new issue** with:
   - A clear title
   - Steps to reproduce
   - Expected vs. actual behavior
   - OS, app version, and Node.js version

> 🛑 **Do not report security vulnerabilities publicly**—contact maintainers directly.

---

## 💡 Suggesting Features

We love ideas! To propose a new feature:

1. Open a **Feature Request** issue.
2. Explain:
   - The problem you’re trying to solve
   - Your proposed solution
   - Any alternatives you’ve considered

This helps us evaluate and prioritize thoughtfully.

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the project’s [MIT License](../LICENSE).

---

**Happy coding!** 🎉  
Your contributions make Local Localizator better for everyone.