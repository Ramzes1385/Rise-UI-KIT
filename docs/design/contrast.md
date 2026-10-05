# Контраст дизайн-токенов

Сгенерировано `node scripts/check-contrast.mjs --theme=all --markdown docs/design/contrast.md` из `src/styles/_tokens.scss` и пресетов `THEME_PRESETS` (сиды темы поверх токенов кита).
Пороги WCAG 2.2 AA: текст — 4.5:1, графика и кольцо фокуса — 3:1. «Справочно» — пары, которые не обязаны проходить порог
(плейсхолдеры и неактивный текст исключены из требования 1.4.3; рамка поля — декоративная, поле обозначено подписью и фоном).

## Светлая тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #18181b | `--rise-bg` #ffffff | 17.72 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #18181b | `--rise-bg-muted` #fafafa | 16.97 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #18181b | `--rise-bg-elevated` #f4f4f5 | 16.12 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #3f3f46 | `--rise-bg` #ffffff | 10.44 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #3f3f46 | `--rise-bg-muted` #fafafa | 10.01 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #3f3f46 | `--rise-bg-elevated` #f4f4f5 | 9.50 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #52525b | `--rise-bg` #ffffff | 7.73 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #52525b | `--rise-bg-muted` #fafafa | 7.41 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #52525b | `--rise-bg-elevated` #f4f4f5 | 7.03 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #71717a | `--rise-bg` #ffffff | 4.83 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #71717a | `--rise-bg-muted` #fafafa | 4.63 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #71717a | `--rise-bg-elevated` #f4f4f5 | 4.40 | 4.5 | справочно |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #a1a1aa | `--rise-bg` #ffffff | 2.56 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #ffffff | `--rise-bg-inverted` #18181b | 17.72 | 4.5 | проходит |
| Рамка поля ввода | `--rise-border-accented` #d4d4d8 | `--rise-bg` #ffffff | 1.48 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #c2410c | `--rise-bg` #ffffff | 5.18 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg` #ffffff | 5.36 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg-muted` #fafafa | 5.13 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg-elevated` #f4f4f5 | 4.87 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-primary-soft` #fff7ed | 5.04 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg` #ffffff | 12.81 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg-muted` #fafafa | 12.27 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg-elevated` #f4f4f5 | 11.65 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-primary-soft` #fff7ed | 12.06 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg` #ffffff | 7.59 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg-muted` #fafafa | 7.28 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg-elevated` #f4f4f5 | 6.91 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-primary-soft` #fff7ed | 7.15 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg` #ffffff | 6.39 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg-muted` #fafafa | 6.12 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg-elevated` #f4f4f5 | 5.81 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-primary-soft` #fff7ed | 6.02 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg` #ffffff | 5.05 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg-muted` #fafafa | 4.83 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg-elevated` #f4f4f5 | 4.59 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-primary-soft` #fff7ed | 4.75 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg-muted` #fafafa | 7.08 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg-elevated` #f4f4f5 | 6.73 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-primary-soft` #fff7ed | 6.96 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg` #ffffff | 7.59 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg-muted` #fafafa | 7.28 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg-elevated` #f4f4f5 | 6.91 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-primary-soft` #fff7ed | 7.15 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg-muted` #fafafa | 7.08 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg-elevated` #f4f4f5 | 6.72 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-primary-soft` #fff7ed | 6.96 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg-muted` #fafafa | 7.08 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg-elevated` #f4f4f5 | 6.72 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-primary-soft` #fff7ed | 6.96 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #ffffff | `--rise-primary` #c2410c | 5.18 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #ffffff | `--rise-primary-hover` #9a3412 | 7.31 | 4.5 | проходит |
| Цвет primary как текст на фоне | `--rise-primary` #c2410c | `--rise-bg` #ffffff | 5.18 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #9a3412 | `--rise-primary-soft` #fff7ed | 6.88 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #9a3412 | `--rise-primary-soft-hover` #ffedd5 | 6.38 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #c2410c | `--rise-primary-soft` #fff7ed | 4.88 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #c2410c | `--rise-bg-elevated` #f4f4f5 | 4.71 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #ffffff | `--rise-success` #15803d | 5.02 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #ffffff | `--rise-success-hover` #166534 | 7.13 | 4.5 | проходит |
| Цвет success как текст на фоне | `--rise-success` #15803d | `--rise-bg` #ffffff | 5.02 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #166534 | `--rise-success-soft` #f0fdf4 | 6.81 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #166534 | `--rise-success-soft-hover` #dcfce7 | 6.49 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #15803d | `--rise-success-soft` #f0fdf4 | 4.79 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #15803d | `--rise-bg-elevated` #f4f4f5 | 4.56 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #ffffff | `--rise-info` #2563eb | 5.17 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #ffffff | `--rise-info-hover` #1d4ed8 | 6.70 | 4.5 | проходит |
| Цвет info как текст на фоне | `--rise-info` #2563eb | `--rise-bg` #ffffff | 5.17 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #1e40af | `--rise-info-soft` #eff6ff | 8.01 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #1e40af | `--rise-info-soft-hover` #dbeafe | 7.15 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #2563eb | `--rise-info-soft` #eff6ff | 4.75 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #2563eb | `--rise-bg-elevated` #f4f4f5 | 4.70 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #ffffff | `--rise-warning` #b45309 | 5.02 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #ffffff | `--rise-warning-hover` #92400e | 7.09 | 4.5 | проходит |
| Цвет warning как текст на фоне | `--rise-warning` #b45309 | `--rise-bg` #ffffff | 5.02 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #92400e | `--rise-warning-soft` #fffbeb | 6.84 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #92400e | `--rise-warning-soft-hover` #fef3c7 | 6.37 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #b45309 | `--rise-warning-soft` #fffbeb | 4.84 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #b45309 | `--rise-bg-elevated` #f4f4f5 | 4.57 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #ffffff | `--rise-error` #dc2626 | 4.83 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #ffffff | `--rise-error-hover` #b91c1c | 6.47 | 4.5 | проходит |
| Цвет error как текст на фоне | `--rise-error` #dc2626 | `--rise-bg` #ffffff | 4.83 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #991b1b | `--rise-error-soft` #fef2f2 | 7.60 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #991b1b | `--rise-error-soft-hover` #fee2e2 | 6.80 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #dc2626 | `--rise-error-soft` #fef2f2 | 4.41 | 4.5 | справочно |
| Графика error на bg-elevated | `--rise-error` #dc2626 | `--rise-bg-elevated` #f4f4f5 | 4.39 | 3 | проходит |

