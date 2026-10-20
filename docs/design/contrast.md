# Контраст дизайн-токенов

Сгенерировано `node scripts/check-contrast.mjs --theme=all --markdown docs/design/contrast.md` из `src/styles/_tokens.scss` и пресетов `THEME_PRESETS` (сиды темы поверх токенов кита).
Пороги WCAG 2.2 AA: текст — 4.5:1, графика и кольцо фокуса — 3:1. «Справочно» — пары, которые не обязаны проходить порог
(плейсхолдеры и неактивный текст исключены из требования 1.4.3; рамка варианта outline — декоративная, поле обозначено подписью и фоном).

## Светлая тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #0b0d14 | `--rise-bg` #ffffff | 19.41 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #0b0d14 | `--rise-bg-muted` #f5f6f9 | 17.96 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #0b0d14 | `--rise-bg-elevated` #eceef3 | 16.72 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #0b0d14 | `--rise-surface-raised` #ffffff | 19.41 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2a2f3d | `--rise-bg` #ffffff | 13.36 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2a2f3d | `--rise-bg-muted` #f5f6f9 | 12.36 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2a2f3d | `--rise-bg-elevated` #eceef3 | 11.50 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2a2f3d | `--rise-surface-raised` #ffffff | 13.36 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #414859 | `--rise-bg` #ffffff | 9.15 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #414859 | `--rise-bg-muted` #f5f6f9 | 8.46 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #414859 | `--rise-bg-elevated` #eceef3 | 7.88 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #414859 | `--rise-surface-raised` #ffffff | 9.15 | 4.5 | проходит |
| Граница флажка и радио | `--rise-border-control` #7e869a | `--rise-bg` #ffffff | 3.64 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #7e869a | `--rise-bg-muted` #f5f6f9 | 3.37 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #7e869a | `--rise-bg-elevated` #eceef3 | 3.14 | 3 | проходит |
| Вторичный текст | `--rise-text-muted` #5b6276 | `--rise-bg` #ffffff | 6.08 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #5b6276 | `--rise-bg-muted` #f5f6f9 | 5.63 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #5b6276 | `--rise-surface-raised` #ffffff | 6.08 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #5b6276 | `--rise-bg-elevated` #eceef3 | 5.24 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #9aa2b4 | `--rise-bg` #ffffff | 2.56 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #ffffff | `--rise-bg-inverted` #0b0d14 | 19.41 | 4.5 | проходит |
| Рамка варианта outline | `--rise-border-accented` #cdd2dc | `--rise-bg` #ffffff | 1.52 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #ee5410 | `--rise-bg` #ffffff | 3.55 | 3 | проходит |
| Кольцо фокуса | `--rise-focus-ring` #ee5410 | `--rise-bg-muted` #f5f6f9 | 3.29 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg` #ffffff | 6.39 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg-muted` #f5f6f9 | 5.91 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg-elevated` #eceef3 | 5.50 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-primary-soft` #fff3eb | 5.86 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg` #ffffff | 5.40 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg-muted` #f5f6f9 | 5.00 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg-elevated` #eceef3 | 4.65 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-primary-soft` #fff3eb | 4.96 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg` #ffffff | 5.86 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg-muted` #f5f6f9 | 5.42 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg-elevated` #eceef3 | 5.05 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-primary-soft` #fff3eb | 5.38 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg` #ffffff | 6.08 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg-muted` #f5f6f9 | 5.63 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg-elevated` #eceef3 | 5.24 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-primary-soft` #fff3eb | 5.58 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg` #ffffff | 6.55 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg-muted` #f5f6f9 | 6.06 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg-elevated` #eceef3 | 5.64 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-primary-soft` #fff3eb | 6.01 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg` #ffffff | 6.81 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg-muted` #f5f6f9 | 6.31 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg-elevated` #eceef3 | 5.87 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-primary-soft` #fff3eb | 6.25 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg` #ffffff | 6.39 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg-muted` #f5f6f9 | 5.91 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg-elevated` #eceef3 | 5.50 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-primary-soft` #fff3eb | 5.86 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg` #ffffff | 5.96 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg-muted` #f5f6f9 | 5.51 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg-elevated` #eceef3 | 5.13 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-primary-soft` #fff3eb | 5.47 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg` #ffffff | 13.36 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg-muted` #f5f6f9 | 12.36 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg-elevated` #eceef3 | 11.50 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-primary-soft` #fff3eb | 12.26 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #0b0d14 | `--rise-primary` #ee5410 | 5.46 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #0b0d14 | `--rise-primary-hover` #ff6a1f | 6.78 | 4.5 | проходит |
| Заливка primary как графика на фоне | `--rise-primary` #ee5410 | `--rise-bg` #ffffff | 3.55 | 3 | проходит |
| Текст primary на фоне | `--rise-primary-text` #9a2f07 | `--rise-bg` #ffffff | 7.54 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #9a2f07 | `--rise-primary-soft` #fff3eb | 6.92 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #9a2f07 | `--rise-primary-soft-hover` #ffe6d5 | 6.30 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #ee5410 | `--rise-primary-soft` #fff3eb | 3.26 | 4.5 | справочно |
| Графика primary на bg-elevated | `--rise-primary` #ee5410 | `--rise-bg-elevated` #eceef3 | 3.06 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #ffffff | `--rise-success` #0b7f4e | 5.05 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #ffffff | `--rise-success-hover` #086b41 | 6.58 | 4.5 | проходит |
| Заливка success как графика на фоне | `--rise-success` #0b7f4e | `--rise-bg` #ffffff | 5.05 | 3 | проходит |
| Текст success на фоне | `--rise-success-text` #065a37 | `--rise-bg` #ffffff | 8.32 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #065a37 | `--rise-success-soft` #e8f8f0 | 7.57 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #065a37 | `--rise-success-soft-hover` #d3f2e2 | 6.96 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #0b7f4e | `--rise-success-soft` #e8f8f0 | 4.60 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #0b7f4e | `--rise-bg-elevated` #eceef3 | 4.35 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #ffffff | `--rise-info` #2a55f0 | 5.74 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #ffffff | `--rise-info-hover` #2143c4 | 7.88 | 4.5 | проходит |
| Заливка info как графика на фоне | `--rise-info` #2a55f0 | `--rise-bg` #ffffff | 5.74 | 3 | проходит |
| Текст info на фоне | `--rise-info-text` #1c3596 | `--rise-bg` #ffffff | 10.51 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #1c3596 | `--rise-info-soft` #eef3ff | 9.45 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #1c3596 | `--rise-info-soft-hover` #dde6ff | 8.42 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #2a55f0 | `--rise-info-soft` #eef3ff | 5.17 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #2a55f0 | `--rise-bg-elevated` #eceef3 | 4.95 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #0b0d14 | `--rise-warning` #c77300 | 5.44 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #0b0d14 | `--rise-warning-hover` #e89a00 | 8.37 | 4.5 | проходит |
| Заливка warning как графика на фоне | `--rise-warning` #c77300 | `--rise-bg` #ffffff | 3.57 | 3 | проходит |
| Текст warning на фоне | `--rise-warning-text` #7a4300 | `--rise-bg` #ffffff | 7.98 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #7a4300 | `--rise-warning-soft` #fff6e0 | 7.42 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #7a4300 | `--rise-warning-soft-hover` #ffebb8 | 6.78 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #c77300 | `--rise-warning-soft` #fff6e0 | 3.32 | 4.5 | справочно |
| Графика warning на bg-elevated | `--rise-warning` #c77300 | `--rise-bg-elevated` #eceef3 | 3.08 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #ffffff | `--rise-error` #dc1f37 | 4.89 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #ffffff | `--rise-error-hover` #b9152b | 6.55 | 4.5 | проходит |
| Заливка error как графика на фоне | `--rise-error` #dc1f37 | `--rise-bg` #ffffff | 4.89 | 3 | проходит |
| Текст error на фоне | `--rise-error-text` #9b0f22 | `--rise-bg` #ffffff | 8.45 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #9b0f22 | `--rise-error-soft` #ffeef0 | 7.54 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #9b0f22 | `--rise-error-soft-hover` #ffdce0 | 6.67 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #dc1f37 | `--rise-error-soft` #ffeef0 | 4.36 | 4.5 | справочно |
| Графика error на bg-elevated | `--rise-error` #dc1f37 | `--rise-bg-elevated` #eceef3 | 4.21 | 3 | проходит |

