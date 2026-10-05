# Токены компонентов

Сгенерировано `node scripts/check-component-tokens.mjs --write` из `src/components/*/styles`. Не править руками.

Токены уровня 3 кит только читает (с запасным значением) и нигде не объявляет: задайте их на `:root`, в теме
или на контейнере — правило имён и порядок силы в DESIGN_SYSTEM.md, §1.

## BaseAlert

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-alert-bg` | корень | bg | — | `var(--alert-role)` |
| `--rise-alert-border` | корень | border | — | `transparent` |
| `--rise-alert-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-alert-gap` | корень | gap | — | `10px` |
| `--rise-alert-padding-x` | корень | padding-x | — | `16px` |
| `--rise-alert-padding-y` | корень | padding-y | — | `12px` |
| `--rise-alert-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-alert-shadow` | корень | shadow | — | `none` |
| `--rise-alert-text` | корень | text | — | `var(--alert-on-role)` |

## BaseAvatar

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-avatar-bg` | корень | bg | — | `var(--rise-bg-elevated)` |
| `--rise-avatar-border` | корень | border | — | `var(--rise-border-accented)` |
| `--rise-avatar-font-size` | корень | font-size | — | `var(--rise-font-size-base)` |
| `--rise-avatar-font-weight` | корень | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-avatar-height` | корень | height | — | `var(--rise-avatar-width, 32px)` |
| `--rise-avatar-online-bg` | online | bg | — | `var(--rise-success)` |
| `--rise-avatar-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-avatar-shadow` | корень | shadow | — | `var(--rise-shadow-sm)` |
| `--rise-avatar-text` | корень | text | — | `var(--rise-text-toned)` |
| `--rise-avatar-width` | корень | width | — | `32px` |

## BaseAvatarGroup

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-avatar-group-more-bg` | more | bg | — | `var(--rise-bg-elevated)` |
| `--rise-avatar-group-more-font-size` | more | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-avatar-group-more-font-weight` | more | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-avatar-group-more-height` | more | height | — | `var(--rise-avatar-group-more-width, 32px)` |
| `--rise-avatar-group-more-radius` | more | radius | — | `var(--rise-radius-md)` |
| `--rise-avatar-group-more-text` | more | text | — | `var(--rise-text-highlighted)` |
| `--rise-avatar-group-more-width` | more | width | — | `32px` |
| `--rise-avatar-group-ring` | корень | ring | — | `var(--rise-bg)` |

## BaseBadge

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-badge-bg` | корень | bg | — | `var(--rise-primary)` |
| `--rise-badge-border` | корень | border | — | `transparent` |
| `--rise-badge-font-size` | корень | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-badge-font-weight` | корень | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-badge-gap` | корень | gap | — | `4px` |
| `--rise-badge-padding-x` | корень | padding-x | — | `7px` |
| `--rise-badge-padding-y` | корень | padding-y | — | `1px` |
| `--rise-badge-radius` | корень | radius | — | `var(--rise-radius-sm)` |
| `--rise-badge-shadow` | корень | shadow | — | `none` |
| `--rise-badge-text` | корень | text | — | `var(--rise-on-primary)` |

## BaseBankCard

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-bank-card-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-bank-card-border` | корень | border | — | `var(--rise-border)` |
| `--rise-bank-card-gap` | корень | gap | — | `12px` |
| `--rise-bank-card-number-font-size` | number | font-size | — | `var(--rise-font-size-xl)` |
| `--rise-bank-card-padding-x` | корень | padding-x | — | `20px` |
| `--rise-bank-card-padding-y` | корень | padding-y | — | `16px` |
| `--rise-bank-card-radius` | корень | radius | — | `var(--rise-radius-xl)` |
| `--rise-bank-card-shadow` | корень | shadow | — | `var(--rise-shadow-md)` |
| `--rise-bank-card-text` | корень | text | — | `var(--rise-color-neutral-50)` |
| `--rise-bank-card-width` | корень | width | — | `320px` |
## BaseAutocomplete

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-autocomplete-empty-text` | empty | text | — | `var(--rise-text-muted)` |
| `--rise-autocomplete-list-gap` | list | gap | — | `1px` |
| `--rise-autocomplete-option-bg-hover` | option | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-autocomplete-option-bg-selected` | option | bg | selected | `transparent` |
| `--rise-autocomplete-option-padding-x` | option | padding-x | — | `8px` |
| `--rise-autocomplete-option-padding-y` | option | padding-y | — | `6px` |
| `--rise-autocomplete-option-text` | option | text | — | `var(--rise-text)` |

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