## Тёмная тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg` #18181b | 17.72 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg-muted` #27272a | 14.89 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg-elevated` #27272a | 14.89 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #e4e4e7 | `--rise-bg` #18181b | 13.96 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #e4e4e7 | `--rise-bg-muted` #27272a | 11.74 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #e4e4e7 | `--rise-bg-elevated` #27272a | 11.74 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #d4d4d8 | `--rise-bg` #18181b | 11.99 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #d4d4d8 | `--rise-bg-muted` #27272a | 10.08 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #d4d4d8 | `--rise-bg-elevated` #27272a | 10.08 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #a1a1aa | `--rise-bg` #18181b | 6.91 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #a1a1aa | `--rise-bg-muted` #27272a | 5.81 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #a1a1aa | `--rise-bg-elevated` #27272a | 5.81 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #71717a | `--rise-bg` #18181b | 3.67 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #18181b | `--rise-bg-inverted` #ffffff | 17.72 | 4.5 | проходит |
| Рамка поля ввода | `--rise-border-accented` #3f3f46 | `--rise-bg` #18181b | 1.70 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #fb923c | `--rise-bg` #18181b | 7.83 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg` #18181b | 7.03 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg-muted` #27272a | 5.91 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg-elevated` #27272a | 5.91 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-primary-soft` #33271f | 5.75 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg` #18181b | 11.53 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg-muted` #27272a | 9.69 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg-elevated` #27272a | 9.69 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-primary-soft` #33271f | 9.44 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg` #18181b | 9.11 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg-muted` #27272a | 7.66 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg-elevated` #27272a | 7.66 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-primary-soft` #33271f | 7.46 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg` #18181b | 6.98 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg-muted` #27272a | 5.87 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg-elevated` #27272a | 5.87 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-primary-soft` #33271f | 5.72 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg` #18181b | 9.10 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg-muted` #27272a | 7.65 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg-elevated` #27272a | 7.65 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-primary-soft` #33271f | 7.45 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg` #18181b | 11.53 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg-muted` #27272a | 9.69 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg-elevated` #27272a | 9.69 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-primary-soft` #33271f | 9.44 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg` #18181b | 9.11 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg-muted` #27272a | 7.66 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg-elevated` #27272a | 7.66 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-primary-soft` #33271f | 7.46 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg` #18181b | 9.15 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg-muted` #27272a | 7.69 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg-elevated` #27272a | 7.69 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-primary-soft` #33271f | 7.49 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg` #18181b | 9.15 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg-muted` #27272a | 7.69 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg-elevated` #27272a | 7.69 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-primary-soft` #33271f | 7.49 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #09090b | `--rise-primary` #fb923c | 8.79 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #09090b | `--rise-primary-hover` #fdba74 | 11.80 | 4.5 | проходит |
| Цвет primary как текст на фоне | `--rise-primary` #fb923c | `--rise-bg` #18181b | 7.83 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #fdba74 | `--rise-primary-soft` #33271f | 8.60 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #fdba74 | `--rise-primary-soft-hover` #412e21 | 7.61 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #fb923c | `--rise-primary-soft` #33271f | 6.41 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #fb923c | `--rise-bg-elevated` #27272a | 6.58 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #09090b | `--rise-success` #4ade80 | 11.42 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #09090b | `--rise-success-hover` #86efac | 14.17 | 4.5 | проходит |
| Цвет success как текст на фоне | `--rise-success` #4ade80 | `--rise-bg` #18181b | 10.17 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #86efac | `--rise-success-soft` #1e3027 | 9.95 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #86efac | `--rise-success-soft-hover` #213c2d | 8.59 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #4ade80 | `--rise-success-soft` #1e3027 | 8.02 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #4ade80 | `--rise-bg-elevated` #27272a | 8.55 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #09090b | `--rise-info` #60a5fa | 7.83 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #09090b | `--rise-info-hover` #93c5fd | 11.03 | 4.5 | проходит |
| Цвет info как текст на фоне | `--rise-info` #60a5fa | `--rise-bg` #18181b | 6.97 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #93c5fd | `--rise-info-soft` #212936 | 8.13 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #93c5fd | `--rise-info-soft-hover` #253143 | 7.25 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #60a5fa | `--rise-info-soft` #212936 | 5.77 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #60a5fa | `--rise-bg-elevated` #27272a | 5.86 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #09090b | `--rise-warning` #fbbf24 | 11.92 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #09090b | `--rise-warning-hover` #fcd34d | 13.80 | 4.5 | проходит |
| Цвет warning как текст на фоне | `--rise-warning` #fbbf24 | `--rise-bg` #18181b | 10.61 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #fcd34d | `--rise-warning-soft` #332c1c | 9.58 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #fcd34d | `--rise-warning-soft-hover` #41361d | 8.23 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #fbbf24 | `--rise-warning-soft` #332c1c | 8.28 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #fbbf24 | `--rise-bg-elevated` #27272a | 8.92 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #09090b | `--rise-error` #f87171 | 7.19 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #09090b | `--rise-error-hover` #fca5a5 | 10.48 | 4.5 | проходит |
| Цвет error как текст на фоне | `--rise-error` #f87171 | `--rise-bg` #18181b | 6.40 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #fca5a5 | `--rise-error-soft` #332325 | 7.88 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #fca5a5 | `--rise-error-soft-hover` #40282a | 7.10 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #f87171 | `--rise-error-soft` #332325 | 5.41 | 4.5 | проходит |
| Графика error на bg-elevated | `--rise-error` #f87171 | `--rise-bg-elevated` #27272a | 5.38 | 3 | проходит |