## Тёмная тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #f5f6f9 | `--rise-bg` #08090f | 18.36 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f5f6f9 | `--rise-bg-muted` #10121a | 17.31 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f5f6f9 | `--rise-bg-elevated` #171a24 | 16.06 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f5f6f9 | `--rise-surface-raised` #1b1e29 | 15.39 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #cdd2dc | `--rise-bg` #08090f | 13.09 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #cdd2dc | `--rise-bg-muted` #10121a | 12.34 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #cdd2dc | `--rise-bg-elevated` #171a24 | 11.45 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #cdd2dc | `--rise-surface-raised` #1b1e29 | 10.97 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #abb2c2 | `--rise-bg` #08090f | 9.36 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #abb2c2 | `--rise-bg-muted` #10121a | 8.83 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #abb2c2 | `--rise-bg-elevated` #171a24 | 8.19 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #abb2c2 | `--rise-surface-raised` #1b1e29 | 7.85 | 4.5 | проходит |
| Граница флажка и радио | `--rise-border-control` #636a7e | `--rise-bg` #08090f | 3.69 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #636a7e | `--rise-bg-muted` #10121a | 3.48 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #636a7e | `--rise-bg-elevated` #171a24 | 3.23 | 3 | проходит |
| Вторичный текст | `--rise-text-muted` #8a92a5 | `--rise-bg` #08090f | 6.35 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #8a92a5 | `--rise-bg-muted` #10121a | 5.98 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #8a92a5 | `--rise-surface-raised` #1b1e29 | 5.32 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #8a92a5 | `--rise-bg-elevated` #171a24 | 5.55 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #5b6276 | `--rise-bg` #08090f | 3.26 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #0b0d14 | `--rise-bg-inverted` #f5f6f9 | 17.96 | 4.5 | проходит |
| Рамка варианта outline | `--rise-border-accented` #2a2f3d | `--rise-bg` #08090f | 1.49 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #ff6a1f | `--rise-bg` #08090f | 6.93 | 3 | проходит |
| Кольцо фокуса | `--rise-focus-ring` #ff6a1f | `--rise-bg-muted` #10121a | 6.53 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg` #08090f | 8.71 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg-muted` #10121a | 8.21 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg-elevated` #171a24 | 7.62 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-primary-soft` #2b1711 | 7.48 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg` #08090f | 12.41 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg-muted` #10121a | 11.70 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg-elevated` #171a24 | 10.85 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-primary-soft` #2b1711 | 10.66 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg` #08090f | 10.20 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg-muted` #10121a | 9.62 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg-elevated` #171a24 | 8.92 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-primary-soft` #2b1711 | 8.77 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg` #08090f | 6.31 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg-muted` #10121a | 5.95 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg-elevated` #171a24 | 5.52 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-primary-soft` #2b1711 | 5.42 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg` #08090f | 8.90 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg-muted` #10121a | 8.39 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg-elevated` #171a24 | 7.79 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-primary-soft` #2b1711 | 7.65 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg` #08090f | 9.28 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg-muted` #10121a | 8.75 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg-elevated` #171a24 | 8.11 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-primary-soft` #2b1711 | 7.97 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg` #08090f | 13.75 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg-muted` #10121a | 12.97 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg-elevated` #171a24 | 12.03 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-primary-soft` #2b1711 | 11.82 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg` #08090f | 13.13 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg-muted` #10121a | 12.38 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg-elevated` #171a24 | 11.49 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-primary-soft` #2b1711 | 11.28 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg` #08090f | 13.23 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg-muted` #10121a | 12.47 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg-elevated` #171a24 | 11.57 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-primary-soft` #2b1711 | 11.37 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #0b0d14 | `--rise-primary` #ff6a1f | 6.78 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #0b0d14 | `--rise-primary-hover` #ff8243 | 7.88 | 4.5 | проходит |
| Заливка primary как графика на фоне | `--rise-primary` #ff6a1f | `--rise-bg` #08090f | 6.93 | 3 | проходит |
| Текст primary на фоне | `--rise-primary-text` #ffa470 | `--rise-bg` #08090f | 10.20 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #ffa470 | `--rise-primary-soft` #2b1711 | 8.77 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #ffa470 | `--rise-primary-soft-hover` #391d12 | 7.95 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #ff6a1f | `--rise-primary-soft` #2b1711 | 5.95 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #ff6a1f | `--rise-bg-elevated` #171a24 | 6.06 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #0b0d14 | `--rise-success` #2fd08a | 9.71 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #0b0d14 | `--rise-success-hover` #5cdda4 | 11.40 | 4.5 | проходит |
| Заливка success как графика на фоне | `--rise-success` #2fd08a | `--rise-bg` #08090f | 9.93 | 3 | проходит |
| Текст success на фоне | `--rise-success-text` #7fe6b8 | `--rise-bg` #08090f | 13.15 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #7fe6b8 | `--rise-success-soft` #0d2520 | 10.65 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #7fe6b8 | `--rise-success-soft-hover` #103127 | 9.31 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #2fd08a | `--rise-success-soft` #0d2520 | 8.04 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #2fd08a | `--rise-bg-elevated` #171a24 | 8.69 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #0b0d14 | `--rise-info` #6a8dff | 6.35 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #0b0d14 | `--rise-info-hover` #8eabff | 8.71 | 4.5 | проходит |
| Заливка info как графика на фоне | `--rise-info` #6a8dff | `--rise-bg` #08090f | 6.49 | 3 | проходит |
| Текст info на фоне | `--rise-info-text` #a9bfff | `--rise-bg` #08090f | 10.95 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #a9bfff | `--rise-info-soft` #161c30 | 9.33 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #a9bfff | `--rise-info-soft-hover` #1c243f | 8.47 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #6a8dff | `--rise-info-soft` #161c30 | 5.53 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #6a8dff | `--rise-bg-elevated` #171a24 | 5.68 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #0b0d14 | `--rise-warning` #ffb224 | 10.76 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #0b0d14 | `--rise-warning-hover` #ffc457 | 12.28 | 4.5 | проходит |
| Заливка warning как графика на фоне | `--rise-warning` #ffb224 | `--rise-bg` #08090f | 11.00 | 3 | проходит |
| Текст warning на фоне | `--rise-warning-text` #ffd17a | `--rise-bg` #08090f | 13.88 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #ffd17a | `--rise-warning-soft` #2b2112 | 11.06 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #ffd17a | `--rise-warning-soft-hover` #392b13 | 9.57 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #ffb224 | `--rise-warning-soft` #2b2112 | 8.77 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #ffb224 | `--rise-bg-elevated` #171a24 | 9.63 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #0b0d14 | `--rise-error` #ff5468 | 6.21 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #0b0d14 | `--rise-error-hover` #ff7a8a | 7.77 | 4.5 | проходит |
| Заливка error как графика на фоне | `--rise-error` #ff5468 | `--rise-bg` #08090f | 6.35 | 3 | проходит |
| Текст error на фоне | `--rise-error-text` #ff9da9 | `--rise-bg` #08090f | 10.06 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #ff9da9 | `--rise-error-soft` #2b141b | 8.75 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #ff9da9 | `--rise-error-soft-hover` #391820 | 8.00 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #ff5468 | `--rise-error-soft` #2b141b | 5.52 | 4.5 | проходит |
| Графика error на bg-elevated | `--rise-error` #ff5468 | `--rise-bg-elevated` #171a24 | 5.56 | 3 | проходит |

## Пресет rise — светлая тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #0b0d14 | `--rise-bg` #ffffff | 19.41 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #0b0d14 | `--rise-bg-muted` #f5f6f9 | 17.96 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #0b0d14 | `--rise-bg-elevated` #eceef3 | 16.72 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #0b0d14 | `--rise-surface-raised` #ffffff | 19.41 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2a2f3d | `--rise-bg` #ffffff | 13.36 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2a2f3d | `--rise-bg-muted` #f5f6f9 | 12.36 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2a2f3d | `--rise-bg-elevated` #eceef3 | 11.50 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2a2f3d | `--rise-surface-raised` #ffffff | 13.36 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #414859 | `--rise-bg` #ffffff | 9.15 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #414859 | `--rise-bg-muted` #f5f6f9 | 8.46 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #414859 | `--rise-bg-elevated` #eceef3 | 7.88 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #414859 | `--rise-surface-raised` #ffffff | 9.15 | 4.5 | проходит |
| Граница флажка и радио | `--rise-border-control` #7e869a | `--rise-bg` #ffffff | 3.64 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #7e869a | `--rise-bg-muted` #f5f6f9 | 3.37 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #7e869a | `--rise-bg-elevated` #eceef3 | 3.14 | 3 | проходит |
| Вторичный текст | `--rise-text-muted` #5b6276 | `--rise-bg` #ffffff | 6.08 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #5b6276 | `--rise-bg-muted` #f5f6f9 | 5.63 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #5b6276 | `--rise-surface-raised` #ffffff | 6.08 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #5b6276 | `--rise-bg-elevated` #eceef3 | 5.24 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #9aa2b4 | `--rise-bg` #ffffff | 2.56 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #ffffff | `--rise-bg-inverted` #0b0d14 | 19.41 | 4.5 | проходит |
| Рамка варианта outline | `--rise-border-accented` #cdd2dc | `--rise-bg` #ffffff | 1.52 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #ee5410 | `--rise-bg` #ffffff | 3.55 | 3 | проходит |
| Кольцо фокуса | `--rise-focus-ring` #ee5410 | `--rise-bg-muted` #f5f6f9 | 3.29 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg` #ffffff | 6.39 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg-muted` #f5f6f9 | 5.91 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg-elevated` #eceef3 | 5.50 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-primary-soft` #fff3eb | 5.86 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg` #ffffff | 5.40 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg-muted` #f5f6f9 | 5.00 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg-elevated` #eceef3 | 4.65 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-primary-soft` #fff3eb | 4.96 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg` #ffffff | 5.86 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg-muted` #f5f6f9 | 5.42 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg-elevated` #eceef3 | 5.05 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-primary-soft` #fff3eb | 5.38 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg` #ffffff | 6.08 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg-muted` #f5f6f9 | 5.63 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg-elevated` #eceef3 | 5.24 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-primary-soft` #fff3eb | 5.58 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg` #ffffff | 6.55 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg-muted` #f5f6f9 | 6.06 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg-elevated` #eceef3 | 5.64 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-primary-soft` #fff3eb | 6.01 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg` #ffffff | 6.81 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg-muted` #f5f6f9 | 6.31 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg-elevated` #eceef3 | 5.87 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-primary-soft` #fff3eb | 6.25 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg` #ffffff | 6.39 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg-muted` #f5f6f9 | 5.91 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg-elevated` #eceef3 | 5.50 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-primary-soft` #fff3eb | 5.86 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg` #ffffff | 5.96 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg-muted` #f5f6f9 | 5.51 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg-elevated` #eceef3 | 5.13 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-primary-soft` #fff3eb | 5.47 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg` #ffffff | 13.36 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg-muted` #f5f6f9 | 12.36 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg-elevated` #eceef3 | 11.50 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-primary-soft` #fff3eb | 12.26 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #0b0d14 | `--rise-primary` #ee5410 | 5.46 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #0b0d14 | `--rise-primary-hover` #ff6a1f | 6.78 | 4.5 | проходит |
| Заливка primary как графика на фоне | `--rise-primary` #ee5410 | `--rise-bg` #ffffff | 3.55 | 3 | проходит |
| Текст primary на фоне | `--rise-primary-text` #9a2f07 | `--rise-bg` #ffffff | 7.54 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #9a2f07 | `--rise-primary-soft` #fff3eb | 6.92 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #9a2f07 | `--rise-primary-soft-hover` #ffe6d5 | 6.30 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #ee5410 | `--rise-primary-soft` #fff3eb | 3.26 | 4.5 | справочно |
| Графика primary на bg-elevated | `--rise-primary` #ee5410 | `--rise-bg-elevated` #eceef3 | 3.06 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #ffffff | `--rise-success` #0b7f4e | 5.05 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #ffffff | `--rise-success-hover` #086b41 | 6.58 | 4.5 | проходит |
| Заливка success как графика на фоне | `--rise-success` #0b7f4e | `--rise-bg` #ffffff | 5.05 | 3 | проходит |
| Текст success на фоне | `--rise-success-text` #065a37 | `--rise-bg` #ffffff | 8.32 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #065a37 | `--rise-success-soft` #e8f8f0 | 7.57 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #065a37 | `--rise-success-soft-hover` #d3f2e2 | 6.96 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #0b7f4e | `--rise-success-soft` #e8f8f0 | 4.60 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #0b7f4e | `--rise-bg-elevated` #eceef3 | 4.35 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #ffffff | `--rise-info` #2a55f0 | 5.74 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #ffffff | `--rise-info-hover` #2143c4 | 7.88 | 4.5 | проходит |
| Заливка info как графика на фоне | `--rise-info` #2a55f0 | `--rise-bg` #ffffff | 5.74 | 3 | проходит |
| Текст info на фоне | `--rise-info-text` #1c3596 | `--rise-bg` #ffffff | 10.51 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #1c3596 | `--rise-info-soft` #eef3ff | 9.45 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #1c3596 | `--rise-info-soft-hover` #dde6ff | 8.42 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #2a55f0 | `--rise-info-soft` #eef3ff | 5.17 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #2a55f0 | `--rise-bg-elevated` #eceef3 | 4.95 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #0b0d14 | `--rise-warning` #c77300 | 5.44 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #0b0d14 | `--rise-warning-hover` #e89a00 | 8.37 | 4.5 | проходит |
| Заливка warning как графика на фоне | `--rise-warning` #c77300 | `--rise-bg` #ffffff | 3.57 | 3 | проходит |
| Текст warning на фоне | `--rise-warning-text` #7a4300 | `--rise-bg` #ffffff | 7.98 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #7a4300 | `--rise-warning-soft` #fff6e0 | 7.42 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #7a4300 | `--rise-warning-soft-hover` #ffebb8 | 6.78 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #c77300 | `--rise-warning-soft` #fff6e0 | 3.32 | 4.5 | справочно |
| Графика warning на bg-elevated | `--rise-warning` #c77300 | `--rise-bg-elevated` #eceef3 | 3.08 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #ffffff | `--rise-error` #dc1f37 | 4.89 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #ffffff | `--rise-error-hover` #b9152b | 6.55 | 4.5 | проходит |
| Заливка error как графика на фоне | `--rise-error` #dc1f37 | `--rise-bg` #ffffff | 4.89 | 3 | проходит |
| Текст error на фоне | `--rise-error-text` #9b0f22 | `--rise-bg` #ffffff | 8.45 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #9b0f22 | `--rise-error-soft` #ffeef0 | 7.54 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #9b0f22 | `--rise-error-soft-hover` #ffdce0 | 6.67 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #dc1f37 | `--rise-error-soft` #ffeef0 | 4.36 | 4.5 | справочно |
| Графика error на bg-elevated | `--rise-error` #dc1f37 | `--rise-bg-elevated` #eceef3 | 4.21 | 3 | проходит |

