# CI/CD environment files

Эта папка хранит только example-файлы для CI/CD переменных.

## Файлы

- `.env.ci.example` — общие переменные для CI/CD
- `.env.github.example` — переменные для GitHub Actions

## Важно

Реальные `.env` файлы и секреты нельзя коммитить в git.

Для GitHub реальные значения задаются здесь:

Settings → Secrets and variables → Actions

## Основные переменные

```env
ENABLE_CI=true
ENABLE_RELEASE=true
NODE_VERSION=24
RELEASE_BRANCH=main
NPM_CONFIG_PROVENANCE=true