## BaseButtonGroup

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-button-group-bg` | корень | bg | — | `transparent` |
| `--rise-button-group-gap` | корень | gap | — | `-1px` |
| `--rise-button-group-padding` | корень | padding | — | `0px` |
| `--rise-button-group-radius` | корень | radius | — | `var(--rise-control-radius)` |
| `--rise-button-group-shadow` | корень | shadow | — | `none` |

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

## BaseChip

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-chip-badge-bg` | badge | bg | — | `var(--rise-primary)` |
| `--rise-chip-badge-border` | badge | border | — | `transparent` |
| `--rise-chip-badge-font-size` | badge | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-chip-badge-font-weight` | badge | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-chip-badge-height` | badge | height | — | `18px` |
| `--rise-chip-badge-padding-x` | badge | padding-x | — | `5px` |
| `--rise-chip-badge-radius` | badge | radius | — | `var(--rise-radius-full)` |
| `--rise-chip-badge-shadow` | badge | shadow | — | `0 0 0 2px var(--rise-bg)` |
| `--rise-chip-badge-text` | badge | text | — | `var(--rise-on-primary)` |

## BaseColorModeButton

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-color-mode-button-padding` | корень | padding | — | `7px` |
| `--rise-color-mode-button-ring` | корень | ring | — | `var(--rise-focus-ring)` |
| `--rise-color-mode-button-text` | корень | text | — | `currentcolor` |
| `--rise-color-mode-button-text-hover` | корень | text | hover | `ct(color-mode-button, text, currentcolor)` |

## BaseFab

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-fab-bg` | корень | bg | — | `var(--rise-primary)` |
| `--rise-fab-bg-hover` | корень | bg | hover | `var(--rise-primary-hover)` |
| `--rise-fab-border` | корень | border | — | `transparent` |
| `--rise-fab-font-weight` | корень | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-fab-gap` | корень | gap | — | `8px` |
| `--rise-fab-height` | корень | height | — | `56px` |
| `--rise-fab-padding-x` | корень | padding-x | — | `20px` |
| `--rise-fab-radius` | корень | radius | — | `var(--rise-radius-full)` |
| `--rise-fab-shadow` | корень | shadow | — | `var(--rise-shadow-lg)` |
| `--rise-fab-text` | корень | text | — | `var(--rise-on-primary)` |

## BaseIcon

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-icon-icon-size` | корень | icon-size | — | `20px` |
| `--rise-icon-text` | корень | text | — | `currentcolor` |

## BaseImage

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-image-bg` | корень | bg | — | `transparent` |
| `--rise-image-error-bg` | error | bg | — | `var(--rise-bg-elevated)` |
| `--rise-image-error-text` | error | text | — | `var(--rise-text-dimmed)` |
| `--rise-image-placeholder-bg` | placeholder | bg | — | `var(--rise-bg-elevated)` |
| `--rise-image-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-image-zoom-bg` | zoom | bg | — | `var(--rise-media-backdrop)` |
| `--rise-image-zoom-text` | zoom | text | — | `var(--rise-media-text)` |
| `--rise-image-zoom-thumb-ring-selected` | zoom-thumb | ring | selected | `var(--rise-primary)` |
| `--rise-image-zoom-toolbar-bg` | zoom-toolbar | bg | — | `var(--rise-media-surface)` |
| `--rise-image-zoom-toolbar-radius` | zoom-toolbar | radius | — | `var(--rise-radius-full)` |
## BaseCardInput

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-card-input-brand-icon-size` | brand | icon-size | — | `sz(22px)` |
| `--rise-card-input-brand-text` | brand | text | — | `var(--rise-text-muted)` |
| `--rise-card-input-face-bg` | face | bg | — | `var(--base-card-input-face-bg)` |
| `--rise-card-input-face-font-size` | face | font-size | — | `sz(var(--rise-font-size-sm))` |
| `--rise-card-input-face-radius` | face | radius | — | `sz(var(--rise-radius-xl))` |
| `--rise-card-input-face-shadow` | face | shadow | — | `var(--rise-shadow-md)` |
| `--rise-card-input-face-text` | face | text | — | `var(--rise-color-neutral-50)` |
| `--rise-card-input-fields-gap` | fields | gap | — | `sz(12px)` |
| `--rise-card-input-gap` | корень | gap | — | `sz(6px)` |