## Пресет rise — тёмная тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #f5f6f9 | `--rise-bg` #08090f | 18.36 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f5f6f9 | `--rise-bg-muted` #10121a | 17.31 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f5f6f9 | `--rise-bg-elevated` #171a24 | 16.06 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f5f6f9 | `--rise-surface-raised` #1b1e29 | 15.39 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #cdd2dc | `--rise-bg` #08090f | 13.09 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #cdd2dc | `--rise-bg-muted` #10121a | 12.34 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #cdd2dc | `--rise-bg-elevated` #171a24 | 11.45 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #cdd2dc | `--rise-surface-raised` #1b1e29 | 10.97 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #abb2c2 | `--rise-bg` #08090f | 9.36 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #abb2c2 | `--rise-bg-muted` #10121a | 8.83 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #abb2c2 | `--rise-bg-elevated` #171a24 | 8.19 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #abb2c2 | `--rise-surface-raised` #1b1e29 | 7.85 | 4.5 | проходит |
| Граница флажка и радио | `--rise-border-control` #636a7e | `--rise-bg` #08090f | 3.69 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #636a7e | `--rise-bg-muted` #10121a | 3.48 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #636a7e | `--rise-bg-elevated` #171a24 | 3.23 | 3 | проходит |
| Вторичный текст | `--rise-text-muted` #8a92a5 | `--rise-bg` #08090f | 6.35 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #8a92a5 | `--rise-bg-muted` #10121a | 5.98 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #8a92a5 | `--rise-surface-raised` #1b1e29 | 5.32 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #8a92a5 | `--rise-bg-elevated` #171a24 | 5.55 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #5b6276 | `--rise-bg` #08090f | 3.26 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #0b0d14 | `--rise-bg-inverted` #f5f6f9 | 17.96 | 4.5 | проходит |
| Рамка варианта outline | `--rise-border-accented` #2a2f3d | `--rise-bg` #08090f | 1.49 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #ff6a1f | `--rise-bg` #08090f | 6.93 | 3 | проходит |
| Кольцо фокуса | `--rise-focus-ring` #ff6a1f | `--rise-bg-muted` #10121a | 6.53 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg` #08090f | 8.71 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg-muted` #10121a | 8.21 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg-elevated` #171a24 | 7.62 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-primary-soft` #2b1711 | 7.48 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg` #08090f | 12.41 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg-muted` #10121a | 11.70 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg-elevated` #171a24 | 10.85 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-primary-soft` #2b1711 | 10.66 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg` #08090f | 10.20 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg-muted` #10121a | 9.62 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg-elevated` #171a24 | 8.92 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-primary-soft` #2b1711 | 8.77 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg` #08090f | 6.31 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg-muted` #10121a | 5.95 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg-elevated` #171a24 | 5.52 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-primary-soft` #2b1711 | 5.42 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg` #08090f | 8.90 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg-muted` #10121a | 8.39 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg-elevated` #171a24 | 7.79 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-primary-soft` #2b1711 | 7.65 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg` #08090f | 9.28 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg-muted` #10121a | 8.75 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg-elevated` #171a24 | 8.11 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-primary-soft` #2b1711 | 7.97 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg` #08090f | 13.75 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg-muted` #10121a | 12.97 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg-elevated` #171a24 | 12.03 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-primary-soft` #2b1711 | 11.82 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg` #08090f | 13.13 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg-muted` #10121a | 12.38 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg-elevated` #171a24 | 11.49 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-primary-soft` #2b1711 | 11.28 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg` #08090f | 13.23 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg-muted` #10121a | 12.47 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg-elevated` #171a24 | 11.57 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-primary-soft` #2b1711 | 11.37 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #0b0d14 | `--rise-primary` #ff6a1f | 6.78 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #0b0d14 | `--rise-primary-hover` #ff8243 | 7.88 | 4.5 | проходит |
| Заливка primary как графика на фоне | `--rise-primary` #ff6a1f | `--rise-bg` #08090f | 6.93 | 3 | проходит |
| Текст primary на фоне | `--rise-primary-text` #ffa470 | `--rise-bg` #08090f | 10.20 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #ffa470 | `--rise-primary-soft` #2b1711 | 8.77 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #ffa470 | `--rise-primary-soft-hover` #391d12 | 7.95 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #ff6a1f | `--rise-primary-soft` #2b1711 | 5.95 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #ff6a1f | `--rise-bg-elevated` #171a24 | 6.06 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #0b0d14 | `--rise-success` #2fd08a | 9.71 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #0b0d14 | `--rise-success-hover` #5cdda4 | 11.40 | 4.5 | проходит |
| Заливка success как графика на фоне | `--rise-success` #2fd08a | `--rise-bg` #08090f | 9.93 | 3 | проходит |
| Текст success на фоне | `--rise-success-text` #7fe6b8 | `--rise-bg` #08090f | 13.15 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #7fe6b8 | `--rise-success-soft` #0d2520 | 10.65 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #7fe6b8 | `--rise-success-soft-hover` #103127 | 9.31 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #2fd08a | `--rise-success-soft` #0d2520 | 8.04 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #2fd08a | `--rise-bg-elevated` #171a24 | 8.69 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #0b0d14 | `--rise-info` #6a8dff | 6.35 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #0b0d14 | `--rise-info-hover` #8eabff | 8.71 | 4.5 | проходит |
| Заливка info как графика на фоне | `--rise-info` #6a8dff | `--rise-bg` #08090f | 6.49 | 3 | проходит |
| Текст info на фоне | `--rise-info-text` #a9bfff | `--rise-bg` #08090f | 10.95 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #a9bfff | `--rise-info-soft` #161c30 | 9.33 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #a9bfff | `--rise-info-soft-hover` #1c243f | 8.47 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #6a8dff | `--rise-info-soft` #161c30 | 5.53 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #6a8dff | `--rise-bg-elevated` #171a24 | 5.68 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #0b0d14 | `--rise-warning` #ffb224 | 10.76 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #0b0d14 | `--rise-warning-hover` #ffc457 | 12.28 | 4.5 | проходит |
| Заливка warning как графика на фоне | `--rise-warning` #ffb224 | `--rise-bg` #08090f | 11.00 | 3 | проходит |
| Текст warning на фоне | `--rise-warning-text` #ffd17a | `--rise-bg` #08090f | 13.88 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #ffd17a | `--rise-warning-soft` #2b2112 | 11.06 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #ffd17a | `--rise-warning-soft-hover` #392b13 | 9.57 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #ffb224 | `--rise-warning-soft` #2b2112 | 8.77 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #ffb224 | `--rise-bg-elevated` #171a24 | 9.63 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #0b0d14 | `--rise-error` #ff5468 | 6.21 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #0b0d14 | `--rise-error-hover` #ff7a8a | 7.77 | 4.5 | проходит |
| Заливка error как графика на фоне | `--rise-error` #ff5468 | `--rise-bg` #08090f | 6.35 | 3 | проходит |
| Текст error на фоне | `--rise-error-text` #ff9da9 | `--rise-bg` #08090f | 10.06 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #ff9da9 | `--rise-error-soft` #2b141b | 8.75 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #ff9da9 | `--rise-error-soft-hover` #391820 | 8.00 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #ff5468 | `--rise-error-soft` #2b141b | 5.52 | 4.5 | проходит |
| Графика error на bg-elevated | `--rise-error` #ff5468 | `--rise-bg-elevated` #171a24 | 5.56 | 3 | проходит |