## Пресет rise — светлая тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #18181b | `--rise-bg` #ffffff | 17.72 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #18181b | `--rise-bg-muted` #fafafa | 16.97 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #18181b | `--rise-bg-elevated` #f4f4f5 | 16.12 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #3f3f46 | `--rise-bg` #ffffff | 10.44 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #3f3f46 | `--rise-bg-muted` #fafafa | 10.01 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #3f3f46 | `--rise-bg-elevated` #f4f4f5 | 9.50 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #52525b | `--rise-bg` #ffffff | 7.73 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #52525b | `--rise-bg-muted` #fafafa | 7.41 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #52525b | `--rise-bg-elevated` #f4f4f5 | 7.03 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #71717a | `--rise-bg` #ffffff | 4.83 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #71717a | `--rise-bg-muted` #fafafa | 4.63 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #71717a | `--rise-bg-elevated` #f4f4f5 | 4.40 | 4.5 | справочно |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #a1a1aa | `--rise-bg` #ffffff | 2.56 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #ffffff | `--rise-bg-inverted` #18181b | 17.72 | 4.5 | проходит |
| Рамка поля ввода | `--rise-border-accented` #d4d4d8 | `--rise-bg` #ffffff | 1.48 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #c2410c | `--rise-bg` #ffffff | 5.18 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg` #ffffff | 5.36 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg-muted` #fafafa | 5.13 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg-elevated` #f4f4f5 | 4.87 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-primary-soft` #fff7ed | 5.04 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg` #ffffff | 12.81 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg-muted` #fafafa | 12.27 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg-elevated` #f4f4f5 | 11.65 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-primary-soft` #fff7ed | 12.06 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg` #ffffff | 7.59 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg-muted` #fafafa | 7.28 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg-elevated` #f4f4f5 | 6.91 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-primary-soft` #fff7ed | 7.15 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg` #ffffff | 6.39 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg-muted` #fafafa | 6.12 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg-elevated` #f4f4f5 | 5.81 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-primary-soft` #fff7ed | 6.02 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg` #ffffff | 5.05 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg-muted` #fafafa | 4.83 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg-elevated` #f4f4f5 | 4.59 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-primary-soft` #fff7ed | 4.75 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg-muted` #fafafa | 7.08 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg-elevated` #f4f4f5 | 6.73 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-primary-soft` #fff7ed | 6.96 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg` #ffffff | 7.59 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg-muted` #fafafa | 7.28 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg-elevated` #f4f4f5 | 6.91 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-primary-soft` #fff7ed | 7.15 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg-muted` #fafafa | 7.08 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg-elevated` #f4f4f5 | 6.72 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-primary-soft` #fff7ed | 6.96 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg-muted` #fafafa | 7.08 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg-elevated` #f4f4f5 | 6.72 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-primary-soft` #fff7ed | 6.96 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #ffffff | `--rise-primary` #c2410c | 5.18 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #ffffff | `--rise-primary-hover` #9a3412 | 7.31 | 4.5 | проходит |
| Цвет primary как текст на фоне | `--rise-primary` #c2410c | `--rise-bg` #ffffff | 5.18 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #9a3412 | `--rise-primary-soft` #fff7ed | 6.88 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #9a3412 | `--rise-primary-soft-hover` #ffedd5 | 6.38 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #c2410c | `--rise-primary-soft` #fff7ed | 4.88 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #c2410c | `--rise-bg-elevated` #f4f4f5 | 4.71 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #ffffff | `--rise-success` #15803d | 5.02 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #ffffff | `--rise-success-hover` #166534 | 7.13 | 4.5 | проходит |
| Цвет success как текст на фоне | `--rise-success` #15803d | `--rise-bg` #ffffff | 5.02 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #166534 | `--rise-success-soft` #f0fdf4 | 6.81 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #166534 | `--rise-success-soft-hover` #dcfce7 | 6.49 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #15803d | `--rise-success-soft` #f0fdf4 | 4.79 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #15803d | `--rise-bg-elevated` #f4f4f5 | 4.56 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #ffffff | `--rise-info` #2563eb | 5.17 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #ffffff | `--rise-info-hover` #1d4ed8 | 6.70 | 4.5 | проходит |
| Цвет info как текст на фоне | `--rise-info` #2563eb | `--rise-bg` #ffffff | 5.17 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #1e40af | `--rise-info-soft` #eff6ff | 8.01 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #1e40af | `--rise-info-soft-hover` #dbeafe | 7.15 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #2563eb | `--rise-info-soft` #eff6ff | 4.75 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #2563eb | `--rise-bg-elevated` #f4f4f5 | 4.70 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #ffffff | `--rise-warning` #b45309 | 5.02 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #ffffff | `--rise-warning-hover` #92400e | 7.09 | 4.5 | проходит |
| Цвет warning как текст на фоне | `--rise-warning` #b45309 | `--rise-bg` #ffffff | 5.02 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #92400e | `--rise-warning-soft` #fffbeb | 6.84 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #92400e | `--rise-warning-soft-hover` #fef3c7 | 6.37 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #b45309 | `--rise-warning-soft` #fffbeb | 4.84 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #b45309 | `--rise-bg-elevated` #f4f4f5 | 4.57 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #ffffff | `--rise-error` #dc2626 | 4.83 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #ffffff | `--rise-error-hover` #b91c1c | 6.47 | 4.5 | проходит |
| Цвет error как текст на фоне | `--rise-error` #dc2626 | `--rise-bg` #ffffff | 4.83 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #991b1b | `--rise-error-soft` #fef2f2 | 7.60 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #991b1b | `--rise-error-soft-hover` #fee2e2 | 6.80 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #dc2626 | `--rise-error-soft` #fef2f2 | 4.41 | 4.5 | справочно |
| Графика error на bg-elevated | `--rise-error` #dc2626 | `--rise-bg-elevated` #f4f4f5 | 4.39 | 3 | проходит |

## Пресет rise — тёмная тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg` #18181b | 17.72 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg-muted` #27272a | 14.89 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg-elevated` #27272a | 14.89 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #e4e4e7 | `--rise-bg` #18181b | 13.96 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #e4e4e7 | `--rise-bg-muted` #27272a | 11.74 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #e4e4e7 | `--rise-bg-elevated` #27272a | 11.74 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #d4d4d8 | `--rise-bg` #18181b | 11.99 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #d4d4d8 | `--rise-bg-muted` #27272a | 10.08 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #d4d4d8 | `--rise-bg-elevated` #27272a | 10.08 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #a1a1aa | `--rise-bg` #18181b | 6.91 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #a1a1aa | `--rise-bg-muted` #27272a | 5.81 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #a1a1aa | `--rise-bg-elevated` #27272a | 5.81 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #71717a | `--rise-bg` #18181b | 3.67 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #18181b | `--rise-bg-inverted` #ffffff | 17.72 | 4.5 | проходит |
| Рамка поля ввода | `--rise-border-accented` #3f3f46 | `--rise-bg` #18181b | 1.70 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #fb923c | `--rise-bg` #18181b | 7.83 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg` #18181b | 7.03 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg-muted` #27272a | 5.91 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg-elevated` #27272a | 5.91 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-primary-soft` #33271f | 5.75 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg` #18181b | 11.53 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg-muted` #27272a | 9.69 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg-elevated` #27272a | 9.69 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-primary-soft` #33271f | 9.44 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg` #18181b | 9.11 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg-muted` #27272a | 7.66 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg-elevated` #27272a | 7.66 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-primary-soft` #33271f | 7.46 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg` #18181b | 6.98 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg-muted` #27272a | 5.87 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg-elevated` #27272a | 5.87 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-primary-soft` #33271f | 5.72 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg` #18181b | 9.10 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg-muted` #27272a | 7.65 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg-elevated` #27272a | 7.65 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-primary-soft` #33271f | 7.45 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg` #18181b | 11.53 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg-muted` #27272a | 9.69 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg-elevated` #27272a | 9.69 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-primary-soft` #33271f | 9.44 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg` #18181b | 9.11 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg-muted` #27272a | 7.66 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg-elevated` #27272a | 7.66 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-primary-soft` #33271f | 7.46 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg` #18181b | 9.15 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg-muted` #27272a | 7.69 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg-elevated` #27272a | 7.69 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-primary-soft` #33271f | 7.49 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg` #18181b | 9.15 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg-muted` #27272a | 7.69 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg-elevated` #27272a | 7.69 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-primary-soft` #33271f | 7.49 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #09090b | `--rise-primary` #fb923c | 8.79 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #09090b | `--rise-primary-hover` #fdba74 | 11.80 | 4.5 | проходит |
| Цвет primary как текст на фоне | `--rise-primary` #fb923c | `--rise-bg` #18181b | 7.83 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #fdba74 | `--rise-primary-soft` #33271f | 8.60 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #fdba74 | `--rise-primary-soft-hover` #412e21 | 7.61 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #fb923c | `--rise-primary-soft` #33271f | 6.41 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #fb923c | `--rise-bg-elevated` #27272a | 6.58 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #09090b | `--rise-success` #4ade80 | 11.42 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #09090b | `--rise-success-hover` #86efac | 14.17 | 4.5 | проходит |
| Цвет success как текст на фоне | `--rise-success` #4ade80 | `--rise-bg` #18181b | 10.17 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #86efac | `--rise-success-soft` #1e3027 | 9.95 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #86efac | `--rise-success-soft-hover` #213c2d | 8.59 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #4ade80 | `--rise-success-soft` #1e3027 | 8.02 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #4ade80 | `--rise-bg-elevated` #27272a | 8.55 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #09090b | `--rise-info` #60a5fa | 7.83 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #09090b | `--rise-info-hover` #93c5fd | 11.03 | 4.5 | проходит |
| Цвет info как текст на фоне | `--rise-info` #60a5fa | `--rise-bg` #18181b | 6.97 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #93c5fd | `--rise-info-soft` #212936 | 8.13 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #93c5fd | `--rise-info-soft-hover` #253143 | 7.25 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #60a5fa | `--rise-info-soft` #212936 | 5.77 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #60a5fa | `--rise-bg-elevated` #27272a | 5.86 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #09090b | `--rise-warning` #fbbf24 | 11.92 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #09090b | `--rise-warning-hover` #fcd34d | 13.80 | 4.5 | проходит |
| Цвет warning как текст на фоне | `--rise-warning` #fbbf24 | `--rise-bg` #18181b | 10.61 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #fcd34d | `--rise-warning-soft` #332c1c | 9.58 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #fcd34d | `--rise-warning-soft-hover` #41361d | 8.23 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #fbbf24 | `--rise-warning-soft` #332c1c | 8.28 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #fbbf24 | `--rise-bg-elevated` #27272a | 8.92 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #09090b | `--rise-error` #f87171 | 7.19 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #09090b | `--rise-error-hover` #fca5a5 | 10.48 | 4.5 | проходит |
| Цвет error как текст на фоне | `--rise-error` #f87171 | `--rise-bg` #18181b | 6.40 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #fca5a5 | `--rise-error-soft` #332325 | 7.88 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #fca5a5 | `--rise-error-soft-hover` #40282a | 7.10 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #f87171 | `--rise-error-soft` #332325 | 5.41 | 4.5 | проходит |
| Графика error на bg-elevated | `--rise-error` #f87171 | `--rise-bg-elevated` #27272a | 5.38 | 3 | проходит |

