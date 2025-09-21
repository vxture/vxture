# Vxture Configuration File Documentation Index

This document provides an index of all configuration file explanations in the project, making it easy to find and understand the purpose and options of each config file.

## Configuration File Overview

### Frontend Configuration Files

| File                 | Purpose                                 | Detailed Explanation                       |
| -------------------- | --------------------------------------- | ------------------------------------------ |
| `package.json`       | Project dependencies, scripts, metadata | [See details](./package.json解析.md)       |
| `tsconfig.json`      | TypeScript compiler options             | [See details](./tsconfig.json解析.md)      |
| `next.config.js`     | Next.js framework customization         | [See details](./next.config.js解析.md)     |
| `postcss.config.js`  | CSS post-processing toolchain           | [See details](./postcss.config.js解析.md)  |
| `tailwind.config.js` | Tailwind CSS customization              | [See details](./tailwind.config.js解析.md) |

### Code Quality Tools

| File                | Purpose                | Detailed Explanation                      |
| ------------------- | ---------------------- | ----------------------------------------- |
| `.eslintrc.json`    | JS/TS linting rules    | [See details](./.eslintrc.json解析.md)    |
| `.prettierrc.json`  | Code formatting rules  | [See details](./.prettierrc.json解析.md)  |
| `.stylelintrc.json` | CSS/SCSS linting rules | [See details](./.stylelintrc.json解析.md) |
| `.gitignore`        | Git ignore patterns    | [See details](./.gitignore解析.md)        |

### Environment Configuration

| File                  | Purpose                       | Detailed Explanation                 |
| --------------------- | ----------------------------- | ------------------------------------ |
| `.env.local.template` | Environment variable template | [See details](./环境变量配置解析.md) |

### Backend Configuration

| File               | Purpose                        | Detailed Explanation                     |
| ------------------ | ------------------------------ | ---------------------------------------- |
| `requirements.txt` | Python backend dependencies    | [See details](./requirements.txt解析.md) |
| Database config    | Database connection and schema | [See details](./数据库配置解析.md)       |

### Project Documentation

| File              | Purpose                        | Detailed Explanation              |
| ----------------- | ------------------------------ | --------------------------------- |
| `README.md`       | Project overview & style guide | [See details](./README.md解析.md) |
| Project structure | Directory & file organization  | (Removed)                         |

## Usage Guide

1. **Find a specific config**: Use the tables above to locate the explanation for any config file.
2. **Understand config options**: Each explanation details the purpose and usage of config options.
3. **Best practices**: Each doc provides best practice recommendations.
4. **Example configs**: Some docs include example configurations for common scenarios.

## Notes

- Sensitive information (API keys, DB passwords, etc.) should be stored in environment variables, not hardcoded in config files.
- After editing config files, you may need to restart the dev server or rebuild the project.
- Some config changes may require cache clearing to take effect.
- Changes to environment variables require a server restart.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Config Reference](https://www.typescriptlang.org/tsconfig)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
