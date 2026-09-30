---
name: new-component
description: Новый компонент Rise UI Kit — заготовка через npm run create:component и заполнение конвейером агентов (код, тесты, истории, проверки, ревью, один коммит).
argument-hint: <Name> <Раздел> [display|interactive|form]
arguments: [name, group, kind]
disable-model-invocation: true
---

Новый компонент `$name` в разделе `$group`, вид — `$kind`.

1. **Сроки** — первой строкой: оценка каждого этапа и всего компонента (UTC+3), дальше — как в `/portion`.
2. Вид не указан — выбери по смыслу и скажи, почему: `display` — только показ, `interactive` — есть действия, `form` — поле формы. Флаги `--loading`, `--empty`, `--long` — если у компонента есть такие состояния.
3. `npm run create:component -- $name --group=$group --kind=<вид> --dry-run` — покажи владельцу, какие файлы появятся; затем та же команда без `--dry-run`. Имя — в PascalCase, приставку `Base` скрипт добавит сам (`Kbd` → `BaseKbd`); раздел — из `storySort` в build/storybook/preview.ts (Element, Form, Data, Navigation, Overlay, Layout, Media, Chat, Editor…), иначе скрипт остановится.
4. Дальше — порядок `/portion`: код (`rise-component-dev`), тесты и истории параллельно (`rise-test-writer`, `rise-storybook`) — заполнить все `TODO(scaffold)`, проверки (`rise-checker`), ревью (`rise-reviewer`).
5. Документы: новый компонент — в docs/reference/COMPONENTS.md; вид — в docs/design/VISUAL_CHANGES.md; изменения для приложений — в docs/v2/MIGRATION.md.
6. Один коммит `feat(<область>): компонент $name …`, отчёт владельцу — как в `/portion`.