## Пресет corporate — светлая тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #0c182a | `--rise-bg` #ffffff | 17.80 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #0c182a | `--rise-bg-muted` #f8fafe | 17.04 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #0c182a | `--rise-bg-elevated` #eef5ff | 16.22 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2c405d | `--rise-bg` #ffffff | 10.51 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2c405d | `--rise-bg-muted` #f8fafe | 10.06 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2c405d | `--rise-bg-elevated` #eef5ff | 9.58 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #3f5472 | `--rise-bg` #ffffff | 7.71 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #3f5472 | `--rise-bg-muted` #f8fafe | 7.38 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #3f5472 | `--rise-bg-elevated` #eef5ff | 7.03 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #5d7393 | `--rise-bg` #ffffff | 4.84 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #5d7393 | `--rise-bg-muted` #f8fafe | 4.63 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #5d7393 | `--rise-bg-elevated` #eef5ff | 4.41 | 4.5 | справочно |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #8aa2c3 | `--rise-bg` #ffffff | 2.61 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #ffffff | `--rise-bg-inverted` #0c182a | 17.80 | 4.5 | проходит |
| Рамка поля ввода | `--rise-border-accented` #bed7fa | `--rise-bg` #ffffff | 1.47 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #1d4ed8 | `--rise-bg` #ffffff | 6.70 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg` #ffffff | 5.36 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg-muted` #f8fafe | 5.12 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg-elevated` #eef5ff | 4.88 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-primary-soft` #f2f7ff | 4.98 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg` #ffffff | 12.81 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg-muted` #f8fafe | 12.26 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg-elevated` #eef5ff | 11.67 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-primary-soft` #f2f7ff | 11.91 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg` #ffffff | 7.59 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg-muted` #f8fafe | 7.27 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg-elevated` #eef5ff | 6.92 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-primary-soft` #f2f7ff | 7.06 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg` #ffffff | 6.39 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg-muted` #f8fafe | 6.11 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg-elevated` #eef5ff | 5.82 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-primary-soft` #f2f7ff | 5.94 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg` #ffffff | 5.05 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg-muted` #f8fafe | 4.83 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg-elevated` #eef5ff | 4.60 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-primary-soft` #f2f7ff | 4.69 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg-muted` #f8fafe | 7.07 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg-elevated` #eef5ff | 6.74 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-primary-soft` #f2f7ff | 6.87 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg` #ffffff | 7.59 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg-muted` #f8fafe | 7.27 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg-elevated` #eef5ff | 6.92 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-primary-soft` #f2f7ff | 7.06 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg-muted` #f8fafe | 7.07 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg-elevated` #eef5ff | 6.73 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-primary-soft` #f2f7ff | 6.87 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg-muted` #f8fafe | 7.07 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg-elevated` #eef5ff | 6.73 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-primary-soft` #f2f7ff | 6.87 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #ffffff | `--rise-primary` #1d4ed8 | 6.70 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #ffffff | `--rise-primary-hover` #1b41a7 | 8.90 | 4.5 | проходит |
| Цвет primary как текст на фоне | `--rise-primary` #1d4ed8 | `--rise-bg` #ffffff | 6.70 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #1b41a7 | `--rise-primary-soft` #f2f7ff | 8.27 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #1b41a7 | `--rise-primary-soft-hover` #e4edff | 7.56 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #1d4ed8 | `--rise-primary-soft` #f2f7ff | 6.23 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #1d4ed8 | `--rise-bg-elevated` #eef5ff | 6.11 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #ffffff | `--rise-success` #15803d | 5.02 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #ffffff | `--rise-success-hover` #166534 | 7.13 | 4.5 | проходит |
| Цвет success как текст на фоне | `--rise-success` #15803d | `--rise-bg` #ffffff | 5.02 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #166534 | `--rise-success-soft` #f0fdf4 | 6.81 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #166534 | `--rise-success-soft-hover` #dcfce7 | 6.49 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #15803d | `--rise-success-soft` #f0fdf4 | 4.79 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #15803d | `--rise-bg-elevated` #eef5ff | 4.57 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #ffffff | `--rise-info` #2563eb | 5.17 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #ffffff | `--rise-info-hover` #1d4ed8 | 6.70 | 4.5 | проходит |
| Цвет info как текст на фоне | `--rise-info` #2563eb | `--rise-bg` #ffffff | 5.17 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #1e40af | `--rise-info-soft` #eff6ff | 8.01 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #1e40af | `--rise-info-soft-hover` #dbeafe | 7.15 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #2563eb | `--rise-info-soft` #eff6ff | 4.75 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #2563eb | `--rise-bg-elevated` #eef5ff | 4.71 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #ffffff | `--rise-warning` #b45309 | 5.02 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #ffffff | `--rise-warning-hover` #92400e | 7.09 | 4.5 | проходит |
| Цвет warning как текст на фоне | `--rise-warning` #b45309 | `--rise-bg` #ffffff | 5.02 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #92400e | `--rise-warning-soft` #fffbeb | 6.84 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #92400e | `--rise-warning-soft-hover` #fef3c7 | 6.37 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #b45309 | `--rise-warning-soft` #fffbeb | 4.84 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #b45309 | `--rise-bg-elevated` #eef5ff | 4.58 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #ffffff | `--rise-error` #dc2626 | 4.83 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #ffffff | `--rise-error-hover` #b91c1c | 6.47 | 4.5 | проходит |
| Цвет error как текст на фоне | `--rise-error` #dc2626 | `--rise-bg` #ffffff | 4.83 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #991b1b | `--rise-error-soft` #fef2f2 | 7.60 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #991b1b | `--rise-error-soft-hover` #fee2e2 | 6.80 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #dc2626 | `--rise-error-soft` #fef2f2 | 4.41 | 4.5 | справочно |
| Графика error на bg-elevated | `--rise-error` #dc2626 | `--rise-bg-elevated` #eef5ff | 4.40 | 3 | проходит |

