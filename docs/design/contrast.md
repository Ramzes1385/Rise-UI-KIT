# Контраст дизайн-токенов

Сгенерировано `node scripts/check-contrast.mjs --markdown docs/design/contrast.md` из `src/styles/_tokens.scss`.
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