## BaseColorPicker

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-color-picker-bg` | корень | bg | — | `var(--rise-input-bg, var(--rise-bg))` |
| `--rise-color-picker-border` | корень | border | — | `var(--rise-input-border, var(--rise-border-accented))` |
| `--rise-color-picker-border-focus` | корень | border | focus | `var(--rise-input-border-focus, var(--rise-primary))` |
| `--rise-color-picker-panel-bg` | panel | bg | — | `var(--custom-bg, var(--rise-bg))` |
| `--rise-color-picker-panel-padding` | panel | padding | — | `space(12px 16px)` |
| `--rise-color-picker-panel-radius` | panel | radius | — | `var(--rise-radius-md)` |
| `--rise-color-picker-panel-shadow` | panel | shadow | — | `var(--rise-shadow-lg)` |
| `--rise-color-picker-preset-radius` | preset | radius | — | `var(--rise-radius-full)` |
| `--rise-color-picker-preset-ring-selected` | preset | ring | selected | `var(--rise-primary)` |
| `--rise-color-picker-radius` | корень | radius | — | `var(--rise-input-radius, var(--rise-control-radius))` |
| `--rise-color-picker-thumb-border` | thumb | border | — | `var(--picker-white)` |
| `--rise-color-picker-thumb-shadow` | thumb | shadow | — | `var(--picker-thumb-shadow)` |

## BaseDatePicker

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-date-picker-icon-text` | icon | text | — | `var(--rise-text-muted)` |
| `--rise-date-picker-icon-text-hover` | icon | text | hover | `var(--rise-text-highlighted)` |
| `--rise-date-picker-panel-bg` | panel | bg | — | `var(--rise-bg)` |
| `--rise-date-picker-panel-border` | panel | border | — | `var(--rise-border)` |
| `--rise-date-picker-panel-gap` | panel | gap | — | `4px` |
| `--rise-date-picker-panel-padding` | panel | padding | — | `4px` |
| `--rise-date-picker-panel-radius` | panel | radius | — | `var(--rise-radius-md)` |
| `--rise-date-picker-panel-shadow` | panel | shadow | — | `var(--rise-shadow-lg)` |
| `--rise-date-picker-panel-text` | panel | text | — | `var(--rise-text)` |
| `--rise-date-picker-title-font-weight` | title | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-date-picker-title-text` | title | text | — | `var(--rise-text-highlighted)` |

## BaseInput

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-input-bg` | корень | bg | — | `var(--rise-input-bg, var(--rise-bg))` |
| `--rise-input-border` | корень | border | — | `var(--rise-input-border, var(--rise-border-accented))` |
| `--rise-input-border-focus` | корень | border | focus | `var(--rise-input-border-focus, var(--rise-primary))` |
| `--rise-input-padding-x` | корень | padding-x | — | `var(--rise-control-padding-x)` |
| `--rise-input-padding-y` | корень | padding-y | — | `var(--rise-control-padding-y)` |
| `--rise-input-radius` | корень | radius | — | `var(--rise-input-radius, var(--rise-control-radius))` |
| `--rise-input-text` | корень | text | — | `var(--rise-text-highlighted)` |

## BaseKbd

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-kbd-bg` | корень | bg | — | `var(--rise-bg-elevated)` |
| `--rise-kbd-border` | корень | border | — | `var(--rise-border-accented)` |
| `--rise-kbd-font-size` | корень | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-kbd-font-weight` | корень | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-kbd-height` | корень | height | — | `20px` |
| `--rise-kbd-padding-x` | корень | padding-x | — | `4px` |
| `--rise-kbd-radius` | корень | radius | — | `var(--rise-radius-sm)` |
| `--rise-kbd-shadow` | корень | shadow | — | `none` |
| `--rise-kbd-text` | корень | text | — | `var(--rise-text-highlighted)` |

## BaseLoader

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-loader-bg` | корень | bg | — | `color-mix(in srgb, var(--rise-bg) 80%, transparent)` |
| `--rise-loader-gap` | корень | gap | — | `8px` |
| `--rise-loader-icon-size` | корень | icon-size | — | `32px` |
| `--rise-loader-label-font-size` | label | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-loader-label-text` | label | text | — | `var(--rise-text-muted)` |
| `--rise-loader-spinner-track-bg` | spinner-track | bg | — | `var(--rise-bg-accented)` |
| `--rise-loader-text` | корень | text | — | `var(--rise-primary)` |

## BaseMarkdown

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-markdown-code-bg` | code | bg | — | `var(--rise-bg-muted)` |
| `--rise-markdown-code-block-bg` | code-block | bg | — | `var(--rise-bg-muted)` |
| `--rise-markdown-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-markdown-heading-text` | heading | text | — | `var(--rise-text-highlighted)` |
| `--rise-markdown-link-text` | link | text | — | `var(--rise-primary)` |
| `--rise-markdown-padding-x` | корень | padding-x | — | `16px` |
| `--rise-markdown-padding-y` | корень | padding-y | — | `12px` |
| `--rise-markdown-quote-border` | quote | border | — | `var(--rise-primary)` |
| `--rise-markdown-quote-text` | quote | text | — | `var(--rise-text-muted)` |
| `--rise-markdown-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-markdown-table-border` | table | border | — | `var(--rise-border)` |
| `--rise-markdown-text` | корень | text | — | `var(--rise-text)` |