## Пресет corporate — тёмная тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg` #0c182a | 17.80 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg-muted` #152842 | 14.85 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg-elevated` #152842 | 14.85 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #d5e6fe | `--rise-bg` #0c182a | 14.05 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #d5e6fe | `--rise-bg-muted` #152842 | 11.72 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #d5e6fe | `--rise-bg-elevated` #152842 | 11.72 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #bed7fa | `--rise-bg` #0c182a | 12.11 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #bed7fa | `--rise-bg-muted` #152842 | 10.11 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #bed7fa | `--rise-bg-elevated` #152842 | 10.11 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #8aa2c3 | `--rise-bg` #0c182a | 6.81 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #8aa2c3 | `--rise-bg-muted` #152842 | 5.68 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #8aa2c3 | `--rise-bg-elevated` #152842 | 5.68 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #5d7393 | `--rise-bg` #0c182a | 3.68 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #0c182a | `--rise-bg-inverted` #ffffff | 17.80 | 4.5 | проходит |
| Рамка поля ввода | `--rise-border-accented` #2c405d | `--rise-bg` #0c182a | 1.69 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #76a1fe | `--rise-bg` #0c182a | 7.04 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg` #0c182a | 7.06 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg-muted` #152842 | 5.89 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg-elevated` #152842 | 5.89 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-primary-soft` #192843 | 5.81 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg` #0c182a | 11.58 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg-muted` #152842 | 9.66 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg-elevated` #152842 | 9.66 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-primary-soft` #192843 | 9.54 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg` #0c182a | 9.15 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg-muted` #152842 | 7.64 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg-elevated` #152842 | 7.64 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-primary-soft` #192843 | 7.54 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg` #0c182a | 7.01 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg-muted` #152842 | 5.85 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg-elevated` #152842 | 5.85 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-primary-soft` #192843 | 5.78 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg` #0c182a | 9.14 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg-muted` #152842 | 7.63 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg-elevated` #152842 | 7.63 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-primary-soft` #192843 | 7.53 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg` #0c182a | 11.59 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg-muted` #152842 | 9.67 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg-elevated` #152842 | 9.67 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-primary-soft` #192843 | 9.54 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg` #0c182a | 9.15 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg-muted` #152842 | 7.64 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg-elevated` #152842 | 7.64 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-primary-soft` #192843 | 7.54 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg` #0c182a | 9.19 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg-muted` #152842 | 7.67 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg-elevated` #152842 | 7.67 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-primary-soft` #192843 | 7.57 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg` #0c182a | 9.19 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg-muted` #152842 | 7.67 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg-elevated` #152842 | 7.67 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-primary-soft` #192843 | 7.57 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #010919 | `--rise-primary` #76a1fe | 7.87 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #010919 | `--rise-primary-hover` #a7c4fe | 11.35 | 4.5 | проходит |
| Цвет primary как текст на фоне | `--rise-primary` #76a1fe | `--rise-bg` #0c182a | 7.04 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #a7c4fe | `--rise-primary-soft` #192843 | 8.36 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #a7c4fe | `--rise-primary-soft-hover` #1f3150 | 7.44 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #76a1fe | `--rise-primary-soft` #192843 | 5.79 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #76a1fe | `--rise-bg-elevated` #152842 | 5.87 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #010919 | `--rise-success` #4ade80 | 11.43 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #010919 | `--rise-success-hover` #86efac | 14.18 | 4.5 | проходит |
| Цвет success как текст на фоне | `--rise-success` #4ade80 | `--rise-bg` #0c182a | 10.22 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #86efac | `--rise-success-soft` #133034 | 9.99 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #86efac | `--rise-success-soft-hover` #173c39 | 8.62 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #4ade80 | `--rise-success-soft` #133034 | 8.05 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #4ade80 | `--rise-bg-elevated` #152842 | 8.52 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #010919 | `--rise-info` #60a5fa | 7.83 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #010919 | `--rise-info-hover` #93c5fd | 11.04 | 4.5 | проходит |
| Цвет info как текст на фоне | `--rise-info` #60a5fa | `--rise-bg` #0c182a | 7.00 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #93c5fd | `--rise-info-soft` #162943 | 8.14 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #93c5fd | `--rise-info-soft-hover` #1b314f | 7.25 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #60a5fa | `--rise-info-soft` #162943 | 5.77 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #60a5fa | `--rise-bg-elevated` #152842 | 5.84 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #010919 | `--rise-warning` #fbbf24 | 11.93 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #010919 | `--rise-warning-hover` #fcd34d | 13.81 | 4.5 | проходит |
| Цвет warning как текст на фоне | `--rise-warning` #fbbf24 | `--rise-bg` #0c182a | 10.66 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #fcd34d | `--rise-warning-soft` #292c29 | 9.80 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #fcd34d | `--rise-warning-soft-hover` #373629 | 8.45 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #fbbf24 | `--rise-warning-soft` #292c29 | 8.46 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #fbbf24 | `--rise-bg-elevated` #152842 | 8.90 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #010919 | `--rise-error` #f87171 | 7.20 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #010919 | `--rise-error-hover` #fca5a5 | 10.49 | 4.5 | проходит |
| Цвет error как текст на фоне | `--rise-error` #f87171 | `--rise-bg` #0c182a | 6.44 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #fca5a5 | `--rise-error-soft` #282333 | 8.05 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #fca5a5 | `--rise-error-soft-hover` #362837 | 7.29 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #f87171 | `--rise-error-soft` #282333 | 5.52 | 4.5 | проходит |
| Графика error на bg-elevated | `--rise-error` #f87171 | `--rise-bg-elevated` #152842 | 5.37 | 3 | проходит |