## Пресет corporate — светлая тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #080e15 | `--rise-bg` #ffffff | 19.37 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #080e15 | `--rise-bg-muted` #f4f6f9 | 17.89 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #080e15 | `--rise-bg-elevated` #edf0f6 | 16.97 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #080e15 | `--rise-surface-raised` #ffffff | 19.37 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #253040 | `--rise-bg` #ffffff | 13.33 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #253040 | `--rise-bg-muted` #f4f6f9 | 12.31 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #253040 | `--rise-bg-elevated` #edf0f6 | 11.68 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #253040 | `--rise-surface-raised` #ffffff | 13.33 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #3c495c | `--rise-bg` #ffffff | 9.13 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #3c495c | `--rise-bg-muted` #f4f6f9 | 8.43 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #3c495c | `--rise-bg-elevated` #edf0f6 | 8.00 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #3c495c | `--rise-surface-raised` #ffffff | 9.13 | 4.5 | проходит |
| Граница флажка и радио | `--rise-border-control` #78879d | `--rise-bg` #ffffff | 3.65 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #78879d | `--rise-bg-muted` #f4f6f9 | 3.37 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #78879d | `--rise-bg-elevated` #edf0f6 | 3.20 | 3 | проходит |
| Вторичный текст | `--rise-text-muted` #54647a | `--rise-bg` #ffffff | 6.03 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #54647a | `--rise-bg-muted` #f4f6f9 | 5.57 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #54647a | `--rise-surface-raised` #ffffff | 6.03 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #54647a | `--rise-bg-elevated` #edf0f6 | 5.28 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #95a3b8 | `--rise-bg` #ffffff | 2.56 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #ffffff | `--rise-bg-inverted` #080e15 | 19.37 | 4.5 | проходит |
| Рамка варианта outline | `--rise-border-accented` #cbd3de | `--rise-bg` #ffffff | 1.51 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #1d4ed8 | `--rise-bg` #ffffff | 6.70 | 3 | проходит |
| Кольцо фокуса | `--rise-focus-ring` #1d4ed8 | `--rise-bg-muted` #f4f6f9 | 6.19 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg` #ffffff | 6.39 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg-muted` #f4f6f9 | 5.90 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg-elevated` #edf0f6 | 5.60 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-primary-soft` #f0f5ff | 5.84 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg` #ffffff | 5.40 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg-muted` #f4f6f9 | 4.99 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg-elevated` #edf0f6 | 4.73 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-primary-soft` #f0f5ff | 4.94 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg` #ffffff | 5.86 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg-muted` #f4f6f9 | 5.41 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg-elevated` #edf0f6 | 5.13 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-primary-soft` #f0f5ff | 5.36 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg` #ffffff | 6.08 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg-muted` #f4f6f9 | 5.62 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg-elevated` #edf0f6 | 5.33 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-primary-soft` #f0f5ff | 5.56 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg` #ffffff | 6.55 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg-muted` #f4f6f9 | 6.05 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg-elevated` #edf0f6 | 5.73 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-primary-soft` #f0f5ff | 5.99 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg` #ffffff | 6.81 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg-muted` #f4f6f9 | 6.29 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg-elevated` #edf0f6 | 5.97 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-primary-soft` #f0f5ff | 6.23 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg` #ffffff | 6.39 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg-muted` #f4f6f9 | 5.90 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg-elevated` #edf0f6 | 5.60 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-primary-soft` #f0f5ff | 5.84 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg` #ffffff | 5.96 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg-muted` #f4f6f9 | 5.50 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg-elevated` #edf0f6 | 5.22 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-primary-soft` #f0f5ff | 5.45 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg` #ffffff | 13.36 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg-muted` #f4f6f9 | 12.34 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg-elevated` #edf0f6 | 11.70 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-primary-soft` #f0f5ff | 12.22 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #ffffff | `--rise-primary` #1d4ed8 | 6.70 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #ffffff | `--rise-primary-hover` #133eba | 8.66 | 4.5 | проходит |
| Заливка primary как графика на фоне | `--rise-primary` #1d4ed8 | `--rise-bg` #ffffff | 6.70 | 3 | проходит |
| Текст primary на фоне | `--rise-primary-text` #0e3196 | `--rise-bg` #ffffff | 11.06 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #0e3196 | `--rise-primary-soft` #f0f5ff | 10.12 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #0e3196 | `--rise-primary-soft-hover` #d8e5ff | 8.73 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #1d4ed8 | `--rise-primary-soft` #f0f5ff | 6.13 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #1d4ed8 | `--rise-bg-elevated` #edf0f6 | 5.87 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #ffffff | `--rise-success` #0b7f4e | 5.05 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #ffffff | `--rise-success-hover` #086b41 | 6.58 | 4.5 | проходит |
| Заливка success как графика на фоне | `--rise-success` #0b7f4e | `--rise-bg` #ffffff | 5.05 | 3 | проходит |
| Текст success на фоне | `--rise-success-text` #065a37 | `--rise-bg` #ffffff | 8.32 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #065a37 | `--rise-success-soft` #e8f8f0 | 7.57 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #065a37 | `--rise-success-soft-hover` #d3f2e2 | 6.96 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #0b7f4e | `--rise-success-soft` #e8f8f0 | 4.60 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #0b7f4e | `--rise-bg-elevated` #edf0f6 | 4.42 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #ffffff | `--rise-info` #2a55f0 | 5.74 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #ffffff | `--rise-info-hover` #2143c4 | 7.88 | 4.5 | проходит |
| Заливка info как графика на фоне | `--rise-info` #2a55f0 | `--rise-bg` #ffffff | 5.74 | 3 | проходит |
| Текст info на фоне | `--rise-info-text` #1c3596 | `--rise-bg` #ffffff | 10.51 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #1c3596 | `--rise-info-soft` #eef3ff | 9.45 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #1c3596 | `--rise-info-soft-hover` #dde6ff | 8.42 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #2a55f0 | `--rise-info-soft` #eef3ff | 5.17 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #2a55f0 | `--rise-bg-elevated` #edf0f6 | 5.03 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #080e15 | `--rise-warning` #c77300 | 5.43 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #080e15 | `--rise-warning-hover` #e89a00 | 8.35 | 4.5 | проходит |
| Заливка warning как графика на фоне | `--rise-warning` #c77300 | `--rise-bg` #ffffff | 3.57 | 3 | проходит |
| Текст warning на фоне | `--rise-warning-text` #7a4300 | `--rise-bg` #ffffff | 7.98 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #7a4300 | `--rise-warning-soft` #fff6e0 | 7.42 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #7a4300 | `--rise-warning-soft-hover` #ffebb8 | 6.78 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #c77300 | `--rise-warning-soft` #fff6e0 | 3.32 | 4.5 | справочно |
| Графика warning на bg-elevated | `--rise-warning` #c77300 | `--rise-bg-elevated` #edf0f6 | 3.13 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #ffffff | `--rise-error` #dc1f37 | 4.89 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #ffffff | `--rise-error-hover` #b9152b | 6.55 | 4.5 | проходит |
| Заливка error как графика на фоне | `--rise-error` #dc1f37 | `--rise-bg` #ffffff | 4.89 | 3 | проходит |
| Текст error на фоне | `--rise-error-text` #9b0f22 | `--rise-bg` #ffffff | 8.45 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #9b0f22 | `--rise-error-soft` #ffeef0 | 7.54 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #9b0f22 | `--rise-error-soft-hover` #ffdce0 | 6.67 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #dc1f37 | `--rise-error-soft` #ffeef0 | 4.36 | 4.5 | справочно |
| Графика error на bg-elevated | `--rise-error` #dc1f37 | `--rise-bg-elevated` #edf0f6 | 4.28 | 3 | проходит |