## BaseMarquee

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-marquee-bg` | корень | bg | — | `transparent` |
| `--rise-marquee-border` | корень | border | — | `transparent` |
| `--rise-marquee-font-size` | корень | font-size | — | `var(--rise-control-font-size)` |
| `--rise-marquee-gap` | корень | gap | — | `4px` |
| `--rise-marquee-padding-x` | корень | padding-x | — | `4px` |
| `--rise-marquee-padding-y` | корень | padding-y | — | `var(--rise-control-padding-y)` |
| `--rise-marquee-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-marquee-separator-text` | separator | text | — | `var(--rise-text-muted)` |
| `--rise-marquee-text` | корень | text | — | `var(--rise-text)` |
| `--rise-marquee-viewport-height` | viewport | height | — | `160px` |

## BaseProgress

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-progress-circle-label-font-weight` | circle-label | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-progress-circle-label-text` | circle-label | text | — | `var(--rise-text-highlighted)` |
| `--rise-progress-fill-bg` | fill | bg | — | `var(--rise-primary)` |
| `--rise-progress-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-progress-gap` | корень | gap | — | `8px` |
| `--rise-progress-height` | корень | height | — | `8px` |
| `--rise-progress-radius` | корень | radius | — | `var(--rise-radius-full)` |
| `--rise-progress-status-text` | status | text | — | `var(--rise-text-muted)` |
| `--rise-progress-svg-width` | svg | width | — | `64px` |
| `--rise-progress-track-bg` | track | bg | — | `var(--rise-bg-accented)` |

## BaseQrCode

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-qr-code-border` | корень | border | — | `var(--rise-border)` |
| `--rise-qr-code-caption-font-size` | caption | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-qr-code-caption-text` | caption | text | — | `var(--rise-text-toned)` |
| `--rise-qr-code-gap` | корень | gap | — | `6px` |
| `--rise-qr-code-padding` | корень | padding | — | `4px` |
| `--rise-qr-code-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-qr-code-shadow` | корень | shadow | — | `none` |

## BaseSeparator

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-separator-border` | корень | border | — | `var(--rise-border)` |
| `--rise-separator-content-font-size` | content | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-separator-content-font-weight` | content | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-separator-content-padding-x` | content | padding-x | — | `12px` |
| `--rise-separator-content-padding-y` | content | padding-y | — | `0px` |
| `--rise-separator-content-text` | content | text | — | `var(--rise-text-muted)` |

## BaseSkeleton

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-skeleton-bg` | корень | bg | — | `var(--rise-bg-elevated)` |
| `--rise-skeleton-height` | корень | height | — | `16px` |
| `--rise-skeleton-radius` | корень | radius | — | `var(--rise-radius-sm)` |

## BaseSplitButton

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-split-button-gap` | корень | gap | — | `-1px` |
| `--rise-split-button-toggle-border` | toggle | border | — | `color-mix(in srgb, currentcolor 30%, transparent)` |
| `--rise-split-button-toggle-padding-x` | toggle | padding-x | — | `8px` |

## BaseTag

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-tag-bg` | корень | bg | — | `var(--rise-bg-muted)` |
| `--rise-tag-bg-hover` | корень | bg | hover | `var(--rise-bg-accented)` |
| `--rise-tag-bg-selected` | корень | bg | selected | `var(--rise-primary)` |
| `--rise-tag-border` | корень | border | — | `var(--rise-border)` |
| `--rise-tag-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-tag-font-weight` | корень | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-tag-gap` | корень | gap | — | `4px` |
| `--rise-tag-padding-x` | корень | padding-x | — | `10px` |
| `--rise-tag-padding-y` | корень | padding-y | — | `2px` |
| `--rise-tag-radius` | корень | radius | — | `var(--rise-radius-full)` |
| `--rise-tag-text` | корень | text | — | `var(--rise-text)` |
| `--rise-tag-text-selected` | корень | text | selected | `var(--rise-on-primary)` |