## Пресет playful — светлая тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #18171d | `--rise-bg` #ffffff | 17.81 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #18171d | `--rise-bg-muted` #faf9ff | 17.01 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #18171d | `--rise-bg-elevated` #f4f3fc | 16.17 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #403e48 | `--rise-bg` #ffffff | 10.50 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #403e48 | `--rise-bg-muted` #faf9ff | 10.03 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #403e48 | `--rise-bg-elevated` #f4f3fc | 9.53 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #53515c | `--rise-bg` #ffffff | 7.78 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #53515c | `--rise-bg-muted` #faf9ff | 7.43 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #53515c | `--rise-bg-elevated` #f4f3fc | 7.07 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #72707b | `--rise-bg` #ffffff | 4.86 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #72707b | `--rise-bg-muted` #faf9ff | 4.64 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #72707b | `--rise-bg-elevated` #f4f3fc | 4.42 | 4.5 | справочно |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #a09eaa | `--rise-bg` #ffffff | 2.64 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #ffffff | `--rise-bg-inverted` #18171d | 17.81 | 4.5 | проходит |
| Рамка поля ввода | `--rise-border-accented` #d5d3df | `--rise-bg` #ffffff | 1.48 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #7c3aed | `--rise-bg` #ffffff | 5.70 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg` #ffffff | 5.36 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg-muted` #faf9ff | 5.12 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg-elevated` #f4f3fc | 4.86 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-primary-soft` #faf9ff | 5.12 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg` #ffffff | 12.81 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg-muted` #faf9ff | 12.23 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg-elevated` #f4f3fc | 11.63 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-primary-soft` #faf9ff | 12.23 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg` #ffffff | 7.59 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg-muted` #faf9ff | 7.25 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg-elevated` #f4f3fc | 6.90 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-primary-soft` #faf9ff | 7.25 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg` #ffffff | 6.39 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg-muted` #faf9ff | 6.10 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg-elevated` #f4f3fc | 5.80 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-primary-soft` #faf9ff | 6.10 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg` #ffffff | 5.05 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg-muted` #faf9ff | 4.82 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg-elevated` #f4f3fc | 4.58 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-primary-soft` #faf9ff | 4.82 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg-muted` #faf9ff | 7.06 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg-elevated` #f4f3fc | 6.71 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-primary-soft` #faf9ff | 7.06 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg` #ffffff | 7.59 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg-muted` #faf9ff | 7.25 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg-elevated` #f4f3fc | 6.90 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-primary-soft` #faf9ff | 7.25 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg-muted` #faf9ff | 7.05 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg-elevated` #f4f3fc | 6.71 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-primary-soft` #faf9ff | 7.05 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg-muted` #faf9ff | 7.05 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg-elevated` #f4f3fc | 6.71 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-primary-soft` #faf9ff | 7.05 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #ffffff | `--rise-primary` #7c3aed | 5.70 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #ffffff | `--rise-primary-hover` #6236b8 | 7.67 | 4.5 | проходит |
| Цвет primary как текст на фоне | `--rise-primary` #7c3aed | `--rise-bg` #ffffff | 5.70 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #6236b8 | `--rise-primary-soft` #faf9ff | 7.32 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #6236b8 | `--rise-primary-soft-hover` #f3f1fe | 6.87 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #7c3aed | `--rise-primary-soft` #faf9ff | 5.44 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #7c3aed | `--rise-bg-elevated` #f4f3fc | 5.18 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #ffffff | `--rise-success` #15803d | 5.02 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #ffffff | `--rise-success-hover` #166534 | 7.13 | 4.5 | проходит |
| Цвет success как текст на фоне | `--rise-success` #15803d | `--rise-bg` #ffffff | 5.02 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #166534 | `--rise-success-soft` #f0fdf4 | 6.81 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #166534 | `--rise-success-soft-hover` #dcfce7 | 6.49 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #15803d | `--rise-success-soft` #f0fdf4 | 4.79 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #15803d | `--rise-bg-elevated` #f4f3fc | 4.56 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #ffffff | `--rise-info` #2563eb | 5.17 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #ffffff | `--rise-info-hover` #1d4ed8 | 6.70 | 4.5 | проходит |
| Цвет info как текст на фоне | `--rise-info` #2563eb | `--rise-bg` #ffffff | 5.17 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #1e40af | `--rise-info-soft` #eff6ff | 8.01 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #1e40af | `--rise-info-soft-hover` #dbeafe | 7.15 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #2563eb | `--rise-info-soft` #eff6ff | 4.75 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #2563eb | `--rise-bg-elevated` #f4f3fc | 4.69 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #ffffff | `--rise-warning` #b45309 | 5.02 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #ffffff | `--rise-warning-hover` #92400e | 7.09 | 4.5 | проходит |
| Цвет warning как текст на фоне | `--rise-warning` #b45309 | `--rise-bg` #ffffff | 5.02 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #92400e | `--rise-warning-soft` #fffbeb | 6.84 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #92400e | `--rise-warning-soft-hover` #fef3c7 | 6.37 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #b45309 | `--rise-warning-soft` #fffbeb | 4.84 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #b45309 | `--rise-bg-elevated` #f4f3fc | 4.56 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #ffffff | `--rise-error` #dc2626 | 4.83 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #ffffff | `--rise-error-hover` #b91c1c | 6.47 | 4.5 | проходит |
| Цвет error как текст на фоне | `--rise-error` #dc2626 | `--rise-bg` #ffffff | 4.83 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #991b1b | `--rise-error-soft` #fef2f2 | 7.60 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #991b1b | `--rise-error-soft-hover` #fee2e2 | 6.80 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #dc2626 | `--rise-error-soft` #fef2f2 | 4.41 | 4.5 | справочно |
| Графика error на bg-elevated | `--rise-error` #dc2626 | `--rise-bg-elevated` #f4f3fc | 4.39 | 3 | проходит |

## Пресет playful — тёмная тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg` #18171d | 17.81 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg-muted` #28262f | 14.91 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg-elevated` #28262f | 14.91 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #e5e3ec | `--rise-bg` #18171d | 14.02 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #e5e3ec | `--rise-bg-muted` #28262f | 11.74 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #e5e3ec | `--rise-bg-elevated` #28262f | 11.74 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #d5d3df | `--rise-bg` #18171d | 12.05 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #d5d3df | `--rise-bg-muted` #28262f | 10.09 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #d5d3df | `--rise-bg-elevated` #28262f | 10.09 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #a09eaa | `--rise-bg` #18171d | 6.76 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #a09eaa | `--rise-bg-muted` #28262f | 5.66 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #a09eaa | `--rise-bg-elevated` #28262f | 5.66 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #72707b | `--rise-bg` #18171d | 3.66 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #18171d | `--rise-bg-inverted` #ffffff | 17.81 | 4.5 | проходит |
| Рамка поля ввода | `--rise-border-accented` #403e48 | `--rise-bg` #18171d | 1.70 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #ae96fe | `--rise-bg` #18171d | 7.29 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg` #18171d | 7.06 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg-muted` #28262f | 5.91 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg-elevated` #28262f | 5.91 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-primary-soft` #2a2638 | 5.80 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg` #18171d | 11.59 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg-muted` #28262f | 9.70 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg-elevated` #28262f | 9.70 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-primary-soft` #2a2638 | 9.52 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg` #18171d | 9.16 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg-muted` #28262f | 7.67 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg-elevated` #28262f | 7.67 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-primary-soft` #2a2638 | 7.52 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg` #18171d | 7.01 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg-muted` #28262f | 5.87 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg-elevated` #28262f | 5.87 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-primary-soft` #2a2638 | 5.76 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg` #18171d | 9.15 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg-muted` #28262f | 7.66 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg-elevated` #28262f | 7.66 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-primary-soft` #2a2638 | 7.51 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg` #18171d | 11.59 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg-muted` #28262f | 9.70 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg-elevated` #28262f | 9.70 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-primary-soft` #2a2638 | 9.52 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg` #18171d | 9.16 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg-muted` #28262f | 7.67 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg-elevated` #28262f | 7.67 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-primary-soft` #2a2638 | 7.52 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg` #18171d | 9.20 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg-muted` #28262f | 7.70 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg-elevated` #28262f | 7.70 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-primary-soft` #2a2638 | 7.55 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg` #18171d | 9.20 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg-muted` #28262f | 7.70 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg-elevated` #28262f | 7.70 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-primary-soft` #2a2638 | 7.55 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #09080e | `--rise-primary` #ae96fe | 8.16 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #09080e | `--rise-primary-hover` #cbc0fe | 11.88 | 4.5 | проходит |
| Цвет primary как текст на фоне | `--rise-primary` #ae96fe | `--rise-bg` #18171d | 7.29 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #cbc0fe | `--rise-primary-soft` #2a2638 | 8.71 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #cbc0fe | `--rise-primary-soft-hover` #332e46 | 7.74 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #ae96fe | `--rise-primary-soft` #2a2638 | 5.98 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #ae96fe | `--rise-bg-elevated` #28262f | 6.10 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #09080e | `--rise-success` #4ade80 | 11.45 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #09080e | `--rise-success-hover` #86efac | 14.21 | 4.5 | проходит |
| Цвет success как текст на фоне | `--rise-success` #4ade80 | `--rise-bg` #18171d | 10.22 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #86efac | `--rise-success-soft` #1e2f29 | 10.03 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #86efac | `--rise-success-soft-hover` #213b2f | 8.66 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #4ade80 | `--rise-success-soft` #1e2f29 | 8.08 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #4ade80 | `--rise-bg-elevated` #28262f | 8.56 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #09080e | `--rise-info` #60a5fa | 7.85 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #09080e | `--rise-info-hover` #93c5fd | 11.06 | 4.5 | проходит |
| Цвет info как текст на фоне | `--rise-info` #60a5fa | `--rise-bg` #18171d | 7.00 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #93c5fd | `--rise-info-soft` #212838 | 8.18 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #93c5fd | `--rise-info-soft-hover` #253145 | 7.30 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #60a5fa | `--rise-info-soft` #212838 | 5.80 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #60a5fa | `--rise-bg-elevated` #28262f | 5.86 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #09080e | `--rise-warning` #fbbf24 | 11.95 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #09080e | `--rise-warning-hover` #fcd34d | 13.83 | 4.5 | проходит |
| Цвет warning как текст на фоне | `--rise-warning` #fbbf24 | `--rise-bg` #18171d | 10.67 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #fcd34d | `--rise-warning-soft` #332b1e | 9.65 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #fcd34d | `--rise-warning-soft-hover` #41351e | 8.29 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #fbbf24 | `--rise-warning-soft` #332b1e | 8.34 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #fbbf24 | `--rise-bg-elevated` #28262f | 8.93 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #09080e | `--rise-error` #f87171 | 7.21 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #09080e | `--rise-error-hover` #fca5a5 | 10.51 | 4.5 | проходит |
| Цвет error как текст на фоне | `--rise-error` #f87171 | `--rise-bg` #18171d | 6.44 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #fca5a5 | `--rise-error-soft` #332227 | 7.93 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #fca5a5 | `--rise-error-soft-hover` #40272c | 7.14 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #f87171 | `--rise-error-soft` #332227 | 5.44 | 4.5 | проходит |
| Графика error на bg-elevated | `--rise-error` #f87171 | `--rise-bg-elevated` #28262f | 5.39 | 3 | проходит |