## Пресет corporate — тёмная тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #f4f6f9 | `--rise-bg` #060a0f | 18.32 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f4f6f9 | `--rise-bg-muted` #0c131b | 17.24 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f4f6f9 | `--rise-bg-elevated` #131b26 | 16.00 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f4f6f9 | `--rise-surface-raised` #161f2b | 15.32 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #cbd3de | `--rise-bg` #060a0f | 13.14 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #cbd3de | `--rise-bg-muted` #0c131b | 12.37 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #cbd3de | `--rise-bg-elevated` #131b26 | 11.47 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #cbd3de | `--rise-surface-raised` #161f2b | 10.99 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #a7b3c5 | `--rise-bg` #060a0f | 9.38 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #a7b3c5 | `--rise-bg-muted` #0c131b | 8.83 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #a7b3c5 | `--rise-bg-elevated` #131b26 | 8.19 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #a7b3c5 | `--rise-surface-raised` #161f2b | 7.85 | 4.5 | проходит |
| Граница флажка и радио | `--rise-border-control` #5c6c82 | `--rise-bg` #060a0f | 3.71 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #5c6c82 | `--rise-bg-muted` #0c131b | 3.49 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #5c6c82 | `--rise-bg-elevated` #131b26 | 3.24 | 3 | проходит |
| Вторичный текст | `--rise-text-muted` #8493a8 | `--rise-bg` #060a0f | 6.34 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #8493a8 | `--rise-bg-muted` #0c131b | 5.97 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #8493a8 | `--rise-surface-raised` #161f2b | 5.30 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #8493a8 | `--rise-bg-elevated` #131b26 | 5.53 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #54647a | `--rise-bg` #060a0f | 3.29 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #080e15 | `--rise-bg-inverted` #f4f6f9 | 17.89 | 4.5 | проходит |
| Рамка варианта outline | `--rise-border-accented` #253040 | `--rise-bg` #060a0f | 1.49 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #4379ff | `--rise-bg` #060a0f | 5.12 | 3 | проходит |
| Кольцо фокуса | `--rise-focus-ring` #4379ff | `--rise-bg-muted` #0c131b | 4.82 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg` #060a0f | 8.70 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg-muted` #0c131b | 8.19 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg-elevated` #131b26 | 7.60 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-primary-soft` #0e1a31 | 7.62 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg` #060a0f | 12.40 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg-muted` #0c131b | 11.67 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg-elevated` #131b26 | 10.83 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-primary-soft` #0e1a31 | 10.86 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg` #060a0f | 10.19 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg-muted` #0c131b | 9.60 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg-elevated` #131b26 | 8.90 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-primary-soft` #0e1a31 | 8.93 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg` #060a0f | 6.31 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg-muted` #0c131b | 5.94 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg-elevated` #131b26 | 5.51 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-primary-soft` #0e1a31 | 5.53 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg` #060a0f | 8.89 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg-muted` #0c131b | 8.37 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg-elevated` #131b26 | 7.77 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-primary-soft` #0e1a31 | 7.79 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg` #060a0f | 9.27 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg-muted` #0c131b | 8.73 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg-elevated` #131b26 | 8.10 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-primary-soft` #0e1a31 | 8.12 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg` #060a0f | 13.74 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg-muted` #0c131b | 12.94 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg-elevated` #131b26 | 12.00 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-primary-soft` #0e1a31 | 12.04 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg` #060a0f | 13.12 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg-muted` #0c131b | 12.36 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg-elevated` #131b26 | 11.46 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-primary-soft` #0e1a31 | 11.50 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg` #060a0f | 13.22 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg-muted` #0c131b | 12.45 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg-elevated` #131b26 | 11.55 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-primary-soft` #0e1a31 | 11.58 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #080e15 | `--rise-primary` #4379ff | 5.00 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #080e15 | `--rise-primary-hover` #6b98fe | 6.96 | 4.5 | проходит |
| Заливка primary как графика на фоне | `--rise-primary` #4379ff | `--rise-bg` #060a0f | 5.12 | 3 | проходит |
| Текст primary на фоне | `--rise-primary-text` #9bbbff | `--rise-bg` #060a0f | 10.34 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #9bbbff | `--rise-primary-soft` #0e1a31 | 9.05 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #9bbbff | `--rise-primary-soft-hover` #12203f | 8.36 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #4379ff | `--rise-primary-soft` #0e1a31 | 4.48 | 4.5 | справочно |
| Графика primary на bg-elevated | `--rise-primary` #4379ff | `--rise-bg-elevated` #131b26 | 4.47 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #080e15 | `--rise-success` #2fd08a | 9.70 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #080e15 | `--rise-success-hover` #5cdda4 | 11.38 | 4.5 | проходит |
| Заливка success как графика на фоне | `--rise-success` #2fd08a | `--rise-bg` #060a0f | 9.92 | 3 | проходит |
| Текст success на фоне | `--rise-success-text` #7fe6b8 | `--rise-bg` #060a0f | 13.14 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #7fe6b8 | `--rise-success-soft` #0c2621 | 10.60 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #7fe6b8 | `--rise-success-soft-hover` #0e3228 | 9.27 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #2fd08a | `--rise-success-soft` #0c2621 | 8.01 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #2fd08a | `--rise-bg-elevated` #131b26 | 8.67 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #080e15 | `--rise-info` #6a8dff | 6.33 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #080e15 | `--rise-info-hover` #8eabff | 8.69 | 4.5 | проходит |
| Заливка info как графика на фоне | `--rise-info` #6a8dff | `--rise-bg` #060a0f | 6.48 | 3 | проходит |
| Текст info на фоне | `--rise-info-text` #a9bfff | `--rise-bg` #060a0f | 10.95 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #a9bfff | `--rise-info-soft` #141d31 | 9.31 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #a9bfff | `--rise-info-soft-hover` #1a243f | 8.44 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #6a8dff | `--rise-info-soft` #141d31 | 5.52 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #6a8dff | `--rise-bg-elevated` #131b26 | 5.66 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #080e15 | `--rise-warning` #ffb224 | 10.74 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #080e15 | `--rise-warning-hover` #ffc457 | 12.26 | 4.5 | проходит |
| Заливка warning как графика на фоне | `--rise-warning` #ffb224 | `--rise-bg` #060a0f | 11.00 | 3 | проходит |
| Текст warning на фоне | `--rise-warning-text` #ffd17a | `--rise-bg` #060a0f | 13.87 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #ffd17a | `--rise-warning-soft` #292212 | 11.06 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #ffd17a | `--rise-warning-soft-hover` #382c13 | 9.58 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #ffb224 | `--rise-warning-soft` #292212 | 8.77 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #ffb224 | `--rise-bg-elevated` #131b26 | 9.61 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #080e15 | `--rise-error` #ff5468 | 6.20 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #080e15 | `--rise-error-hover` #ff7a8a | 7.75 | 4.5 | проходит |
| Заливка error как графика на фоне | `--rise-error` #ff5468 | `--rise-bg` #060a0f | 6.35 | 3 | проходит |
| Текст error на фоне | `--rise-error-text` #ff9da9 | `--rise-bg` #060a0f | 10.05 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #ff9da9 | `--rise-error-soft` #29151c | 8.77 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #ff9da9 | `--rise-error-soft-hover` #381921 | 8.02 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #ff5468 | `--rise-error-soft` #29151c | 5.54 | 4.5 | проходит |
| Графика error на bg-elevated | `--rise-error` #ff5468 | `--rise-bg-elevated` #131b26 | 5.54 | 3 | проходит |

## Пресет playful — светлая тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #0d0d11 | `--rise-bg` #fdfdfe | 19.08 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #0d0d11 | `--rise-bg-muted` #f6f6f7 | 17.96 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #0d0d11 | `--rise-bg-elevated` #eeeef0 | 16.74 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #0d0d11 | `--rise-surface-raised` #fdfdfe | 19.08 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #302e36 | `--rise-bg` #fdfdfe | 13.16 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #302e36 | `--rise-bg-muted` #f6f6f7 | 12.39 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #302e36 | `--rise-bg-elevated` #eeeef0 | 11.55 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #302e36 | `--rise-surface-raised` #fdfdfe | 13.16 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #484751 | `--rise-bg` #fdfdfe | 9.00 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #484751 | `--rise-bg-muted` #f6f6f7 | 8.47 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #484751 | `--rise-bg-elevated` #eeeef0 | 7.89 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #484751 | `--rise-surface-raised` #fdfdfe | 9.00 | 4.5 | проходит |
| Граница флажка и радио | `--rise-border-control` #868490 | `--rise-bg` #fdfdfe | 3.61 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #868490 | `--rise-bg-muted` #f6f6f7 | 3.40 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #868490 | `--rise-bg-elevated` #eeeef0 | 3.17 | 3 | проходит |
| Вторичный текст | `--rise-text-muted` #63616c | `--rise-bg` #fdfdfe | 5.98 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #63616c | `--rise-bg-muted` #f6f6f7 | 5.62 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #63616c | `--rise-surface-raised` #fdfdfe | 5.98 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #63616c | `--rise-bg-elevated` #eeeef0 | 5.24 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #a2a1ab | `--rise-bg` #fdfdfe | 2.51 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #fdfdfe | `--rise-bg-inverted` #0d0d11 | 19.08 | 4.5 | проходит |
| Рамка варианта outline | `--rise-border-accented` #d2d1d7 | `--rise-bg` #fdfdfe | 1.49 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #7c3aed | `--rise-bg` #fdfdfe | 5.61 | 3 | проходит |
| Кольцо фокуса | `--rise-focus-ring` #7c3aed | `--rise-bg-muted` #f6f6f7 | 5.28 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg` #fdfdfe | 6.28 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg-muted` #f6f6f7 | 5.92 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg-elevated` #eeeef0 | 5.51 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-primary-soft` #f5f3ff | 5.83 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg` #fdfdfe | 5.31 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg-muted` #f6f6f7 | 5.00 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg-elevated` #eeeef0 | 4.66 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-primary-soft` #f5f3ff | 4.92 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg` #fdfdfe | 5.76 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg-muted` #f6f6f7 | 5.42 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg-elevated` #eeeef0 | 5.06 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-primary-soft` #f5f3ff | 5.34 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg` #fdfdfe | 5.98 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg-muted` #f6f6f7 | 5.63 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg-elevated` #eeeef0 | 5.25 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-primary-soft` #f5f3ff | 5.54 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg` #fdfdfe | 6.44 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg-muted` #f6f6f7 | 6.06 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg-elevated` #eeeef0 | 5.65 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-primary-soft` #f5f3ff | 5.97 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg` #fdfdfe | 6.70 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg-muted` #f6f6f7 | 6.31 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg-elevated` #eeeef0 | 5.88 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-primary-soft` #f5f3ff | 6.21 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg` #fdfdfe | 6.28 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg-muted` #f6f6f7 | 5.91 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg-elevated` #eeeef0 | 5.51 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-primary-soft` #f5f3ff | 5.82 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg` #fdfdfe | 5.86 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg-muted` #f6f6f7 | 5.52 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg-elevated` #eeeef0 | 5.14 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-primary-soft` #f5f3ff | 5.43 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg` #fdfdfe | 13.14 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg-muted` #f6f6f7 | 12.37 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg-elevated` #eeeef0 | 11.53 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-primary-soft` #f5f3ff | 12.18 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #ffffff | `--rise-primary` #7c3aed | 5.70 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #ffffff | `--rise-primary-hover` #6829cc | 7.56 | 4.5 | проходит |
| Заливка primary как графика на фоне | `--rise-primary` #7c3aed | `--rise-bg` #fdfdfe | 5.61 | 3 | проходит |
| Текст primary на фоне | `--rise-primary-text` #5320a5 | `--rise-bg` #fdfdfe | 9.75 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #5320a5 | `--rise-primary-soft` #f5f3ff | 9.04 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #5320a5 | `--rise-primary-soft-hover` #ebe7ff | 8.22 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #7c3aed | `--rise-primary-soft` #f5f3ff | 5.20 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #7c3aed | `--rise-bg-elevated` #eeeef0 | 4.92 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #ffffff | `--rise-success` #0b7f4e | 5.05 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #ffffff | `--rise-success-hover` #086b41 | 6.58 | 4.5 | проходит |
| Заливка success как графика на фоне | `--rise-success` #0b7f4e | `--rise-bg` #fdfdfe | 4.97 | 3 | проходит |
| Текст success на фоне | `--rise-success-text` #065a37 | `--rise-bg` #fdfdfe | 8.18 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #065a37 | `--rise-success-soft` #e8f8f0 | 7.57 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #065a37 | `--rise-success-soft-hover` #d3f2e2 | 6.96 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #0b7f4e | `--rise-success-soft` #e8f8f0 | 4.60 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #0b7f4e | `--rise-bg-elevated` #eeeef0 | 4.36 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #ffffff | `--rise-info` #2a55f0 | 5.74 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #ffffff | `--rise-info-hover` #2143c4 | 7.88 | 4.5 | проходит |
| Заливка info как графика на фоне | `--rise-info` #2a55f0 | `--rise-bg` #fdfdfe | 5.65 | 3 | проходит |
| Текст info на фоне | `--rise-info-text` #1c3596 | `--rise-bg` #fdfdfe | 10.33 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #1c3596 | `--rise-info-soft` #eef3ff | 9.45 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #1c3596 | `--rise-info-soft-hover` #dde6ff | 8.42 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #2a55f0 | `--rise-info-soft` #eef3ff | 5.17 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #2a55f0 | `--rise-bg-elevated` #eeeef0 | 4.96 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #0d0d11 | `--rise-warning` #c77300 | 5.43 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #0d0d11 | `--rise-warning-hover` #e89a00 | 8.36 | 4.5 | проходит |
| Заливка warning как графика на фоне | `--rise-warning` #c77300 | `--rise-bg` #fdfdfe | 3.51 | 3 | проходит |
| Текст warning на фоне | `--rise-warning-text` #7a4300 | `--rise-bg` #fdfdfe | 7.85 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #7a4300 | `--rise-warning-soft` #fff6e0 | 7.42 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #7a4300 | `--rise-warning-soft-hover` #ffebb8 | 6.78 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #c77300 | `--rise-warning-soft` #fff6e0 | 3.32 | 4.5 | справочно |
| Графика warning на bg-elevated | `--rise-warning` #c77300 | `--rise-bg-elevated` #eeeef0 | 3.08 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #ffffff | `--rise-error` #dc1f37 | 4.89 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #ffffff | `--rise-error-hover` #b9152b | 6.55 | 4.5 | проходит |
| Заливка error как графика на фоне | `--rise-error` #dc1f37 | `--rise-bg` #fdfdfe | 4.81 | 3 | проходит |
| Текст error на фоне | `--rise-error-text` #9b0f22 | `--rise-bg` #fdfdfe | 8.31 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #9b0f22 | `--rise-error-soft` #ffeef0 | 7.54 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #9b0f22 | `--rise-error-soft-hover` #ffdce0 | 6.67 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #dc1f37 | `--rise-error-soft` #ffeef0 | 4.36 | 4.5 | справочно |
| Графика error на bg-elevated | `--rise-error` #dc1f37 | `--rise-bg-elevated` #eeeef0 | 4.22 | 3 | проходит |