## BaseTagGroup

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-tag-group-gap` | корень | gap | — | `6px` |

## BaseText

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-text-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-text-font-weight` | корень | font-weight | — | `var(--rise-font-weight-normal)` |
| `--rise-text-text` | корень | text | — | `var(--rise-text)` |

## BaseUser

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-user-description-font-size` | description | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-user-description-text` | description | text | — | `var(--rise-text-muted)` |
| `--rise-user-gap` | корень | gap | — | `8px` |
| `--rise-user-name-font-size` | name | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-user-name-font-weight` | name | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-user-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-user-text` | корень | text | — | `var(--rise-text-highlighted)` |
## BaseInputNumber

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-input-number-button-bg` | button | bg | — | `transparent` |
| `--rise-input-number-button-bg-active` | button | bg | active | `var(--rise-bg-elevated)` |
| `--rise-input-number-button-bg-hover` | button | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-input-number-button-icon-size` | button | icon-size | — | `sz(20px)` |
| `--rise-input-number-button-text` | button | text | — | `var(--rise-text-muted)` |
| `--rise-input-number-button-text-disabled` | button | text | disabled | `var(--rise-text-muted)` |
| `--rise-input-number-button-text-hover` | button | text | hover | `var(--rise-text-highlighted)` |
| `--rise-input-number-button-width` | button | width | — | `32px` |

