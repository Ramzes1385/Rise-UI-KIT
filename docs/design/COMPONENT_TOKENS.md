# Токены компонентов

Сгенерировано `node scripts/check-component-tokens.mjs --write` из `src/components/*/styles`. Не править руками.

Токены уровня 3 кит только читает (с запасным значением) и нигде не объявляет: задайте их на `:root`, в теме
или на контейнере — правило имён и порядок силы в DESIGN_SYSTEM.md, §1.

## BaseButton

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-button-bg` | корень | bg | — | `var(--rise-primary)` |
| `--rise-button-bg-hover` | корень | bg | hover | `var(--rise-primary-hover)` |
| `--rise-button-border` | корень | border | — | `transparent` |
| `--rise-button-font-weight` | корень | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-button-padding-x` | корень | padding-x | — | `var(--rise-control-padding-x)` |
| `--rise-button-padding-y` | корень | padding-y | — | `var(--rise-control-padding-y)` |
| `--rise-button-radius` | корень | radius | — | `var(--rise-control-radius)` |
| `--rise-button-shadow` | корень | shadow | — | `none` |
| `--rise-button-shadow-hover` | корень | shadow | hover | `var(--rise-shadow-md)` |
| `--rise-button-text` | корень | text | — | `var(--rise-on-primary)` |

## BaseCard

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-card-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-card-border` | корень | border | — | `var(--rise-border)` |
| `--rise-card-border-hover` | корень | border | hover | `var(--rise-border-accented)` |
| `--rise-card-header-bg` | header | bg | — | `transparent` |
| `--rise-card-header-padding-x` | header | padding-x | — | `var(--card-pad-right)` |
| `--rise-card-header-padding-y` | header | padding-y | — | `var(--card-pad-top)` |
| `--rise-card-padding-x` | корень | padding-x | — | `20px` |
| `--rise-card-padding-y` | корень | padding-y | — | `16px` |
| `--rise-card-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-card-shadow` | корень | shadow | — | `none` |
| `--rise-card-shadow-hover` | корень | shadow | hover | `var(--rise-shadow-sm)` |
| `--rise-card-text` | корень | text | — | `var(--rise-text)` |

## BaseInput

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-input-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-input-border` | корень | border | — | `var(--rise-border-accented)` |
| `--rise-input-border-focus` | корень | border | focus | `var(--rise-primary)` |
| `--rise-input-padding-x` | корень | padding-x | — | `var(--rise-control-padding-x)` |
| `--rise-input-padding-y` | корень | padding-y | — | `var(--rise-control-padding-y)` |
| `--rise-input-radius` | корень | radius | — | `var(--rise-control-radius)` |
| `--rise-input-text` | корень | text | — | `var(--rise-text-highlighted)` |