## Пресет playful — тёмная тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #f6f6f7 | `--rise-bg` #09090c | 18.36 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f6f6f7 | `--rise-bg-muted` #121216 | 17.34 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f6f6f7 | `--rise-bg-elevated` #1a191f | 16.17 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f6f6f7 | `--rise-surface-raised` #1e1d23 | 15.48 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #d2d1d7 | `--rise-bg` #09090c | 13.07 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #d2d1d7 | `--rise-bg-muted` #121216 | 12.35 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #d2d1d7 | `--rise-bg-elevated` #1a191f | 11.51 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #d2d1d7 | `--rise-surface-raised` #1e1d23 | 11.02 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #b2b1ba | `--rise-bg` #09090c | 9.37 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #b2b1ba | `--rise-bg-muted` #121216 | 8.85 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #b2b1ba | `--rise-bg-elevated` #1a191f | 8.25 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #b2b1ba | `--rise-surface-raised` #1e1d23 | 7.90 | 4.5 | проходит |
| Граница флажка и радио | `--rise-border-control` #6b6974 | `--rise-bg` #09090c | 3.68 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #6b6974 | `--rise-bg-muted` #121216 | 3.48 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #6b6974 | `--rise-bg-elevated` #1a191f | 3.24 | 3 | проходит |
| Вторичный текст | `--rise-text-muted` #92909b | `--rise-bg` #09090c | 6.32 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #92909b | `--rise-bg-muted` #121216 | 5.97 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #92909b | `--rise-surface-raised` #1e1d23 | 5.33 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #92909b | `--rise-bg-elevated` #1a191f | 5.57 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #63616c | `--rise-bg` #09090c | 3.26 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #0d0d11 | `--rise-bg-inverted` #f6f6f7 | 17.96 | 4.5 | проходит |
| Рамка варианта outline | `--rise-border-accented` #302e36 | `--rise-bg` #09090c | 1.48 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #9366fe | `--rise-bg` #09090c | 5.26 | 3 | проходит |
| Кольцо фокуса | `--rise-focus-ring` #9366fe | `--rise-bg-muted` #121216 | 4.97 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg` #09090c | 8.70 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg-muted` #121216 | 8.22 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg-elevated` #1a191f | 7.66 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-primary-soft` #1d162e | 7.62 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg` #09090c | 12.40 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg-muted` #121216 | 11.71 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg-elevated` #1a191f | 10.92 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-primary-soft` #1d162e | 10.86 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg` #09090c | 10.20 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg-muted` #121216 | 9.63 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg-elevated` #1a191f | 8.98 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-primary-soft` #1d162e | 8.93 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg` #09090c | 6.31 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg-muted` #121216 | 5.96 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg-elevated` #1a191f | 5.56 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-primary-soft` #1d162e | 5.52 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg` #09090c | 8.89 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg-muted` #121216 | 8.40 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg-elevated` #1a191f | 7.83 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-primary-soft` #1d162e | 7.79 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg` #09090c | 9.27 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg-muted` #121216 | 8.76 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg-elevated` #1a191f | 8.16 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-primary-soft` #1d162e | 8.12 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg` #09090c | 13.74 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg-muted` #121216 | 12.98 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg-elevated` #1a191f | 12.10 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-primary-soft` #1d162e | 12.03 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg` #09090c | 13.12 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg-muted` #121216 | 12.40 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg-elevated` #1a191f | 11.56 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-primary-soft` #1d162e | 11.49 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg` #09090c | 13.22 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg-muted` #121216 | 12.49 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg-elevated` #1a191f | 11.64 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-primary-soft` #1d162e | 11.58 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #0d0d11 | `--rise-primary` #9366fe | 5.15 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #0d0d11 | `--rise-primary-hover` #a88cff | 7.26 | 4.5 | проходит |
| Заливка primary как графика на фоне | `--rise-primary` #9366fe | `--rise-bg` #09090c | 5.26 | 3 | проходит |
| Текст primary на фоне | `--rise-primary-text` #c4b6ff | `--rise-bg` #09090c | 10.84 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #c4b6ff | `--rise-primary-soft` #1d162e | 9.49 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #c4b6ff | `--rise-primary-soft-hover` #251c3d | 8.76 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #9366fe | `--rise-primary-soft` #1d162e | 4.61 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #9366fe | `--rise-bg-elevated` #1a191f | 4.63 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #0d0d11 | `--rise-success` #2fd08a | 9.71 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #0d0d11 | `--rise-success-hover` #5cdda4 | 11.39 | 4.5 | проходит |
| Заливка success как графика на фоне | `--rise-success` #2fd08a | `--rise-bg` #09090c | 9.93 | 3 | проходит |
| Текст success на фоне | `--rise-success-text` #7fe6b8 | `--rise-bg` #09090c | 13.14 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #7fe6b8 | `--rise-success-soft` #0f251e | 10.65 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #7fe6b8 | `--rise-success-soft-hover` #113126 | 9.31 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #2fd08a | `--rise-success-soft` #0f251e | 8.04 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #2fd08a | `--rise-bg-elevated` #1a191f | 8.74 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #0d0d11 | `--rise-info` #6a8dff | 6.34 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #0d0d11 | `--rise-info-hover` #8eabff | 8.70 | 4.5 | проходит |
| Заливка info как графика на фоне | `--rise-info` #6a8dff | `--rise-bg` #09090c | 6.48 | 3 | проходит |
| Текст info на фоне | `--rise-info-text` #a9bfff | `--rise-bg` #09090c | 10.95 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #a9bfff | `--rise-info-soft` #171c2e | 9.34 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #a9bfff | `--rise-info-soft-hover` #1d243d | 8.47 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #6a8dff | `--rise-info-soft` #171c2e | 5.53 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #6a8dff | `--rise-bg-elevated` #1a191f | 5.71 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #0d0d11 | `--rise-warning` #ffb224 | 10.76 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #0d0d11 | `--rise-warning-hover` #ffc457 | 12.27 | 4.5 | проходит |
| Заливка warning как графика на фоне | `--rise-warning` #ffb224 | `--rise-bg` #09090c | 11.00 | 3 | проходит |
| Текст warning на фоне | `--rise-warning-text` #ffd17a | `--rise-bg` #09090c | 13.87 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #ffd17a | `--rise-warning-soft` #2c2110 | 11.02 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #ffd17a | `--rise-warning-soft-hover` #3b2b11 | 9.53 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #ffb224 | `--rise-warning-soft` #2c2110 | 8.74 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #ffb224 | `--rise-bg-elevated` #1a191f | 9.68 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #0d0d11 | `--rise-error` #ff5468 | 6.21 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #0d0d11 | `--rise-error-hover` #ff7a8a | 7.76 | 4.5 | проходит |
| Заливка error как графика на фоне | `--rise-error` #ff5468 | `--rise-bg` #09090c | 6.35 | 3 | проходит |
| Текст error на фоне | `--rise-error-text` #ff9da9 | `--rise-bg` #09090c | 10.05 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #ff9da9 | `--rise-error-soft` #2c1419 | 8.73 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #ff9da9 | `--rise-error-soft-hover` #3b181f | 7.96 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #ff5468 | `--rise-error-soft` #2c1419 | 5.51 | 4.5 | проходит |
| Графика error на bg-elevated | `--rise-error` #ff5468 | `--rise-bg-elevated` #1a191f | 5.59 | 3 | проходит |