## BaseInputTags

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-input-tags-gap` | корень | gap | — | `4px` |
| `--rise-input-tags-remove-bg-hover` | remove | bg | hover | `var(--rise-bg-accented)` |
| `--rise-input-tags-tag-bg` | tag | bg | — | `var(--rise-bg-elevated)` |
| `--rise-input-tags-tag-border` | tag | border | — | `var(--rise-border)` |
| `--rise-input-tags-tag-height` | tag | height | — | `22px` |
| `--rise-input-tags-tag-padding-x` | tag | padding-x | — | `8px` |
| `--rise-input-tags-tag-radius` | tag | radius | — | `var(--rise-radius-sm)` |
| `--rise-input-tags-tag-text` | tag | text | — | `var(--rise-text-highlighted)` |

## BaseMention

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-mention-bg` | корень | bg | — | `var(--rise-input-bg, var(--rise-bg))` |
| `--rise-mention-border` | корень | border | — | `var(--rise-input-border, var(--rise-border-accented))` |
| `--rise-mention-border-focus` | корень | border | focus | `var(--rise-input-border-focus, var(--rise-primary))` |
| `--rise-mention-option-bg-hover` | option | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-mention-option-text` | option | text | — | `var(--rise-text)` |
| `--rise-mention-padding-x` | корень | padding-x | — | `var(--rise-control-padding-x)` |
| `--rise-mention-padding-y` | корень | padding-y | — | `var(--rise-control-padding-y)` |
| `--rise-mention-popup-bg` | popup | bg | — | `var(--rise-bg)` |
| `--rise-mention-popup-radius` | popup | radius | — | `var(--rise-radius-md)` |
| `--rise-mention-popup-shadow` | popup | shadow | — | `var(--rise-shadow-lg)` |
| `--rise-mention-radius` | корень | radius | — | `var(--rise-input-radius, var(--rise-control-radius))` |
| `--rise-mention-text` | корень | text | — | `var(--rise-text-highlighted)` |

## BasePhoneInput

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-phone-input-country-border` | country | border | — | `var(--rise-border)` |
| `--rise-phone-input-flag-radius` | flag | radius | — | `2px` |
| `--rise-phone-input-flag-shadow` | flag | shadow | — | `0 0 0 1px color-mix(in srgb, var(--rise-text) 14%, transparent)` |
| `--rise-phone-input-list-gap` | list | gap | — | `1px` |
| `--rise-phone-input-option-bg-hover` | option | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-phone-input-option-bg-selected` | option | bg | selected | `transparent` |
| `--rise-phone-input-option-padding-x` | option | padding-x | — | `8px` |
| `--rise-phone-input-option-padding-y` | option | padding-y | — | `6px` |
| `--rise-phone-input-option-text` | option | text | — | `var(--rise-text)` |
| `--rise-phone-input-option-text-selected` | option | text | selected | `var(--rise-text-highlighted)` |
| `--rise-phone-input-trigger-bg-hover` | trigger | bg | hover | `color-mix(in srgb, var(--rise-bg-elevated) 70%, transparent)` |

## BasePin

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-pin-bg` | корень | bg | — | `var(--rise-input-bg, var(--rise-bg))` |
| `--rise-pin-border` | корень | border | — | `var(--rise-input-border, var(--rise-border-accented))` |
| `--rise-pin-border-checked` | корень | border | checked | `ct(pin, border, var(--rise-border-accented))` |
| `--rise-pin-border-focus` | корень | border | focus | `var(--rise-input-border-focus, var(--rise-primary))` |
| `--rise-pin-font-size` | корень | font-size | — | `var(--rise-control-font-size)` |
| `--rise-pin-font-weight` | корень | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-pin-gap` | корень | gap | — | `6px` |
| `--rise-pin-height` | корень | height | — | `32px` |
| `--rise-pin-radius` | корень | radius | — | `var(--rise-input-radius, var(--rise-control-radius))` |
| `--rise-pin-text` | корень | text | — | `var(--rise-text-highlighted)` |
| `--rise-pin-width` | корень | width | — | `32px` |

## BaseSearch

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-search-icon-text` | icon | text | — | `var(--rise-text-muted)` |
| `--rise-search-match-bg` | match | bg | — | `var(--rise-primary-soft)` |
| `--rise-search-overlay-bg` | overlay | bg | — | `var(--rise-overlay)` |
| `--rise-search-panel-bg` | panel | bg | — | `var(--rise-bg)` |
| `--rise-search-panel-border` | panel | border | — | `var(--rise-border)` |
| `--rise-search-panel-padding` | panel | padding | — | `4px` |
| `--rise-search-panel-radius` | panel | radius | — | `var(--rise-radius-lg)` |
| `--rise-search-panel-shadow` | panel | shadow | — | `var(--rise-shadow-xl)` |
| `--rise-search-result-bg-hover` | result | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-search-result-bg-selected` | result | bg | selected | `var(--rise-bg-elevated)` |
| `--rise-search-result-gap` | result | gap | — | `8px` |
| `--rise-search-result-text` | result | text | — | `var(--rise-text)` |

## BaseSelect

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-select-bg` | корень | bg | — | `var(--rise-input-bg, var(--rise-bg))` |
| `--rise-select-border` | корень | border | — | `var(--rise-input-border, var(--rise-border-accented))` |
| `--rise-select-border-focus` | корень | border | focus | `var(--rise-input-border-focus, var(--rise-primary))` |
| `--rise-select-option-bg-hover` | option | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-select-option-bg-selected` | option | bg | selected | `transparent` |
| `--rise-select-option-padding-x` | option | padding-x | — | `8px` |
| `--rise-select-option-padding-y` | option | padding-y | — | `6px` |
| `--rise-select-option-text-selected` | option | text | selected | `var(--rise-text-highlighted)` |
| `--rise-select-padding-x` | корень | padding-x | — | `var(--rise-control-padding-x)` |
| `--rise-select-padding-y` | корень | padding-y | — | `var(--rise-control-padding-y)` |
| `--rise-select-radius` | корень | radius | — | `var(--rise-input-radius, var(--rise-control-radius))` |
| `--rise-select-tag-bg` | tag | bg | — | `var(--rise-primary-soft)` |
| `--rise-select-tag-text` | tag | text | — | `var(--rise-primary-text)` |
| `--rise-select-text` | корень | text | — | `var(--rise-text-highlighted)` |

## BaseTextarea

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-textarea-bg` | корень | bg | — | `var(--rise-input-bg, var(--rise-bg))` |
| `--rise-textarea-border` | корень | border | — | `var(--rise-input-border, var(--rise-border-accented))` |
| `--rise-textarea-border-focus` | корень | border | focus | `var(--rise-input-border-focus, var(--rise-primary))` |
| `--rise-textarea-counter-text` | counter | text | — | `var(--rise-text-muted)` |
| `--rise-textarea-padding-x` | корень | padding-x | — | `var(--rise-control-padding-x)` |
| `--rise-textarea-padding-y` | корень | padding-y | — | `var(--rise-control-padding-y)` |
| `--rise-textarea-radius` | корень | radius | — | `var(--rise-input-radius, var(--rise-control-radius))` |
| `--rise-textarea-text` | корень | text | — | `var(--rise-text-highlighted)` |