## Пресет minimal — светлая тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #181818 | `--rise-bg` #ffffff | 17.76 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #181818 | `--rise-bg-muted` #fafafa | 17.01 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #181818 | `--rise-bg-elevated` #f4f4f4 | 16.14 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #404040 | `--rise-bg` #ffffff | 10.37 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #404040 | `--rise-bg-muted` #fafafa | 9.93 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #404040 | `--rise-bg-elevated` #f4f4f4 | 9.43 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #535353 | `--rise-bg` #ffffff | 7.69 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #535353 | `--rise-bg-muted` #fafafa | 7.37 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #535353 | `--rise-bg-elevated` #f4f4f4 | 6.99 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #727272 | `--rise-bg` #ffffff | 4.81 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #727272 | `--rise-bg-muted` #fafafa | 4.61 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #727272 | `--rise-bg-elevated` #f4f4f4 | 4.37 | 4.5 | справочно |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #a0a0a0 | `--rise-bg` #ffffff | 2.61 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #ffffff | `--rise-bg-inverted` #181818 | 17.76 | 4.5 | проходит |
| Рамка поля ввода | `--rise-border-accented` #d4d4d4 | `--rise-bg` #ffffff | 1.48 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #18181b | `--rise-bg` #ffffff | 17.72 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg` #ffffff | 5.36 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg-muted` #fafafa | 5.13 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-bg-elevated` #f4f4f4 | 4.87 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #cf222e | `--rise-primary-soft` #f5f5f5 | 4.91 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg` #ffffff | 12.81 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg-muted` #fafafa | 12.27 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-bg-elevated` #f4f4f4 | 11.64 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0a3069 | `--rise-primary-soft` #f5f5f5 | 11.75 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg` #ffffff | 7.59 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg-muted` #fafafa | 7.28 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-bg-elevated` #f4f4f4 | 6.91 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #0550ae | `--rise-primary-soft` #f5f5f5 | 6.97 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg` #ffffff | 6.39 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg-muted` #fafafa | 6.12 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-bg-elevated` #f4f4f4 | 5.81 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #57606a | `--rise-primary-soft` #f5f5f5 | 5.86 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg` #ffffff | 5.05 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg-muted` #fafafa | 4.83 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-bg-elevated` #f4f4f4 | 4.59 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8250df | `--rise-primary-soft` #f5f5f5 | 4.63 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg-muted` #fafafa | 7.08 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-bg-elevated` #f4f4f4 | 6.72 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #116329 | `--rise-primary-soft` #f5f5f5 | 6.78 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg` #ffffff | 7.59 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg-muted` #fafafa | 7.28 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-bg-elevated` #f4f4f4 | 6.91 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #0550ae | `--rise-primary-soft` #f5f5f5 | 6.97 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg-muted` #fafafa | 7.08 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-bg-elevated` #f4f4f4 | 6.71 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #953800 | `--rise-primary-soft` #f5f5f5 | 6.77 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg` #ffffff | 7.39 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg-muted` #fafafa | 7.08 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-bg-elevated` #f4f4f4 | 6.71 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #953800 | `--rise-primary-soft` #f5f5f5 | 6.77 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #ffffff | `--rise-primary` #18181b | 17.72 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #ffffff | `--rise-primary-hover` #111114 | 18.85 | 4.5 | проходит |
| Цвет primary как текст на фоне | `--rise-primary` #18181b | `--rise-bg` #ffffff | 17.72 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #111114 | `--rise-primary-soft` #f5f5f5 | 17.29 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #111114 | `--rise-primary-soft-hover` #e4e4e5 | 14.83 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #18181b | `--rise-primary-soft` #f5f5f5 | 16.25 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #18181b | `--rise-bg-elevated` #f4f4f4 | 16.11 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #ffffff | `--rise-success` #15803d | 5.02 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #ffffff | `--rise-success-hover` #166534 | 7.13 | 4.5 | проходит |
| Цвет success как текст на фоне | `--rise-success` #15803d | `--rise-bg` #ffffff | 5.02 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #166534 | `--rise-success-soft` #f0fdf4 | 6.81 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #166534 | `--rise-success-soft-hover` #dcfce7 | 6.49 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #15803d | `--rise-success-soft` #f0fdf4 | 4.79 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #15803d | `--rise-bg-elevated` #f4f4f4 | 4.56 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #ffffff | `--rise-info` #2563eb | 5.17 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #ffffff | `--rise-info-hover` #1d4ed8 | 6.70 | 4.5 | проходит |
| Цвет info как текст на фоне | `--rise-info` #2563eb | `--rise-bg` #ffffff | 5.17 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #1e40af | `--rise-info-soft` #eff6ff | 8.01 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #1e40af | `--rise-info-soft-hover` #dbeafe | 7.15 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #2563eb | `--rise-info-soft` #eff6ff | 4.75 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #2563eb | `--rise-bg-elevated` #f4f4f4 | 4.70 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #ffffff | `--rise-warning` #b45309 | 5.02 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #ffffff | `--rise-warning-hover` #92400e | 7.09 | 4.5 | проходит |
| Цвет warning как текст на фоне | `--rise-warning` #b45309 | `--rise-bg` #ffffff | 5.02 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #92400e | `--rise-warning-soft` #fffbeb | 6.84 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #92400e | `--rise-warning-soft-hover` #fef3c7 | 6.37 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #b45309 | `--rise-warning-soft` #fffbeb | 4.84 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #b45309 | `--rise-bg-elevated` #f4f4f4 | 4.57 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #ffffff | `--rise-error` #dc2626 | 4.83 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #ffffff | `--rise-error-hover` #b91c1c | 6.47 | 4.5 | проходит |
| Цвет error как текст на фоне | `--rise-error` #dc2626 | `--rise-bg` #ffffff | 4.83 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #991b1b | `--rise-error-soft` #fef2f2 | 7.60 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #991b1b | `--rise-error-soft-hover` #fee2e2 | 6.80 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #dc2626 | `--rise-error-soft` #fef2f2 | 4.41 | 4.5 | справочно |
| Графика error на bg-elevated | `--rise-error` #dc2626 | `--rise-bg-elevated` #f4f4f4 | 4.39 | 3 | проходит |