## Пресет minimal — светлая тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #0d0d0d | `--rise-bg` #ffffff | 19.44 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #0d0d0d | `--rise-bg-muted` #f6f6f6 | 17.98 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #0d0d0d | `--rise-bg-elevated` #eeeeee | 16.75 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #0d0d0d | `--rise-surface-raised` #ffffff | 19.44 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2f2f2f | `--rise-bg` #ffffff | 13.39 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2f2f2f | `--rise-bg-muted` #f6f6f6 | 12.39 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2f2f2f | `--rise-bg-elevated` #eeeeee | 11.54 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #2f2f2f | `--rise-surface-raised` #ffffff | 13.39 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #484848 | `--rise-bg` #ffffff | 9.15 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #484848 | `--rise-bg-muted` #f6f6f6 | 8.46 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #484848 | `--rise-bg-elevated` #eeeeee | 7.88 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #484848 | `--rise-surface-raised` #ffffff | 9.15 | 4.5 | проходит |
| Граница флажка и радио | `--rise-border-control` #868686 | `--rise-bg` #ffffff | 3.64 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #868686 | `--rise-bg-muted` #f6f6f6 | 3.37 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #868686 | `--rise-bg-elevated` #eeeeee | 3.14 | 3 | проходит |
| Вторичный текст | `--rise-text-muted` #636363 | `--rise-bg` #ffffff | 6.01 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #636363 | `--rise-bg-muted` #f6f6f6 | 5.56 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #636363 | `--rise-surface-raised` #ffffff | 6.01 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #636363 | `--rise-bg-elevated` #eeeeee | 5.18 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #a2a2a2 | `--rise-bg` #ffffff | 2.55 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #ffffff | `--rise-bg-inverted` #0d0d0d | 19.44 | 4.5 | проходит |
| Рамка варианта outline | `--rise-border-accented` #d2d2d2 | `--rise-bg` #ffffff | 1.51 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #18181b | `--rise-bg` #ffffff | 17.72 | 3 | проходит |
| Кольцо фокуса | `--rise-focus-ring` #18181b | `--rise-bg-muted` #f6f6f6 | 16.39 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg` #ffffff | 6.39 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg-muted` #f6f6f6 | 5.91 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-bg-elevated` #eeeeee | 5.51 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #6b3fd4 | `--rise-primary-soft` #f5f5f5 | 5.86 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg` #ffffff | 5.40 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg-muted` #f6f6f6 | 5.00 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-bg-elevated` #eeeeee | 4.65 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #0b7a47 | `--rise-primary-soft` #f5f5f5 | 4.95 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg` #ffffff | 5.86 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg-muted` #f6f6f6 | 5.42 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-bg-elevated` #eeeeee | 5.05 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #b23e06 | `--rise-primary-soft` #f5f5f5 | 5.37 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg` #ffffff | 6.08 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg-muted` #f6f6f6 | 5.63 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-bg-elevated` #eeeeee | 5.24 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #5b6276 | `--rise-primary-soft` #f5f5f5 | 5.58 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg` #ffffff | 6.55 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg-muted` #f6f6f6 | 6.06 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-bg-elevated` #eeeeee | 5.64 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #2a4fd8 | `--rise-primary-soft` #f5f5f5 | 6.00 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg` #ffffff | 6.81 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg-muted` #f6f6f6 | 6.31 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-bg-elevated` #eeeeee | 5.87 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #b0174f | `--rise-primary-soft` #f5f5f5 | 6.25 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg` #ffffff | 6.39 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg-muted` #f6f6f6 | 5.91 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-bg-elevated` #eeeeee | 5.51 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #8a5200 | `--rise-primary-soft` #f5f5f5 | 5.86 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg` #ffffff | 5.96 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg-muted` #f6f6f6 | 5.51 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-bg-elevated` #eeeeee | 5.13 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #0b6e7a | `--rise-primary-soft` #f5f5f5 | 5.46 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg` #ffffff | 13.36 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg-muted` #f6f6f6 | 12.36 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-bg-elevated` #eeeeee | 11.51 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #2a2f3d | `--rise-primary-soft` #f5f5f5 | 12.25 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #ffffff | `--rise-primary` #18181b | 17.72 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #ffffff | `--rise-primary-hover` #121215 | 18.70 | 4.5 | проходит |
| Заливка primary как графика на фоне | `--rise-primary` #18181b | `--rise-bg` #ffffff | 17.72 | 3 | проходит |
| Текст primary на фоне | `--rise-primary-text` #0d0d0f | `--rise-bg` #ffffff | 19.42 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #0d0d0f | `--rise-primary-soft` #f5f5f5 | 17.81 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #0d0d0f | `--rise-primary-soft-hover` #e4e4e5 | 15.28 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #18181b | `--rise-primary-soft` #f5f5f5 | 16.25 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #18181b | `--rise-bg-elevated` #eeeeee | 15.27 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #ffffff | `--rise-success` #0b7f4e | 5.05 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #ffffff | `--rise-success-hover` #086b41 | 6.58 | 4.5 | проходит |
| Заливка success как графика на фоне | `--rise-success` #0b7f4e | `--rise-bg` #ffffff | 5.05 | 3 | проходит |
| Текст success на фоне | `--rise-success-text` #065a37 | `--rise-bg` #ffffff | 8.32 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #065a37 | `--rise-success-soft` #e8f8f0 | 7.57 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #065a37 | `--rise-success-soft-hover` #d3f2e2 | 6.96 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #0b7f4e | `--rise-success-soft` #e8f8f0 | 4.60 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #0b7f4e | `--rise-bg-elevated` #eeeeee | 4.35 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #ffffff | `--rise-info` #2a55f0 | 5.74 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #ffffff | `--rise-info-hover` #2143c4 | 7.88 | 4.5 | проходит |
| Заливка info как графика на фоне | `--rise-info` #2a55f0 | `--rise-bg` #ffffff | 5.74 | 3 | проходит |
| Текст info на фоне | `--rise-info-text` #1c3596 | `--rise-bg` #ffffff | 10.51 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #1c3596 | `--rise-info-soft` #eef3ff | 9.45 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #1c3596 | `--rise-info-soft-hover` #dde6ff | 8.42 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #2a55f0 | `--rise-info-soft` #eef3ff | 5.17 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #2a55f0 | `--rise-bg-elevated` #eeeeee | 4.95 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #0d0d0d | `--rise-warning` #c77300 | 5.44 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #0d0d0d | `--rise-warning-hover` #e89a00 | 8.38 | 4.5 | проходит |
| Заливка warning как графика на фоне | `--rise-warning` #c77300 | `--rise-bg` #ffffff | 3.57 | 3 | проходит |
| Текст warning на фоне | `--rise-warning-text` #7a4300 | `--rise-bg` #ffffff | 7.98 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #7a4300 | `--rise-warning-soft` #fff6e0 | 7.42 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #7a4300 | `--rise-warning-soft-hover` #ffebb8 | 6.78 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #c77300 | `--rise-warning-soft` #fff6e0 | 3.32 | 4.5 | справочно |
| Графика warning на bg-elevated | `--rise-warning` #c77300 | `--rise-bg-elevated` #eeeeee | 3.08 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #ffffff | `--rise-error` #dc1f37 | 4.89 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #ffffff | `--rise-error-hover` #b9152b | 6.55 | 4.5 | проходит |
| Заливка error как графика на фоне | `--rise-error` #dc1f37 | `--rise-bg` #ffffff | 4.89 | 3 | проходит |
| Текст error на фоне | `--rise-error-text` #9b0f22 | `--rise-bg` #ffffff | 8.45 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #9b0f22 | `--rise-error-soft` #ffeef0 | 7.54 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #9b0f22 | `--rise-error-soft-hover` #ffdce0 | 6.67 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #dc1f37 | `--rise-error-soft` #ffeef0 | 4.36 | 4.5 | справочно |
| Графика error на bg-elevated | `--rise-error` #dc1f37 | `--rise-bg-elevated` #eeeeee | 4.21 | 3 | проходит |

## Пресет minimal — тёмная тема

