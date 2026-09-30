---
paths:
  - "src/**/__tests__/**"
  - "src/**/*.spec.ts"
---

# Тесты Rise UI Kit

- Vitest 4 + `@testing-library/vue`, `@testing-library/user-event`, `@testing-library/jest-dom`, jsdom; конфиг — `build/tests/vitest.config.ts`, проект `unit-integration`.
- Раскладка компонента: `__tests__/<BaseX>.spec.ts` — unit, `<BaseX>.integration.spec.ts` — связка с другими компонентами кита, `<BaseX>.visual.spec.ts` — скриншоты историй (Playwright); тесты composables и утилит — рядом с кодом.
- Проверяй поведение глазами пользователя: `getByRole` и доступные имена, `user-event` для клавиатуры и ввода, `emitted()` для событий, `aria-*` и видимость; тексты — из словарей (`UI_TEXT`, `UI_ARIA`…), не строками.
- Время — `vi.useFakeTimers()`; без `Math.random()`, сети и внешних URL.
- Комментариев в тестах `src/components/**` нет (`rise/no-comments`); размер тестов линтер не ограничивает.
- Покрытие: компоненты — 100% строк, функций и операторов на файл; composables и утилиты — 100% по всем метрикам; исключения — `--coverage.exclude` в скриптах `test:*:coverage`. Прогон с порогом по путям — в `.claude/agents/rise-test-writer.md`.
- Скриншот-тесты: `openStory`, `expectStoryScreenshot`, `VISUAL_THEMES` из `build/tests/visual.ts`; запуск только с `--update-snapshots=none`, эталоны создаёт и обновляет только владелец. Play историй из этих тестов не кликает по триггерам меню и выпадающих списков: часы остановлены (docs/design/FOLLOW_UPS.md, № 56).
- Тест выявил ошибку — исправляй код, а не ослабляй проверку.