## Пресет minimal — тёмная тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg` #181818 | 17.76 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg-muted` #272727 | 14.94 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #ffffff | `--rise-bg-elevated` #272727 | 14.94 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #e4e4e4 | `--rise-bg` #181818 | 13.97 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #e4e4e4 | `--rise-bg-muted` #272727 | 11.75 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #e4e4e4 | `--rise-bg-elevated` #272727 | 11.75 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #d4d4d4 | `--rise-bg` #181818 | 11.98 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #d4d4d4 | `--rise-bg-muted` #272727 | 10.08 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #d4d4d4 | `--rise-bg-elevated` #272727 | 10.08 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #a0a0a0 | `--rise-bg` #181818 | 6.79 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #a0a0a0 | `--rise-bg-muted` #272727 | 5.71 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #a0a0a0 | `--rise-bg-elevated` #272727 | 5.71 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #727272 | `--rise-bg` #181818 | 3.69 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #181818 | `--rise-bg-inverted` #ffffff | 17.76 | 4.5 | проходит |
| Рамка поля ввода | `--rise-border-accented` #404040 | `--rise-bg` #181818 | 1.71 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #fafafa | `--rise-bg` #181818 | 17.01 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg` #181818 | 7.04 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg-muted` #272727 | 5.92 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-bg-elevated` #272727 | 5.92 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #ff7b72 | `--rise-primary-soft` #333333 | 5.00 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg` #181818 | 11.55 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg-muted` #272727 | 9.72 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-bg-elevated` #272727 | 9.72 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #a5d6ff | `--rise-primary-soft` #333333 | 8.21 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg` #181818 | 9.13 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg-muted` #272727 | 7.68 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-bg-elevated` #272727 | 7.68 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #79c0ff | `--rise-primary-soft` #333333 | 6.48 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg` #181818 | 6.99 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg-muted` #272727 | 5.88 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-bg-elevated` #272727 | 5.88 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #9ca3af | `--rise-primary-soft` #333333 | 4.97 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg` #181818 | 9.12 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg-muted` #272727 | 7.67 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-bg-elevated` #272727 | 7.67 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #d2a8ff | `--rise-primary-soft` #333333 | 6.48 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg` #181818 | 11.56 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg-muted` #272727 | 9.72 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-bg-elevated` #272727 | 9.72 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #7ee787 | `--rise-primary-soft` #333333 | 8.21 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg` #181818 | 9.13 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg-muted` #272727 | 7.68 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-bg-elevated` #272727 | 7.68 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #79c0ff | `--rise-primary-soft` #333333 | 6.48 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg` #181818 | 9.17 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg-muted` #272727 | 7.71 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-bg-elevated` #272727 | 7.71 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #ffa657 | `--rise-primary-soft` #333333 | 6.51 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg` #181818 | 9.17 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg-muted` #272727 | 7.71 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-bg-elevated` #272727 | 7.71 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #ffa657 | `--rise-primary-soft` #333333 | 6.51 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #090909 | `--rise-primary` #fafafa | 19.08 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #090909 | `--rise-primary-hover` #e2e2e2 | 15.37 | 4.5 | проходит |
| Цвет primary как текст на фоне | `--rise-primary` #fafafa | `--rise-bg` #181818 | 17.01 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #e2e2e2 | `--rise-primary-soft` #333333 | 9.74 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #e2e2e2 | `--rise-primary-soft-hover` #414141 | 7.92 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #fafafa | `--rise-primary-soft` #333333 | 12.08 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #fafafa | `--rise-bg-elevated` #272727 | 14.31 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #090909 | `--rise-success` #4ade80 | 11.43 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #090909 | `--rise-success-hover` #86efac | 14.18 | 4.5 | проходит |
| Цвет success как текст на фоне | `--rise-success` #4ade80 | `--rise-bg` #181818 | 10.19 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #86efac | `--rise-success-soft` #1e3024 | 9.97 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #86efac | `--rise-success-soft-hover` #213c2b | 8.61 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #4ade80 | `--rise-success-soft` #1e3024 | 8.03 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #4ade80 | `--rise-bg-elevated` #272727 | 8.57 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #090909 | `--rise-info` #60a5fa | 7.83 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #090909 | `--rise-info-hover` #93c5fd | 11.04 | 4.5 | проходит |
| Цвет info как текст на фоне | `--rise-info` #60a5fa | `--rise-bg` #181818 | 6.98 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #93c5fd | `--rise-info-soft` #212933 | 8.16 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #93c5fd | `--rise-info-soft-hover` #253141 | 7.28 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #60a5fa | `--rise-info-soft` #212933 | 5.79 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #60a5fa | `--rise-bg-elevated` #272727 | 5.88 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #090909 | `--rise-warning` #fbbf24 | 11.93 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #090909 | `--rise-warning-hover` #fcd34d | 13.81 | 4.5 | проходит |
| Цвет warning как текст на фоне | `--rise-warning` #fbbf24 | `--rise-bg` #181818 | 10.64 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #fcd34d | `--rise-warning-soft` #332c19 | 9.60 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #fcd34d | `--rise-warning-soft-hover` #41361a | 8.24 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #fbbf24 | `--rise-warning-soft` #332c19 | 8.29 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #fbbf24 | `--rise-bg-elevated` #272727 | 8.95 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #090909 | `--rise-error` #f87171 | 7.20 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #090909 | `--rise-error-hover` #fca5a5 | 10.49 | 4.5 | проходит |
| Цвет error как текст на фоне | `--rise-error` #f87171 | `--rise-bg` #181818 | 6.42 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #fca5a5 | `--rise-error-soft` #332323 | 7.90 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #fca5a5 | `--rise-error-soft-hover` #402828 | 7.12 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #f87171 | `--rise-error-soft` #332323 | 5.42 | 4.5 | проходит |
| Графика error на bg-elevated | `--rise-error` #f87171 | `--rise-bg-elevated` #272727 | 5.40 | 3 | проходит |