| Пара | Передний план | Фон | Контраст | Порог | Итог |
|---|---|---|---|---|---|
| Текст на поверхности | `--rise-text-highlighted` #f6f6f6 | `--rise-bg` #090909 | 18.37 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f6f6f6 | `--rise-bg-muted` #121212 | 17.34 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f6f6f6 | `--rise-bg-elevated` #1a1a1a | 16.10 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-highlighted` #f6f6f6 | `--rise-surface-raised` #1e1e1e | 15.43 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #d2d2d2 | `--rise-bg` #090909 | 13.13 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #d2d2d2 | `--rise-bg-muted` #121212 | 12.40 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #d2d2d2 | `--rise-bg-elevated` #1a1a1a | 11.51 | 4.5 | проходит |
| Текст на поверхности | `--rise-text` #d2d2d2 | `--rise-surface-raised` #1e1e1e | 11.03 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #b2b2b2 | `--rise-bg` #090909 | 9.40 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #b2b2b2 | `--rise-bg-muted` #121212 | 8.87 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #b2b2b2 | `--rise-bg-elevated` #1a1a1a | 8.24 | 4.5 | проходит |
| Текст на поверхности | `--rise-text-toned` #b2b2b2 | `--rise-surface-raised` #1e1e1e | 7.89 | 4.5 | проходит |
| Граница флажка и радио | `--rise-border-control` #6b6b6b | `--rise-bg` #090909 | 3.73 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #6b6b6b | `--rise-bg-muted` #121212 | 3.52 | 3 | проходит |
| Граница флажка и радио | `--rise-border-control` #6b6b6b | `--rise-bg-elevated` #1a1a1a | 3.27 | 3 | проходит |
| Вторичный текст | `--rise-text-muted` #929292 | `--rise-bg` #090909 | 6.36 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #929292 | `--rise-bg-muted` #121212 | 6.00 | 4.5 | проходит |
| Вторичный текст | `--rise-text-muted` #929292 | `--rise-surface-raised` #1e1e1e | 5.34 | 4.5 | проходит |
| Вторичный текст на bg-elevated | `--rise-text-muted` #929292 | `--rise-bg-elevated` #1a1a1a | 5.58 | 4.5 | проходит |
| Плейсхолдер, неактивный текст | `--rise-text-dimmed` #636363 | `--rise-bg` #090909 | 3.31 | 4.5 | справочно |
| Текст на инвертированном фоне | `--rise-text-inverted` #0d0d0d | `--rise-bg-inverted` #f6f6f6 | 17.98 | 4.5 | проходит |
| Рамка варианта outline | `--rise-border-accented` #2f2f2f | `--rise-bg` #090909 | 1.48 | 3 | справочно |
| Кольцо фокуса | `--rise-focus-ring` #e4e4e7 | `--rise-bg` #090909 | 15.65 | 3 | проходит |
| Кольцо фокуса | `--rise-focus-ring` #e4e4e7 | `--rise-bg-muted` #121212 | 14.77 | 3 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg` #090909 | 8.71 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg-muted` #121212 | 8.22 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-bg-elevated` #1a1a1a | 7.64 | 4.5 | проходит |
| Подсветка кода: keyword | `--rise-code-keyword` #b79cff | `--rise-primary-soft` #282829 | 6.46 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg` #090909 | 12.41 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg-muted` #121212 | 11.72 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-bg-elevated` #1a1a1a | 10.88 | 4.5 | проходит |
| Подсветка кода: string | `--rise-code-string` #7fe0a8 | `--rise-primary-soft` #282829 | 9.20 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg` #090909 | 10.21 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg-muted` #121212 | 9.64 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-bg-elevated` #1a1a1a | 8.95 | 4.5 | проходит |
| Подсветка кода: number | `--rise-code-number` #ffa470 | `--rise-primary-soft` #282829 | 7.57 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg` #090909 | 6.32 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg-muted` #121212 | 5.96 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-bg-elevated` #1a1a1a | 5.54 | 4.5 | проходит |
| Подсветка кода: comment | `--rise-code-comment` #8a91a6 | `--rise-primary-soft` #282829 | 4.68 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg` #090909 | 8.91 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg-muted` #121212 | 8.41 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-bg-elevated` #1a1a1a | 7.81 | 4.5 | проходит |
| Подсветка кода: function | `--rise-code-function` #8eabff | `--rise-primary-soft` #282829 | 6.60 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg` #090909 | 9.28 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg-muted` #121212 | 8.76 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-bg-elevated` #1a1a1a | 8.14 | 4.5 | проходит |
| Подсветка кода: tag | `--rise-code-tag` #ff8fb1 | `--rise-primary-soft` #282829 | 6.88 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg` #090909 | 13.76 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg-muted` #121212 | 12.99 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-bg-elevated` #1a1a1a | 12.06 | 4.5 | проходит |
| Подсветка кода: attribute | `--rise-code-attribute` #ffd07a | `--rise-primary-soft` #282829 | 10.20 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg` #090909 | 13.14 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg-muted` #121212 | 12.40 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-bg-elevated` #1a1a1a | 11.52 | 4.5 | проходит |
| Подсветка кода: property | `--rise-code-property` #6fe3ee | `--rise-primary-soft` #282829 | 9.74 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg` #090909 | 13.24 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg-muted` #121212 | 12.50 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-bg-elevated` #1a1a1a | 11.60 | 4.5 | проходит |
| Подсветка кода: variable | `--rise-code-variable` #cdd3e1 | `--rise-primary-soft` #282829 | 9.81 | 4.5 | проходит |
| Текст на заливке primary | `--rise-on-primary` #0d0d0d | `--rise-primary` #e4e4e7 | 15.32 | 4.5 | проходит |
| Текст на заливке primary (hover) | `--rise-on-primary` #0d0d0d | `--rise-primary-hover` #c3c3c6 | 11.05 | 4.5 | проходит |
| Заливка primary как графика на фоне | `--rise-primary` #e4e4e7 | `--rise-bg` #090909 | 15.65 | 3 | проходит |
| Текст primary на фоне | `--rise-primary-text` #e3e3e6 | `--rise-bg` #090909 | 15.50 | 4.5 | проходит |
| Текст на мягком фоне primary | `--rise-primary-text` #e3e3e6 | `--rise-primary-soft` #282829 | 11.49 | 4.5 | проходит |
| Текст на мягком фоне primary (hover) | `--rise-primary-text` #e3e3e6 | `--rise-primary-soft-hover` #353536 | 9.54 | 4.5 | проходит |
| Цвет primary на мягком фоне | `--rise-primary` #e4e4e7 | `--rise-primary-soft` #282829 | 11.60 | 4.5 | проходит |
| Графика primary на bg-elevated | `--rise-primary` #e4e4e7 | `--rise-bg-elevated` #1a1a1a | 13.72 | 3 | проходит |
| Текст на заливке success | `--rise-on-success` #0d0d0d | `--rise-success` #2fd08a | 9.73 | 4.5 | проходит |
| Текст на заливке success (hover) | `--rise-on-success` #0d0d0d | `--rise-success-hover` #5cdda4 | 11.41 | 4.5 | проходит |
| Заливка success как графика на фоне | `--rise-success` #2fd08a | `--rise-bg` #090909 | 9.94 | 3 | проходит |
| Текст success на фоне | `--rise-success-text` #7fe6b8 | `--rise-bg` #090909 | 13.16 | 4.5 | проходит |
| Текст на мягком фоне success | `--rise-success-text` #7fe6b8 | `--rise-success-soft` #0f251b | 10.67 | 4.5 | проходит |
| Текст на мягком фоне success (hover) | `--rise-success-text` #7fe6b8 | `--rise-success-soft-hover` #113123 | 9.33 | 4.5 | проходит |
| Цвет success на мягком фоне | `--rise-success` #2fd08a | `--rise-success-soft` #0f251b | 8.06 | 4.5 | проходит |
| Графика success на bg-elevated | `--rise-success` #2fd08a | `--rise-bg-elevated` #1a1a1a | 8.71 | 3 | проходит |
| Текст на заливке info | `--rise-on-info` #0d0d0d | `--rise-info` #6a8dff | 6.36 | 4.5 | проходит |
| Текст на заливке info (hover) | `--rise-on-info` #0d0d0d | `--rise-info-hover` #8eabff | 8.72 | 4.5 | проходит |
| Заливка info как графика на фоне | `--rise-info` #6a8dff | `--rise-bg` #090909 | 6.49 | 3 | проходит |
| Текст info на фоне | `--rise-info-text` #a9bfff | `--rise-bg` #090909 | 10.96 | 4.5 | проходит |
| Текст на мягком фоне info | `--rise-info-text` #a9bfff | `--rise-info-soft` #171c2c | 9.36 | 4.5 | проходит |
| Текст на мягком фоне info (hover) | `--rise-info-text` #a9bfff | `--rise-info-soft-hover` #1d243b | 8.50 | 4.5 | проходит |
| Цвет info на мягком фоне | `--rise-info` #6a8dff | `--rise-info-soft` #171c2c | 5.55 | 4.5 | проходит |
| Графика info на bg-elevated | `--rise-info` #6a8dff | `--rise-bg-elevated` #1a1a1a | 5.69 | 3 | проходит |
| Текст на заливке warning | `--rise-on-warning` #0d0d0d | `--rise-warning` #ffb224 | 10.78 | 4.5 | проходит |
| Текст на заливке warning (hover) | `--rise-on-warning` #0d0d0d | `--rise-warning-hover` #ffc457 | 12.30 | 4.5 | проходит |
| Заливка warning как графика на фоне | `--rise-warning` #ffb224 | `--rise-bg` #090909 | 11.01 | 3 | проходит |
| Текст warning на фоне | `--rise-warning-text` #ffd17a | `--rise-bg` #090909 | 13.88 | 4.5 | проходит |
| Текст на мягком фоне warning | `--rise-warning-text` #ffd17a | `--rise-warning-soft` #2c210d | 11.03 | 4.5 | проходит |
| Текст на мягком фоне warning (hover) | `--rise-warning-text` #ffd17a | `--rise-warning-soft-hover` #3b2b0f | 9.54 | 4.5 | проходит |
| Цвет warning на мягком фоне | `--rise-warning` #ffb224 | `--rise-warning-soft` #2c210d | 8.75 | 4.5 | проходит |
| Графика warning на bg-elevated | `--rise-warning` #ffb224 | `--rise-bg-elevated` #1a1a1a | 9.65 | 3 | проходит |
| Текст на заливке error | `--rise-on-error` #0d0d0d | `--rise-error` #ff5468 | 6.22 | 4.5 | проходит |
| Текст на заливке error (hover) | `--rise-on-error` #0d0d0d | `--rise-error-hover` #ff7a8a | 7.78 | 4.5 | проходит |
| Заливка error как графика на фоне | `--rise-error` #ff5468 | `--rise-bg` #090909 | 6.35 | 3 | проходит |
| Текст error на фоне | `--rise-error-text` #ff9da9 | `--rise-bg` #090909 | 10.07 | 4.5 | проходит |
| Текст на мягком фоне error | `--rise-error-text` #ff9da9 | `--rise-error-soft` #2c1417 | 8.74 | 4.5 | проходит |
| Текст на мягком фоне error (hover) | `--rise-error-text` #ff9da9 | `--rise-error-soft-hover` #3b181c | 7.98 | 4.5 | проходит |
| Цвет error на мягком фоне | `--rise-error` #ff5468 | `--rise-error-soft` #2c1417 | 5.52 | 4.5 | проходит |
| Графика error на bg-elevated | `--rise-error` #ff5468 | `--rise-bg-elevated` #1a1a1a | 5.57 | 3 | проходит |
