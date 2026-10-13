# Токены компонентов

Сгенерировано `node scripts/check-component-tokens.mjs --write` из `src/components/*/styles`. Не править руками.

Токены уровня 3 кит только читает (с запасным значением) и нигде не объявляет: задайте их на `:root`, в теме
или на контейнере — правило имён и порядок силы в DESIGN_SYSTEM.md, §1.

## BaseAccordion

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-accordion-bg` | корень | bg | — | `transparent` |
| `--rise-accordion-border` | корень | border | — | `var(--rise-border)` |
| `--rise-accordion-content-text` | content | text | — | `var(--rise-text-muted)` |
| `--rise-accordion-gap` | корень | gap | — | `8px` |
| `--rise-accordion-header-bg-hover` | header | bg | hover | `transparent` |
| `--rise-accordion-header-font-size` | header | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-accordion-header-font-weight` | header | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-accordion-header-padding-x` | header | padding-x | — | `0px` |
| `--rise-accordion-header-padding-y` | header | padding-y | — | `14px` |
| `--rise-accordion-header-text` | header | text | — | `var(--rise-text-highlighted)` |
| `--rise-accordion-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-accordion-shadow` | корень | shadow | — | `var(--rise-shadow-sm)` |

## BaseAffix

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-affix-shadow` | корень | shadow | — | `var(--rise-shadow-md)` |

## BaseAiMessage

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-ai-message-avatar-bg` | avatar | bg | — | `linear-gradient(
				135deg,
				var(--rise-primary),
				color-mix(in oklab, var(--rise-primary) 60%, var(--rise-ai-message-avatar-end-bg, var(--rise-info)))
			)` |
| `--rise-ai-message-avatar-end-bg` | avatar-end | bg | — | `var(--rise-info)` |
| `--rise-ai-message-avatar-radius` | avatar | radius | — | `10px` |
| `--rise-ai-message-body-bg` | body | bg | — | `var(--rise-bg-elevated)` |
| `--rise-ai-message-body-border` | body | border | — | `var(--rise-border-accented)` |
| `--rise-ai-message-body-padding-x` | body | padding-x | — | `16px` |
| `--rise-ai-message-body-padding-y` | body | padding-y | — | `12px` |
| `--rise-ai-message-body-radius` | body | radius | — | `var(--rise-radius-lg)` |
| `--rise-ai-message-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-ai-message-gap` | корень | gap | — | `12px` |
| `--rise-ai-message-name-font-weight` | name | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-ai-message-name-text` | name | text | — | `var(--rise-text-highlighted)` |
| `--rise-ai-message-text` | корень | text | — | `var(--rise-text)` |

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

## BaseAnchor

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-anchor-border` | корень | border | — | `var(--rise-border)` |
| `--rise-anchor-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-anchor-font-weight-active` | корень | font-weight | active | `var(--rise-font-weight-medium)` |
| `--rise-anchor-gap` | корень | gap | — | `2px` |
| `--rise-anchor-horizontal-gap` | horizontal | gap | — | `4px` |
| `--rise-anchor-horizontal-padding-x` | horizontal | padding-x | — | `10px` |
| `--rise-anchor-horizontal-padding-y` | horizontal | padding-y | — | `6px` |
| `--rise-anchor-indicator-bg` | indicator | bg | — | `var(--rise-primary)` |
| `--rise-anchor-padding-x` | корень | padding-x | — | `8px` |
| `--rise-anchor-padding-y` | корень | padding-y | — | `4px` |
| `--rise-anchor-radius` | корень | radius | — | `var(--rise-radius-sm)` |
| `--rise-anchor-soft-indicator-bg` | soft-indicator | bg | — | `var(--rise-primary-soft)` |
| `--rise-anchor-text` | корень | text | — | `var(--rise-text-muted)` |
| `--rise-anchor-text-active` | корень | text | active | `var(--rise-primary-text)` |
| `--rise-anchor-text-hover` | корень | text | hover | `var(--rise-text)` |

## BaseApp

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-app-loading-bar-bg` | loading-bar | bg | — | `var(--rise-primary)` |
| `--rise-app-loading-bar-height` | loading-bar | height | — | `3px` |

## BaseAudioPlayer

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-audio-player-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-audio-player-border` | корень | border | — | `var(--rise-border)` |
| `--rise-audio-player-button-radius` | button | radius | — | `var(--rise-radius-full)` |
| `--rise-audio-player-cue-bg-selected` | cue | bg | selected | `var(--rise-primary-soft)` |
| `--rise-audio-player-cue-border-selected` | cue | border | selected | `var(--rise-primary)` |
| `--rise-audio-player-cue-radius` | cue | radius | — | `var(--rise-radius-md)` |
| `--rise-audio-player-gap` | корень | gap | — | `10px` |
| `--rise-audio-player-padding-x` | корень | padding-x | — | `12px` |
| `--rise-audio-player-padding-y` | корень | padding-y | — | `8px` |
| `--rise-audio-player-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-audio-player-text` | корень | text | — | `var(--rise-text)` |
| `--rise-audio-player-title-font-weight` | title | font-weight | — | `var(--rise-font-weight-medium)` |

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

## BaseAvatarCropper

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-avatar-cropper-area-bg` | area | bg | — | `var(--rise-bg-accented)` |
| `--rise-avatar-cropper-area-border` | area | border | — | `var(--rise-border-accented)` |
| `--rise-avatar-cropper-area-radius` | area | radius | — | `var(--rise-radius-lg)` |
| `--rise-avatar-cropper-frame-border` | frame | border | — | `rgb(255 255 255 / 90%)` |
| `--rise-avatar-cropper-frame-radius` | frame | radius | — | `var(--rise-radius-md)` |
| `--rise-avatar-cropper-frame-shadow` | frame | shadow | — | `0 0 0 100vmax rgb(0 0 0 / 55%)` |
| `--rise-avatar-cropper-gap` | корень | gap | — | `sz(12px)` |
| `--rise-avatar-cropper-message-bg` | message | bg | — | `var(--rise-bg)` |
| `--rise-avatar-cropper-message-text` | message | text | — | `var(--rise-text)` |
| `--rise-avatar-cropper-zoom-gap` | zoom | gap | — | `sz(16px)` |

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

## BaseBanner

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-banner-bg` | корень | bg | — | `var(--banner-role)` |
| `--rise-banner-border` | корень | border | — | `transparent` |
| `--rise-banner-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-banner-gap` | корень | gap | — | `12px` |
| `--rise-banner-padding-x` | корень | padding-x | — | `16px` |
| `--rise-banner-padding-y` | корень | padding-y | — | `10px` |
| `--rise-banner-shadow` | корень | shadow | — | `none` |
| `--rise-banner-text` | корень | text | — | `var(--banner-on-role)` |

## BaseBottomNav

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-bottom-nav-bar-radius` | bar | radius | — | `var(--rise-radius-2xl)` |
| `--rise-bottom-nav-bar-shadow` | bar | shadow | — | `var(--rise-shadow-lg)` |
| `--rise-bottom-nav-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-bottom-nav-border` | корень | border | — | `var(--rise-border)` |
| `--rise-bottom-nav-font-size` | корень | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-bottom-nav-font-weight-active` | корень | font-weight | active | `var(--rise-font-weight-semibold)` |
| `--rise-bottom-nav-gap` | корень | gap | — | `4px` |
| `--rise-bottom-nav-height` | корень | height | — | `56px` |
| `--rise-bottom-nav-indicator-bg` | indicator | bg | — | `var(--bottom-nav-indicator)` |
| `--rise-bottom-nav-outline-border` | outline | border | — | `var(--rise-border-accented)` |
| `--rise-bottom-nav-text` | корень | text | — | `var(--rise-text-toned)` |
| `--rise-bottom-nav-text-active` | корень | text | active | `var(--rise-text-highlighted)` |
| `--rise-bottom-nav-text-hover` | корень | text | hover | `var(--rise-text)` |

## BaseBreadcrumbs

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-breadcrumbs-bg` | корень | bg | — | `transparent` |
| `--rise-breadcrumbs-border` | корень | border | — | `var(--rise-border)` |
| `--rise-breadcrumbs-current-text` | current | text | — | `var(--rise-text-highlighted)` |
| `--rise-breadcrumbs-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-breadcrumbs-font-weight` | корень | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-breadcrumbs-gap` | корень | gap | — | `6px` |
| `--rise-breadcrumbs-padding-x` | корень | padding-x | — | `12px` |
| `--rise-breadcrumbs-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-breadcrumbs-sep-text` | sep | text | — | `var(--rise-text-dimmed)` |
| `--rise-breadcrumbs-shadow` | корень | shadow | — | `var(--rise-shadow-sm)` |
| `--rise-breadcrumbs-text` | корень | text | — | `var(--rise-text-muted)` |
| `--rise-breadcrumbs-text-hover` | корень | text | hover | `var(--rise-text)` |

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

## BaseCalendar

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-calendar-day-bg-hover` | day | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-calendar-day-bg-selected` | day | bg | selected | `var(--rise-primary)` |
| `--rise-calendar-day-height` | day | height | — | `32px` |
| `--rise-calendar-day-radius` | day | radius | — | `var(--rise-radius-full)` |
| `--rise-calendar-day-ring` | day | ring | — | `transparent` |
| `--rise-calendar-day-text-selected` | day | text | selected | `var(--rise-on-primary)` |
| `--rise-calendar-header-font-weight` | header | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-calendar-header-text` | header | text | — | `var(--rise-text-highlighted)` |
| `--rise-calendar-padding` | корень | padding | — | `12px` |

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

## BaseCascader

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-cascader-bg` | корень | bg | — | `var(--rise-input-bg, var(--rise-bg))` |
| `--rise-cascader-border` | корень | border | — | `var(--rise-input-border, var(--rise-border-accented))` |
| `--rise-cascader-border-focus` | корень | border | focus | `var(--rise-input-border-focus, var(--rise-primary))` |
| `--rise-cascader-checkbox-bg-checked` | checkbox | bg | checked | `var(--rise-primary)` |
| `--rise-cascader-column-width` | column | width | — | `200px` |
| `--rise-cascader-option-bg-active` | option | bg | active | `var(--rise-bg-elevated)` |
| `--rise-cascader-option-bg-open` | option | bg | open | `var(--rise-bg-elevated)` |
| `--rise-cascader-option-font-weight-selected` | option | font-weight | selected | `var(--rise-font-weight-medium)` |
| `--rise-cascader-padding-x` | корень | padding-x | — | `var(--rise-control-padding-x)` |
| `--rise-cascader-padding-y` | корень | padding-y | — | `var(--rise-control-padding-y)` |
| `--rise-cascader-radius` | корень | radius | — | `var(--rise-input-radius, var(--rise-control-radius))` |
| `--rise-cascader-text` | корень | text | — | `var(--rise-text-highlighted)` |

## BaseChart

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-chart-axis-font-size` | axis | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-chart-axis-text` | axis | text | — | `var(--rise-text-muted)` |
| `--rise-chart-grid-border` | grid | border | — | `var(--rise-border-muted)` |
| `--rise-chart-legend-gap` | legend | gap | — | `space(4px 12px)` |
| `--rise-chart-legend-text` | legend | text | — | `var(--rise-text)` |
| `--rise-chart-tooltip-bg` | tooltip | bg | — | `var(--rise-bg)` |
| `--rise-chart-tooltip-border` | tooltip | border | — | `var(--rise-border)` |
| `--rise-chart-tooltip-padding-x` | tooltip | padding-x | — | `10px` |
| `--rise-chart-tooltip-padding-y` | tooltip | padding-y | — | `6px` |
| `--rise-chart-tooltip-radius` | tooltip | radius | — | `var(--rise-radius-md)` |
| `--rise-chart-tooltip-shadow` | tooltip | shadow | — | `var(--rise-shadow-md)` |
| `--rise-chart-tooltip-text` | tooltip | text | — | `var(--rise-text-highlighted)` |

## BaseChat

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-chat-bg` | корень | bg | — | `transparent` |
| `--rise-chat-bubble-bg` | bubble | bg | — | `var(--rise-bg-elevated)` |
| `--rise-chat-bubble-border` | bubble | border | — | `transparent` |
| `--rise-chat-bubble-me-bg` | bubble-me | bg | — | `var(--rise-primary-soft)` |
| `--rise-chat-bubble-padding-x` | bubble | padding-x | — | `12px` |
| `--rise-chat-bubble-padding-y` | bubble | padding-y | — | `8px` |
| `--rise-chat-bubble-radius` | bubble | radius | — | `var(--rise-radius-lg)` |
| `--rise-chat-bubble-shadow` | bubble | shadow | — | `none` |
| `--rise-chat-bubble-text` | bubble | text | — | `var(--rise-text)` |
| `--rise-chat-list-gap` | list | gap | — | `4px` |
| `--rise-chat-list-padding-x` | list | padding-x | — | `8px` |
| `--rise-chat-list-padding-y` | list | padding-y | — | `12px` |

## BaseCheckbox

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-checkbox-box-bg` | box | bg | — | `var(--rise-bg)` |
| `--rise-checkbox-box-bg-checked` | box | bg | checked | `var(--rise-primary)` |
| `--rise-checkbox-box-bg-hover` | box | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-checkbox-box-border` | box | border | — | `var(--rise-border-accented)` |
| `--rise-checkbox-box-border-checked` | box | border | checked | `var(--rise-primary)` |
| `--rise-checkbox-box-radius` | box | radius | — | `var(--rise-radius-sm)` |
| `--rise-checkbox-box-ring` | box | ring | — | `var(--rise-focus-ring)` |
| `--rise-checkbox-box-shadow` | box | shadow | — | `none` |
| `--rise-checkbox-icon-text` | icon | text | — | `var(--rise-on-primary)` |
| `--rise-checkbox-label-text` | label | text | — | `var(--rise-text)` |
| `--rise-checkbox-label-wrapper-gap` | label-wrapper | gap | — | `8px` |

## BaseCheckboxGroup

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-checkbox-group-error-text` | error | text | — | `var(--rise-error)` |
| `--rise-checkbox-group-gap` | корень | gap | — | `6px` |
| `--rise-checkbox-group-label-text` | label | text | — | `var(--rise-text)` |
| `--rise-checkbox-group-options-gap` | options | gap | — | `8px` |

## BaseChecklist

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-checklist-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-checklist-border` | корень | border | — | `var(--rise-border)` |
| `--rise-checklist-gap` | корень | gap | — | `12px` |
| `--rise-checklist-item-bg-active` | item | bg | active | `var(--rise-primary-soft)` |
| `--rise-checklist-item-radius` | item | radius | — | `var(--rise-radius-md)` |
| `--rise-checklist-label-text` | label | text | — | `var(--rise-text-highlighted)` |
| `--rise-checklist-label-text-checked` | label | text | checked | `var(--rise-text-muted)` |
| `--rise-checklist-padding-x` | корень | padding-x | — | `16px` |
| `--rise-checklist-padding-y` | корень | padding-y | — | `16px` |
| `--rise-checklist-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-checklist-text` | корень | text | — | `var(--rise-text)` |
| `--rise-checklist-title-font-weight` | title | font-weight | — | `var(--rise-font-weight-semibold)` |

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

## BaseCode

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-code-bg` | корень | bg | — | `var(--rise-bg-muted)` |
| `--rise-code-border` | корень | border | — | `var(--rise-border)` |
| `--rise-code-copy-radius` | copy | radius | — | `var(--rise-radius-sm)` |
| `--rise-code-copy-text` | copy | text | — | `var(--rise-text-toned)` |
| `--rise-code-font-size` | корень | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-code-header-bg` | header | bg | — | `transparent` |
| `--rise-code-header-height` | header | height | — | `32px` |
| `--rise-code-header-text` | header | text | — | `var(--rise-text-toned)` |
| `--rise-code-padding-x` | корень | padding-x | — | `16px` |
| `--rise-code-padding-y` | корень | padding-y | — | `12px` |
| `--rise-code-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-code-text` | корень | text | — | `var(--rise-text-highlighted)` |

## BaseColorModeButton

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-color-mode-button-padding` | корень | padding | — | `7px` |
| `--rise-color-mode-button-ring` | корень | ring | — | `var(--rise-focus-ring)` |
| `--rise-color-mode-button-text` | корень | text | — | `currentcolor` |
| `--rise-color-mode-button-text-hover` | корень | text | hover | `ct(color-mode-button, text, currentcolor)` |

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

## BaseCommandPalette

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-command-palette-content-width` | content | width | — | `640px` |
| `--rise-command-palette-footer-font-size` | footer | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-command-palette-group-title-font-size` | group-title | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-command-palette-group-title-text` | group-title | text | — | `var(--rise-text-muted)` |
| `--rise-command-palette-input-font-size` | input | font-size | — | `var(--rise-font-size-md)` |
| `--rise-command-palette-input-height` | input | height | — | `52px` |
| `--rise-command-palette-option-bg-selected` | option | bg | selected | `var(--rise-bg-elevated)` |
| `--rise-command-palette-option-padding-x` | option | padding-x | — | `8px` |
| `--rise-command-palette-option-padding-y` | option | padding-y | — | `6px` |
| `--rise-command-palette-option-radius` | option | radius | — | `var(--rise-radius-md)` |
| `--rise-command-palette-option-text-selected` | option | text | selected | `var(--rise-text-highlighted)` |

## BaseCommentThread

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-comment-thread-author-font-weight` | author | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-comment-thread-author-text` | author | text | — | `var(--rise-text-highlighted)` |
| `--rise-comment-thread-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-comment-thread-border` | корень | border | — | `var(--rise-border)` |
| `--rise-comment-thread-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-comment-thread-gap` | корень | gap | — | `16px` |
| `--rise-comment-thread-like-text-checked` | like | text | checked | `var(--rise-primary-text)` |
| `--rise-comment-thread-padding` | корень | padding | — | `16px` |
| `--rise-comment-thread-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-comment-thread-shadow` | корень | shadow | — | `none` |
| `--rise-comment-thread-text` | корень | text | — | `var(--rise-text)` |
| `--rise-comment-thread-time-text` | time | text | — | `var(--rise-text-toned)` |

## BaseConfirm

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-confirm-description-font-size` | description | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-confirm-description-text` | description | text | — | `var(--rise-text-muted)` |
| `--rise-confirm-width` | корень | width | — | `400px` |

## BaseContainer

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-container-padding-x` | корень | padding-x | — | `16px` |
| `--rise-container-width` | корень | width | — | `640px` |

## BaseContextMenu

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-context-menu-item-bg-hover` | item | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-context-menu-item-font-size` | item | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-context-menu-item-icon-size` | item | icon-size | — | `16px` |
| `--rise-context-menu-item-padding-x` | item | padding-x | — | `8px` |
| `--rise-context-menu-item-padding-y` | item | padding-y | — | `6px` |
| `--rise-context-menu-item-radius` | item | radius | — | `var(--rise-radius-md)` |
| `--rise-context-menu-item-text` | item | text | — | `var(--rise-text)` |
| `--rise-context-menu-label-text` | label | text | — | `var(--rise-text-muted)` |
| `--rise-context-menu-panel-width` | panel | width | — | `180px` |
| `--rise-context-menu-separator-border` | separator | border | — | `var(--rise-border)` |
| `--rise-context-menu-shortcut-text` | shortcut | text | — | `var(--rise-text-muted)` |

## BaseCookieConsent

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-cookie-consent-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-cookie-consent-border` | корень | border | — | `var(--rise-border)` |
| `--rise-cookie-consent-gap` | корень | gap | — | `16px` |
| `--rise-cookie-consent-padding-x` | корень | padding-x | — | `20px` |
| `--rise-cookie-consent-padding-y` | корень | padding-y | — | `16px` |
| `--rise-cookie-consent-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-cookie-consent-shadow` | корень | shadow | — | `var(--rise-shadow-lg)` |
| `--rise-cookie-consent-text` | корень | text | — | `var(--rise-text-muted)` |
| `--rise-cookie-consent-title-font-size` | title | font-size | — | `var(--rise-font-size-base)` |
| `--rise-cookie-consent-title-text` | title | text | — | `var(--rise-text-highlighted)` |

## BaseCountdown

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-countdown-caption-text` | caption | text | — | `var(--rise-text-muted)` |
| `--rise-countdown-clock-font-size` | clock | font-size | — | `var(--rise-font-size-lg)` |
| `--rise-countdown-gap` | корень | gap | — | `8px` |
| `--rise-countdown-text` | корень | text | — | `var(--rise-text)` |
| `--rise-countdown-unit-bg` | unit | bg | — | `var(--rise-bg)` |
| `--rise-countdown-unit-border` | unit | border | — | `var(--rise-border)` |
| `--rise-countdown-unit-padding-x` | unit | padding-x | — | `10px` |
| `--rise-countdown-unit-padding-y` | unit | padding-y | — | `8px` |
| `--rise-countdown-unit-radius` | unit | radius | — | `var(--rise-radius-md)` |
| `--rise-countdown-value-font-size` | value | font-size | — | `var(--rise-font-size-2xl)` |
| `--rise-countdown-value-font-weight` | value | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-countdown-value-text` | value | text | — | `var(--rise-text-highlighted)` |

## BaseCryptoProSign

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-crypto-pro-sign-actions-gap` | actions | gap | — | `sz(8px)` |
| `--rise-crypto-pro-sign-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-crypto-pro-sign-border` | корень | border | — | `var(--rise-border)` |
| `--rise-crypto-pro-sign-gap` | корень | gap | — | `space(16px)` |
| `--rise-crypto-pro-sign-padding` | корень | padding | — | `space(16px)` |
| `--rise-crypto-pro-sign-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-crypto-pro-sign-result-gap` | result | gap | — | `sz(10px)` |
| `--rise-crypto-pro-sign-result-padding` | result | padding | — | `space(12px)` |
| `--rise-crypto-pro-sign-result-radius` | result | radius | — | `var(--rise-radius-md)` |
| `--rise-crypto-pro-sign-text` | корень | text | — | `var(--rise-text)` |

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

## BaseDescriptions

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-descriptions-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-descriptions-border` | корень | border | — | `var(--rise-border)` |
| `--rise-descriptions-gap` | корень | gap | — | `12px` |
| `--rise-descriptions-label-bg` | label | bg | — | `transparent` |
| `--rise-descriptions-label-font-weight` | label | font-weight | — | `inherit` |
| `--rise-descriptions-label-text` | label | text | — | `var(--rise-text-toned)` |
| `--rise-descriptions-padding-x` | корень | padding-x | — | `16px` |
| `--rise-descriptions-padding-y` | корень | padding-y | — | `16px` |
| `--rise-descriptions-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-descriptions-text` | корень | text | — | `var(--rise-text)` |
| `--rise-descriptions-value-font-weight` | value | font-weight | — | `inherit` |
| `--rise-descriptions-value-text` | value | text | — | `var(--rise-text-highlighted)` |

## BaseDrawer

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-drawer-bg` | корень | bg | — | `var(--rise-overlay)` |
| `--rise-drawer-description-text` | description | text | — | `var(--rise-text-muted)` |
| `--rise-drawer-handle-bg` | handle | bg | — | `var(--rise-border-accented)` |
| `--rise-drawer-panel-bg` | panel | bg | — | `var(--rise-bg)` |
| `--rise-drawer-panel-border` | panel | border | — | `var(--rise-border)` |
| `--rise-drawer-panel-padding-x` | panel | padding-x | — | `20px` |
| `--rise-drawer-panel-radius` | panel | radius | — | `var(--rise-radius-2xl)` |
| `--rise-drawer-panel-shadow` | panel | shadow | — | `var(--rise-shadow-xl)` |
| `--rise-drawer-panel-text` | panel | text | — | `var(--rise-text)` |
| `--rise-drawer-panel-width` | panel | width | — | `360px` |
| `--rise-drawer-title-font-size` | title | font-size | — | `var(--rise-font-size-md)` |

## BaseDropdown

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-dropdown-panel-bg` | panel | bg | — | `var(--rise-bg)` |
| `--rise-dropdown-panel-border` | panel | border | — | `var(--rise-border)` |
| `--rise-dropdown-panel-padding` | panel | padding | — | `4px` |
| `--rise-dropdown-panel-radius` | panel | radius | — | `var(--rise-radius-md)` |
| `--rise-dropdown-panel-shadow` | panel | shadow | — | `var(--rise-shadow-lg)` |
| `--rise-dropdown-panel-text` | panel | text | — | `var(--rise-text)` |
| `--rise-dropdown-panel-width` | panel | width | — | `128px` |

## BaseDropdownMenu

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-dropdown-menu-item-bg-hover` | item | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-dropdown-menu-item-font-size` | item | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-dropdown-menu-item-icon-size` | item | icon-size | — | `16px` |
| `--rise-dropdown-menu-item-padding-x` | item | padding-x | — | `8px` |
| `--rise-dropdown-menu-item-padding-y` | item | padding-y | — | `6px` |
| `--rise-dropdown-menu-item-radius` | item | radius | — | `var(--rise-radius-md)` |
| `--rise-dropdown-menu-item-text` | item | text | — | `var(--rise-text)` |
| `--rise-dropdown-menu-label-text` | label | text | — | `var(--rise-text-muted)` |
| `--rise-dropdown-menu-panel-width` | panel | width | — | `180px` |
| `--rise-dropdown-menu-separator-border` | separator | border | — | `var(--rise-border)` |
| `--rise-dropdown-menu-shortcut-text` | shortcut | text | — | `var(--rise-text-muted)` |

## BaseEditor

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-editor-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-editor-border` | корень | border | — | `var(--rise-border-accented)` |
| `--rise-editor-border-focus` | корень | border | focus | `var(--rise-primary)` |
| `--rise-editor-content-padding-x` | content | padding-x | — | `16px` |
| `--rise-editor-content-padding-y` | content | padding-y | — | `12px` |
| `--rise-editor-radius` | корень | radius | — | `var(--rise-control-radius)` |
| `--rise-editor-shadow` | корень | shadow | — | `none` |
| `--rise-editor-text` | корень | text | — | `var(--rise-text)` |
| `--rise-editor-toolbar-bg` | toolbar | bg | — | `transparent` |
| `--rise-editor-toolbar-border` | toolbar | border | — | `var(--rise-border)` |
| `--rise-editor-toolbar-padding-x` | toolbar | padding-x | — | `10px` |
| `--rise-editor-toolbar-padding-y` | toolbar | padding-y | — | `6px` |

## BaseEmojiPicker

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-emoji-picker-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-emoji-picker-border` | корень | border | — | `var(--rise-border)` |
| `--rise-emoji-picker-emoji-bg-hover` | emoji | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-emoji-picker-emoji-font-size` | emoji | font-size | — | `22px` |
| `--rise-emoji-picker-emoji-radius` | emoji | radius | — | `var(--rise-radius-md)` |
| `--rise-emoji-picker-heading-text` | heading | text | — | `var(--rise-text-muted)` |
| `--rise-emoji-picker-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-emoji-picker-tab-bg-hover` | tab | bg | hover | `var(--rise-bg-muted)` |
| `--rise-emoji-picker-tab-border-selected` | tab | border | selected | `var(--rise-primary)` |
| `--rise-emoji-picker-text` | корень | text | — | `var(--rise-text)` |

## BaseEmpty

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-empty-bg` | корень | bg | — | `transparent` |
| `--rise-empty-border` | корень | border | — | `var(--rise-border-accented)` |
| `--rise-empty-description-font-size` | description | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-empty-gap` | корень | gap | — | `16px` |
| `--rise-empty-icon-size` | корень | icon-size | — | `sz(20px)` |
| `--rise-empty-icon-text` | icon | text | — | `var(--rise-text-dimmed)` |
| `--rise-empty-padding-x` | корень | padding-x | — | `24px` |
| `--rise-empty-padding-y` | корень | padding-y | — | `32px` |
| `--rise-empty-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-empty-text` | корень | text | — | `var(--rise-text-muted)` |
| `--rise-empty-title-font-size` | title | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-empty-title-text` | title | text | — | `var(--rise-text-highlighted)` |

## BaseEventCalendar

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-event-calendar-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-event-calendar-border` | корень | border | — | `var(--rise-border)` |
| `--rise-event-calendar-cell-bg-hover` | cell | bg | hover | `transparent` |
| `--rise-event-calendar-cell-border` | cell | border | — | `var(--rise-border-muted)` |
| `--rise-event-calendar-cell-padding-y` | cell | padding-y | — | `4px` |
| `--rise-event-calendar-event-font-size` | event | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-event-calendar-event-padding-x` | event | padding-x | — | `6px` |
| `--rise-event-calendar-event-radius` | event | radius | — | `var(--rise-radius-sm)` |
| `--rise-event-calendar-header-bg` | header | bg | — | `transparent` |
| `--rise-event-calendar-header-text` | header | text | — | `var(--rise-text-toned)` |
| `--rise-event-calendar-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-event-calendar-today-bg` | today | bg | — | `var(--rise-primary)` |

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

## BaseFileUpload

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-file-upload-dropzone-bg` | dropzone | bg | — | `var(--rise-bg)` |
| `--rise-file-upload-dropzone-bg-hover` | dropzone | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-file-upload-dropzone-border` | dropzone | border | — | `var(--rise-border-accented)` |
| `--rise-file-upload-dropzone-padding-x` | dropzone | padding-x | — | `16px` |
| `--rise-file-upload-dropzone-padding-y` | dropzone | padding-y | — | `24px` |
| `--rise-file-upload-dropzone-radius` | dropzone | radius | — | `var(--rise-radius-lg)` |
| `--rise-file-upload-gap` | корень | gap | — | `8px` |
| `--rise-file-upload-item-bg` | item | bg | — | `var(--rise-bg)` |
| `--rise-file-upload-item-border` | item | border | — | `var(--rise-border)` |
| `--rise-file-upload-item-padding` | item | padding | — | `8px` |
| `--rise-file-upload-item-radius` | item | radius | — | `var(--rise-radius-md)` |

## BaseFilterBuilder

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-filter-builder-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-filter-builder-border` | корень | border | — | `var(--rise-border)` |
| `--rise-filter-builder-field-bg` | field | bg | — | `var(--rise-input-bg, var(--rise-bg))` |
| `--rise-filter-builder-field-border` | field | border | — | `var(--rise-input-border, var(--rise-border-accented))` |
| `--rise-filter-builder-field-border-focus` | field | border | focus | `var(--rise-input-border-focus, var(--rise-primary))` |
| `--rise-filter-builder-field-radius` | field | radius | — | `var(--rise-input-radius, var(--rise-control-radius))` |
| `--rise-filter-builder-gap` | корень | gap | — | `10px` |
| `--rise-filter-builder-joiner-text` | joiner | text | — | `var(--rise-text-muted)` |
| `--rise-filter-builder-padding-x` | корень | padding-x | — | `12px` |
| `--rise-filter-builder-padding-y` | корень | padding-y | — | `12px` |
| `--rise-filter-builder-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-filter-builder-text` | корень | text | — | `var(--rise-text)` |

## BaseFooter

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-footer-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-footer-border` | корень | border | — | `var(--rise-border)` |
| `--rise-footer-column-title-font-weight` | column-title | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-footer-column-title-text` | column-title | text | — | `var(--rise-text)` |
| `--rise-footer-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-footer-gap` | корень | gap | — | `24px` |
| `--rise-footer-padding-y` | корень | padding-y | — | `24px` |
| `--rise-footer-shadow` | корень | shadow | — | `none` |
| `--rise-footer-text` | корень | text | — | `var(--rise-text-muted)` |

## BaseForm

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-form-bg` | корень | bg | — | `transparent` |
| `--rise-form-border` | корень | border | — | `var(--rise-border)` |
| `--rise-form-overlay-bg` | overlay | bg | — | `color-mix(in srgb, var(--rise-bg) 85%, transparent)` |
| `--rise-form-padding` | корень | padding | — | `20px` |
| `--rise-form-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-form-shadow` | корень | shadow | — | `var(--rise-shadow-sm)` |

## BaseFormField

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-form-field-bg` | корень | bg | — | `transparent` |
| `--rise-form-field-border` | корень | border | — | `var(--rise-border)` |
| `--rise-form-field-description-text` | description | text | — | `var(--rise-text-muted)` |
| `--rise-form-field-error-text` | error | text | — | `var(--rise-error)` |
| `--rise-form-field-gap` | корень | gap | — | `6px` |
| `--rise-form-field-label-font-weight` | label | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-form-field-label-text` | label | text | — | `var(--rise-text)` |
| `--rise-form-field-padding-x` | корень | padding-x | — | `16px` |
| `--rise-form-field-padding-y` | корень | padding-y | — | `12px` |
| `--rise-form-field-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-form-field-shadow` | корень | shadow | — | `var(--rise-shadow-sm)` |

## BaseGrid

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-grid-gap` | корень | gap | — | `$size` |

## BaseHeader

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-header-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-header-border` | корень | border | — | `var(--rise-border)` |
| `--rise-header-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-header-gap` | корень | gap | — | `16px` |
| `--rise-header-height` | корень | height | — | `64px` |
| `--rise-header-shadow` | корень | shadow | — | `none` |
| `--rise-header-text` | корень | text | — | `var(--rise-text)` |
| `--rise-header-title-font-size` | title | font-size | — | `var(--rise-font-size-md)` |
| `--rise-header-title-font-weight` | title | font-weight | — | `var(--rise-font-weight-semibold)` |

## BaseHeatmap

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-heatmap-caption-font-size` | caption | font-size | — | `var(--rise-font-size-2xs)` |
| `--rise-heatmap-caption-text` | caption | text | — | `var(--rise-text-muted)` |
| `--rise-heatmap-cell-bg` | cell | bg | — | `var(--rise-bg-elevated)` |
| `--rise-heatmap-cell-border-active` | cell | border | active | `var(--rise-text-highlighted)` |
| `--rise-heatmap-cell-radius` | cell | radius | — | `2px` |
| `--rise-heatmap-gap` | корень | gap | — | `8px` |
| `--rise-heatmap-mark-bg` | mark | bg | — | `var(--rise-chart-3)` |
| `--rise-heatmap-scroll-radius` | scroll | radius | — | `var(--rise-radius-sm)` |
| `--rise-heatmap-tooltip-text` | tooltip | text | — | `var(--rise-text)` |

## BaseHoverCard

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-hover-card-inner-font-size` | inner | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-hover-card-inner-padding-x` | inner | padding-x | — | `16px` |
| `--rise-hover-card-inner-padding-y` | inner | padding-y | — | `12px` |
| `--rise-hover-card-panel-width` | panel | width | — | `320px` |

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

## BaseImageCompare

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-image-compare-bg` | корень | bg | — | `var(--rise-bg-muted)` |
| `--rise-image-compare-border` | корень | border | — | `var(--rise-border)` |
| `--rise-image-compare-divider-bg` | divider | bg | — | `var(--rise-media-highlight)` |
| `--rise-image-compare-divider-width` | divider | width | — | `2px` |
| `--rise-image-compare-handle-bg` | handle | bg | — | `var(--rise-media-highlight)` |
| `--rise-image-compare-handle-shadow` | handle | shadow | — | `var(--rise-shadow-md)` |
| `--rise-image-compare-handle-text` | handle | text | — | `var(--rise-media-text-inverted)` |
| `--rise-image-compare-label-bg` | label | bg | — | `color-mix(in srgb, var(--rise-media-shade) 65%, transparent)` |
| `--rise-image-compare-label-font-weight` | label | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-image-compare-label-radius` | label | radius | — | `var(--rise-radius-full)` |
| `--rise-image-compare-label-text` | label | text | — | `var(--rise-media-text)` |
| `--rise-image-compare-radius` | корень | radius | — | `var(--rise-radius-lg)` |

## BaseImageMap

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-image-map-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-image-map-border` | корень | border | — | `var(--rise-border)` |
| `--rise-image-map-entry-bg-active` | entry | bg | active | `var(--rise-bg-elevated)` |
| `--rise-image-map-entry-bg-hover` | entry | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-image-map-entry-border-active` | entry | border | active | `var(--rise-primary)` |
| `--rise-image-map-entry-radius` | entry | radius | — | `var(--rise-radius-md)` |
| `--rise-image-map-gap` | корень | gap | — | `8px` |
| `--rise-image-map-hint-bg` | hint | bg | — | `color-mix(in srgb, var(--rise-bg-inverted) 55%, transparent)` |
| `--rise-image-map-hint-text` | hint | text | — | `var(--rise-text-inverted)` |
| `--rise-image-map-label-bg` | label | bg | — | `var(--rise-bg)` |
| `--rise-image-map-padding` | корень | padding | — | `8px` |
| `--rise-image-map-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-image-map-route-step-bg-hover` | route-step | bg | hover | `var(--rise-bg-muted)` |
| `--rise-image-map-route-step-radius` | route-step | radius | — | `var(--rise-radius-md)` |
| `--rise-image-map-text` | корень | text | — | `var(--rise-text)` |
| `--rise-image-map-viewport-bg` | viewport | bg | — | `var(--rise-bg-muted)` |
| `--rise-image-map-viewport-radius` | viewport | radius | — | `var(--rise-radius-md)` |

## BaseImageMapEditor

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-image-map-editor-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-image-map-editor-border` | корень | border | — | `var(--rise-border)` |
| `--rise-image-map-editor-gap` | корень | gap | — | `8px` |
| `--rise-image-map-editor-heading-text` | heading | text | — | `var(--rise-text-highlighted)` |
| `--rise-image-map-editor-item-bg-hover` | item | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-image-map-editor-item-bg-selected` | item | bg | selected | `var(--rise-bg-elevated)` |
| `--rise-image-map-editor-item-border-selected` | item | border | selected | `var(--rise-primary)` |
| `--rise-image-map-editor-padding` | корень | padding | — | `8px` |
| `--rise-image-map-editor-panel-gap` | panel | gap | — | `16px` |
| `--rise-image-map-editor-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-image-map-editor-viewport-bg` | viewport | bg | — | `var(--rise-bg-muted)` |
| `--rise-image-map-editor-viewport-radius` | viewport | radius | — | `var(--rise-radius-md)` |

## BaseInfiniteScroll

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-infinite-scroll-footer-bg` | footer | bg | — | `transparent` |
| `--rise-infinite-scroll-footer-font-size` | footer | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-infinite-scroll-footer-gap` | footer | gap | — | `8px` |
| `--rise-infinite-scroll-footer-height` | footer | height | — | `48px` |
| `--rise-infinite-scroll-footer-padding-y` | footer | padding-y | — | `8px` |
| `--rise-infinite-scroll-footer-text` | footer | text | — | `var(--rise-text-muted)` |

## BaseInplace

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-inplace-display-bg` | display | bg | — | `transparent` |
| `--rise-inplace-display-bg-hover` | display | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-inplace-display-padding-x` | display | padding-x | — | `4px` |
| `--rise-inplace-display-padding-y` | display | padding-y | — | `2px` |
| `--rise-inplace-display-radius` | display | radius | — | `var(--rise-radius-sm)` |
| `--rise-inplace-display-text` | display | text | — | `inherit` |
| `--rise-inplace-field-width` | field | width | — | `160px` |

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

## BaseJsonViewer

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-json-viewer-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-json-viewer-border` | корень | border | — | `var(--rise-border)` |
| `--rise-json-viewer-key-text` | key | text | — | `var(--rise-text-highlighted)` |
| `--rise-json-viewer-padding-x` | корень | padding-x | — | `4px` |
| `--rise-json-viewer-padding-y` | корень | padding-y | — | `4px` |
| `--rise-json-viewer-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-json-viewer-text` | корень | text | — | `var(--rise-text)` |
| `--rise-json-viewer-toolbar-bg` | toolbar | bg | — | `transparent` |
| `--rise-json-viewer-toolbar-gap` | toolbar | gap | — | `4px` |

## BaseKanban

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-kanban-card-bg` | card | bg | — | `var(--rise-bg)` |
| `--rise-kanban-card-border` | card | border | — | `var(--rise-border)` |
| `--rise-kanban-card-radius` | card | radius | — | `var(--rise-radius-md)` |
| `--rise-kanban-card-shadow` | card | shadow | — | `var(--rise-shadow-xs)` |
| `--rise-kanban-column-bg` | column | bg | — | `var(--rise-bg-muted)` |
| `--rise-kanban-column-border` | column | border | — | `var(--rise-border)` |
| `--rise-kanban-column-padding-x` | column | padding-x | — | `8px` |
| `--rise-kanban-column-padding-y` | column | padding-y | — | `8px` |
| `--rise-kanban-column-radius` | column | radius | — | `var(--rise-radius-lg)` |
| `--rise-kanban-gap` | корень | gap | — | `12px` |
| `--rise-kanban-header-font-weight` | header | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-kanban-header-text` | header | text | — | `var(--rise-text-highlighted)` |

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

## BaseLayout

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-layout-bg` | корень | bg | — | `transparent` |
| `--rise-layout-gap` | корень | gap | — | `0` |
| `--rise-layout-sidebar-bg` | sidebar | bg | — | `transparent` |
| `--rise-layout-sidebar-width` | sidebar | width | — | `auto` |
| `--rise-layout-skip-link-bg` | skip-link | bg | — | `var(--rise-primary)` |
| `--rise-layout-skip-link-padding-x` | skip-link | padding-x | — | `16px` |
| `--rise-layout-skip-link-padding-y` | skip-link | padding-y | — | `8px` |
| `--rise-layout-skip-link-radius` | skip-link | radius | — | `var(--rise-radius-md)` |
| `--rise-layout-skip-link-shadow` | skip-link | shadow | — | `var(--rise-shadow-lg)` |
| `--rise-layout-skip-link-text` | skip-link | text | — | `var(--rise-on-primary)` |

## BaseLink

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-link-font-size` | корень | font-size | — | `1em` |
| `--rise-link-font-weight` | корень | font-weight | — | `inherit` |
| `--rise-link-radius` | корень | radius | — | `var(--rise-radius-xs)` |
| `--rise-link-ring` | корень | ring | — | `var(--rise-focus-ring)` |
| `--rise-link-text` | корень | text | — | `var(--rise-primary-text)` |
| `--rise-link-text-hover` | корень | text | hover | `var(--rise-primary-text)` |

## BaseList

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-list-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-list-border` | корень | border | — | `var(--rise-border)` |
| `--rise-list-item-bg-hover` | item | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-list-item-bg-selected` | item | bg | selected | `var(--rise-primary-soft)` |
| `--rise-list-item-gap` | item | gap | — | `10px` |
| `--rise-list-item-height` | item | height | — | `40px` |
| `--rise-list-item-padding-x` | item | padding-x | — | `10px` |
| `--rise-list-item-padding-y` | item | padding-y | — | `8px` |
| `--rise-list-item-radius` | item | radius | — | `var(--rise-radius-sm)` |
| `--rise-list-item-text` | item | text | — | `var(--rise-text)` |
| `--rise-list-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-list-shadow` | корень | shadow | — | `none` |

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

## BaseMap

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-map-balloon-bg` | balloon | bg | — | `var(--rise-bg)` |
| `--rise-map-balloon-border` | balloon | border | — | `var(--rise-border)` |
| `--rise-map-balloon-padding` | balloon | padding | — | `12px` |
| `--rise-map-balloon-radius` | balloon | radius | — | `var(--rise-radius-md)` |
| `--rise-map-balloon-shadow` | balloon | shadow | — | `var(--rise-shadow-md)` |
| `--rise-map-balloon-text` | balloon | text | — | `var(--rise-text)` |
| `--rise-map-balloon-width` | balloon | width | — | `280px` |
| `--rise-map-bg` | корень | bg | — | `var(--rise-bg-muted)` |
| `--rise-map-border` | корень | border | — | `var(--rise-border)` |
| `--rise-map-cluster-bg` | cluster | bg | — | `var(--rise-primary)` |
| `--rise-map-controls-gap` | controls | gap | — | `8px` |
| `--rise-map-marker-bg` | marker | bg | — | `var(--rise-primary)` |
| `--rise-map-marker-border` | marker | border | — | `var(--rise-bg)` |
| `--rise-map-marker-selected-border` | marker-selected | border | — | `var(--rise-border-accented)` |
| `--rise-map-marker-shadow` | marker | shadow | — | `var(--rise-shadow-sm)` |
| `--rise-map-marker-text` | marker | text | — | `var(--rise-text-inverted)` |
| `--rise-map-marker-width` | marker | width | — | `24px` |
| `--rise-map-placeholder-padding` | placeholder | padding | — | `16px` |
| `--rise-map-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-map-text` | корень | text | — | `var(--rise-text)` |
| `--rise-map-tooltip-bg` | tooltip | bg | — | `var(--rise-bg-inverted)` |
| `--rise-map-tooltip-radius` | tooltip | radius | — | `var(--rise-radius-sm)` |
| `--rise-map-tooltip-text` | tooltip | text | — | `var(--rise-text-inverted)` |

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

## BaseMediaPlayer

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-media-player-bg` | корень | bg | — | `var(--rise-media-shade)` |
| `--rise-media-player-dialog-bg` | dialog | bg | — | `var(--rise-media-panel-solid)` |
| `--rise-media-player-episodes-bg` | episodes | bg | — | `var(--rise-media-sheet)` |
| `--rise-media-player-menu-radius` | menu | radius | — | `10px` |
| `--rise-media-player-panel-bg` | panel | bg | — | `var(--rise-media-panel)` |
| `--rise-media-player-progress-bg` | progress | bg | — | `var(--media-primary)` |
| `--rise-media-player-radius` | корень | radius | — | `12px` |
| `--rise-media-player-text` | корень | text | — | `var(--rise-media-text)` |
| `--rise-media-player-thumb-bg` | thumb | bg | — | `var(--media-primary)` |
| `--rise-media-player-title-font-size` | title | font-size | — | `18px` |
| `--rise-media-player-title-font-weight` | title | font-weight | — | `var(--rise-font-weight-bold)` |

## BaseMegaMenu

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-mega-menu-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-mega-menu-border` | корень | border | — | `var(--rise-border)` |
| `--rise-mega-menu-link-bg-hover` | link | bg | hover | `var(--rise-bg-muted)` |
| `--rise-mega-menu-padding-x` | корень | padding-x | — | `12px` |
| `--rise-mega-menu-padding-y` | корень | padding-y | — | `8px` |
| `--rise-mega-menu-panel-padding` | panel | padding | — | `20px` |
| `--rise-mega-menu-panel-radius` | panel | radius | — | `var(--rise-radius-lg)` |
| `--rise-mega-menu-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-mega-menu-trigger-bg-hover` | trigger | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-mega-menu-trigger-font-weight` | trigger | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-mega-menu-trigger-text` | trigger | text | — | `var(--rise-text-toned)` |
| `--rise-mega-menu-trigger-text-hover` | trigger | text | hover | `var(--rise-text-highlighted)` |

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

## BaseMenu

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-menu-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-menu-border` | корень | border | — | `var(--rise-border)` |
| `--rise-menu-item-bg-active` | item | bg | active | `var(--rise-bg-accented)` |
| `--rise-menu-item-bg-hover` | item | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-menu-item-padding-x` | item | padding-x | — | `8px` |
| `--rise-menu-item-padding-y` | item | padding-y | — | `6px` |
| `--rise-menu-item-radius` | item | radius | — | `var(--rise-radius-md)` |
| `--rise-menu-item-text` | item | text | — | `var(--rise-text)` |
| `--rise-menu-item-text-hover` | item | text | hover | `var(--rise-text-highlighted)` |
| `--rise-menu-padding` | корень | padding | — | `4px` |
| `--rise-menu-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-menu-shadow` | корень | shadow | — | `var(--rise-shadow-lg)` |

## BaseModal

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-modal-bg` | корень | bg | — | `var(--rise-overlay)` |
| `--rise-modal-content-bg` | content | bg | — | `var(--rise-bg)` |
| `--rise-modal-content-border` | content | border | — | `var(--rise-border)` |
| `--rise-modal-content-padding-x` | content | padding-x | — | `20px` |
| `--rise-modal-content-padding-y` | content | padding-y | — | `16px` |
| `--rise-modal-content-radius` | content | radius | — | `var(--rise-radius-lg)` |
| `--rise-modal-content-shadow` | content | shadow | — | `var(--rise-shadow-xl)` |
| `--rise-modal-content-text` | content | text | — | `var(--rise-text)` |
| `--rise-modal-content-width` | content | width | — | `500px` |
| `--rise-modal-padding` | корень | padding | — | `16px` |
| `--rise-modal-title-font-size` | title | font-size | — | `var(--rise-font-size-base)` |

## BaseNotification

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-notification-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-notification-border` | корень | border | — | `var(--rise-border)` |
| `--rise-notification-description-text` | description | text | — | `var(--rise-text-muted)` |
| `--rise-notification-gap` | корень | gap | — | `8px` |
| `--rise-notification-padding` | корень | padding | — | `16px` |
| `--rise-notification-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-notification-shadow` | корень | shadow | — | `var(--rise-shadow-lg)` |
| `--rise-notification-text` | корень | text | — | `var(--rise-text)` |
| `--rise-notification-title-font-size` | title | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-notification-title-font-weight` | title | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-notification-width` | корень | width | — | `360px` |

## BaseNotificationCenter

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-notification-center-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-notification-center-border` | корень | border | — | `var(--rise-border)` |
| `--rise-notification-center-dot-bg` | dot | bg | — | `var(--rise-primary)` |
| `--rise-notification-center-item-bg-hover` | item | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-notification-center-item-gap` | item | gap | — | `12px` |
| `--rise-notification-center-item-padding-x` | item | padding-x | — | `8px` |
| `--rise-notification-center-item-padding-y` | item | padding-y | — | `8px` |
| `--rise-notification-center-padding` | корень | padding | — | `12px` |
| `--rise-notification-center-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-notification-center-shadow` | корень | shadow | — | `none` |
| `--rise-notification-center-text` | корень | text | — | `var(--rise-text)` |
| `--rise-notification-center-title-font-size` | title | font-size | — | `var(--rise-font-size-md)` |

## BasePagination

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-pagination-arrow-padding-x` | arrow | padding-x | — | `var(--rise-control-padding-y)` |
| `--rise-pagination-ellipsis-text` | ellipsis | text | — | `var(--rise-text-muted)` |
| `--rise-pagination-gap` | корень | gap | — | `4px` |
| `--rise-pagination-indicator-bg` | indicator | bg | — | `var(--rise-primary)` |
| `--rise-pagination-indicator-bg-hover` | indicator | bg | hover | `var(--rise-primary-hover)` |
| `--rise-pagination-indicator-radius` | indicator | radius | — | `var(--rise-control-radius)` |
| `--rise-pagination-indicator-shadow` | indicator | shadow | — | `none` |
| `--rise-pagination-page-padding-x` | page | padding-x | — | `6px` |
| `--rise-pagination-page-text-selected` | page | text | selected | `var(--rise-on-primary)` |

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

## BasePieChart

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-pie-chart-center-font-weight` | center | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-pie-chart-center-text` | center | text | — | `var(--rise-text-highlighted)` |
| `--rise-pie-chart-gap` | корень | gap | — | `24px` |
| `--rise-pie-chart-item-bg-active` | item | bg | active | `var(--rise-bg-elevated)` |
| `--rise-pie-chart-item-padding-x` | item | padding-x | — | `6px` |
| `--rise-pie-chart-item-padding-y` | item | padding-y | — | `2px` |
| `--rise-pie-chart-item-radius` | item | radius | — | `var(--rise-radius-sm)` |
| `--rise-pie-chart-legend-gap` | legend | gap | — | `6px` |
| `--rise-pie-chart-text` | корень | text | — | `var(--rise-text)` |
| `--rise-pie-chart-track-bg` | track | bg | — | `var(--rise-bg-elevated)` |
| `--rise-pie-chart-value-font-weight` | value | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-pie-chart-value-text` | value | text | — | `var(--rise-text-highlighted)` |

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

## BasePopconfirm

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-popconfirm-description-text` | description | text | — | `var(--rise-text-muted)` |
| `--rise-popconfirm-gap` | корень | gap | — | `8px` |
| `--rise-popconfirm-icon-text` | icon | text | — | `var(--rise-error)` |
| `--rise-popconfirm-padding` | корень | padding | — | `8px` |
| `--rise-popconfirm-title-font-weight` | title | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-popconfirm-title-text` | title | text | — | `var(--rise-text-highlighted)` |
| `--rise-popconfirm-width` | корень | width | — | `300px` |

## BasePopover

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-popover-inner-font-size` | inner | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-popover-inner-padding-x` | inner | padding-x | — | `16px` |
| `--rise-popover-inner-padding-y` | inner | padding-y | — | `12px` |
| `--rise-popover-panel-width` | panel | width | — | `320px` |

## BasePresentationPlayer

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-presentation-player-done-bg` | done | bg | — | `var(--media-overlay)` |
| `--rise-presentation-player-done-gap` | done | gap | — | `8px` |
| `--rise-presentation-player-done-icon-size` | done | icon-size | — | `48px` |
| `--rise-presentation-player-done-padding` | done | padding | — | `24px` |
| `--rise-presentation-player-done-title-font-size` | done-title | font-size | — | `var(--rise-font-size-2xl)` |
| `--rise-presentation-player-done-title-font-weight` | done-title | font-weight | — | `var(--rise-font-weight-bold)` |
| `--rise-presentation-player-next-ring` | next | ring | — | `var(--media-primary)` |
| `--rise-presentation-player-notes-font-size` | notes | font-size | — | `calc(var(--rise-font-size-base) - 1px)` |
| `--rise-presentation-player-notes-padding-x` | notes | padding-x | — | `20px` |
| `--rise-presentation-player-notes-padding-y` | notes | padding-y | — | `16px` |
| `--rise-presentation-player-notes-text` | notes | text | — | `var(--media-text)` |

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

## BasePromptInput

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-prompt-input-bg` | корень | bg | — | `var(--rise-input-bg, var(--rise-bg))` |
| `--rise-prompt-input-border` | корень | border | — | `var(--rise-input-border, var(--rise-border-accented))` |
| `--rise-prompt-input-border-focus` | корень | border | focus | `var(--rise-input-border-focus, var(--rise-primary))` |
| `--rise-prompt-input-button-icon-size` | button | icon-size | — | `16px` |
| `--rise-prompt-input-button-radius` | button | radius | — | `50%` |
| `--rise-prompt-input-control-font-size` | control | font-size | — | `var(--rise-control-font-size)` |
| `--rise-prompt-input-gap` | корень | gap | — | `6px` |
| `--rise-prompt-input-radius` | корень | radius | — | `var(--rise-input-radius, var(--rise-control-radius))` |
| `--rise-prompt-input-text` | корень | text | — | `var(--rise-text-highlighted)` |
| `--rise-prompt-input-toolbar-gap` | toolbar | gap | — | `8px` |

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

## BaseRadio

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-radio-circle-bg` | circle | bg | — | `var(--rise-bg)` |
| `--rise-radio-circle-bg-checked` | circle | bg | checked | `var(--rise-primary)` |
| `--rise-radio-circle-bg-hover` | circle | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-radio-circle-border` | circle | border | — | `var(--rise-border-accented)` |
| `--rise-radio-circle-border-checked` | circle | border | checked | `var(--rise-primary)` |
| `--rise-radio-circle-ring` | circle | ring | — | `var(--rise-focus-ring)` |
| `--rise-radio-circle-shadow` | circle | shadow | — | `var(--rise-shadow-xs)` |
| `--rise-radio-dot-bg` | dot | bg | — | `var(--rise-on-primary)` |
| `--rise-radio-item-text` | item | text | — | `var(--rise-text)` |
| `--rise-radio-option-label-font-weight` | option-label | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-radio-options-gap` | options | gap | — | `8px` |

## BaseRange

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-range-fill-bg` | fill | bg | — | `var(--rise-primary)` |
| `--rise-range-gap` | корень | gap | — | `8px` |
| `--rise-range-label-value-text` | label-value | text | — | `var(--rise-text-highlighted)` |
| `--rise-range-thumb-bg` | thumb | bg | — | `var(--rise-bg)` |
| `--rise-range-thumb-border` | thumb | border | — | `var(--rise-primary)` |
| `--rise-range-thumb-height` | thumb | height | — | `16px` |
| `--rise-range-thumb-radius` | thumb | radius | — | `var(--rise-radius-full)` |
| `--rise-range-thumb-shadow` | thumb | shadow | — | `var(--rise-shadow-sm)` |
| `--rise-range-thumb-width` | thumb | width | — | `16px` |
| `--rise-range-track-bg` | track | bg | — | `var(--rise-bg-accented)` |
| `--rise-range-track-height` | track | height | — | `6px` |
| `--rise-range-track-radius` | track | radius | — | `var(--rise-radius-full)` |

## BaseRating

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-rating-border` | корень | border | — | `var(--rise-border-accented)` |
| `--rise-rating-gap` | корень | gap | — | `2px` |
| `--rise-rating-padding-x` | корень | padding-x | — | `var(--rise-control-padding-x)` |
| `--rise-rating-padding-y` | корень | padding-y | — | `var(--rise-control-padding-y)` |
| `--rise-rating-radius` | корень | radius | — | `var(--rise-radius-sm)` |
| `--rise-rating-shadow` | корень | shadow | — | `var(--rise-shadow-xs)` |
| `--rise-rating-star-fill-text` | star-fill | text | — | `var(--rise-primary)` |
| `--rise-rating-star-fill-text-hover` | star-fill | text | hover | `var(--rise-primary-hover)` |
| `--rise-rating-star-text` | star | text | — | `var(--rise-border-accented)` |
| `--rise-rating-value-font-size` | value | font-size | — | `14px` |
| `--rise-rating-value-font-weight` | value | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-rating-value-text` | value | text | — | `var(--rise-text-toned)` |

## BaseReasoning

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-reasoning-bg` | корень | bg | — | `transparent` |
| `--rise-reasoning-border` | корень | border | — | `var(--rise-border)` |
| `--rise-reasoning-content-border` | content | border | — | `var(--rise-border)` |
| `--rise-reasoning-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-reasoning-padding-x` | корень | padding-x | — | `12px` |
| `--rise-reasoning-padding-y` | корень | padding-y | — | `8px` |
| `--rise-reasoning-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-reasoning-text` | корень | text | — | `var(--rise-text-muted)` |
| `--rise-reasoning-trigger-font-weight` | trigger | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-reasoning-trigger-gap` | trigger | gap | — | `6px` |
| `--rise-reasoning-trigger-text-hover` | trigger | text | hover | `var(--rise-text-highlighted)` |

## BaseResult

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-result-bg` | корень | bg | — | `transparent` |
| `--rise-result-border` | корень | border | — | `transparent` |
| `--rise-result-gap` | корень | gap | — | `16px` |
| `--rise-result-icon-size` | корень | icon-size | — | `sz(32px)` |
| `--rise-result-icon-wrapper-height` | icon-wrapper | height | — | `64px` |
| `--rise-result-padding-x` | корень | padding-x | — | `24px` |
| `--rise-result-padding-y` | корень | padding-y | — | `32px` |
| `--rise-result-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-result-text` | корень | text | — | `var(--rise-text-muted)` |
| `--rise-result-title-font-size` | title | font-size | — | `var(--rise-font-size-xl)` |
| `--rise-result-title-text` | title | text | — | `var(--rise-text-highlighted)` |

## BaseScrollArea

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-scroll-area-bar-bg` | bar | bg | — | `transparent` |
| `--rise-scroll-area-bar-width` | bar | width | — | `10px` |
| `--rise-scroll-area-thumb-bg` | thumb | bg | — | `var(--rise-border-accented)` |
| `--rise-scroll-area-thumb-bg-active` | thumb | bg | active | `var(--rise-text-muted)` |
| `--rise-scroll-area-thumb-bg-hover` | thumb | bg | hover | `var(--rise-text-muted)` |
| `--rise-scroll-area-thumb-radius` | thumb | radius | — | `var(--rise-radius-full)` |

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

## BaseSegmented

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-segmented-indicator-bg` | indicator | bg | — | `var(--rise-bg)` |
| `--rise-segmented-indicator-shadow` | indicator | shadow | — | `var(--rise-shadow-sm)` |
| `--rise-segmented-segment-font-weight` | segment | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-segmented-segment-padding-x` | segment | padding-x | — | `12px` |
| `--rise-segmented-segment-padding-y` | segment | padding-y | — | `4px` |
| `--rise-segmented-segment-radius` | segment | radius | — | `var(--rise-radius-sm)` |
| `--rise-segmented-segment-text` | segment | text | — | `var(--rise-text)` |
| `--rise-segmented-segment-text-checked` | segment | text | checked | `var(--rise-text-highlighted)` |
| `--rise-segmented-track-bg` | track | bg | — | `var(--rise-bg-elevated)` |
| `--rise-segmented-track-border` | track | border | — | `transparent` |
| `--rise-segmented-track-gap` | track | gap | — | `2px` |
| `--rise-segmented-track-radius` | track | radius | — | `var(--rise-control-radius)` |

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

## BaseSeparator

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-separator-border` | корень | border | — | `var(--rise-border)` |
| `--rise-separator-content-font-size` | content | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-separator-content-font-weight` | content | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-separator-content-padding-x` | content | padding-x | — | `12px` |
| `--rise-separator-content-padding-y` | content | padding-y | — | `0px` |
| `--rise-separator-content-text` | content | text | — | `var(--rise-text-muted)` |

## BaseSideBar

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-side-bar-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-side-bar-border` | корень | border | — | `var(--rise-border)` |
| `--rise-side-bar-indicator-bg` | indicator | bg | — | `var(--rise-primary)` |
| `--rise-side-bar-item-bg-hover` | item | bg | hover | `var(--rise-bg-accented)` |
| `--rise-side-bar-item-bg-selected` | item | bg | selected | `var(--rise-primary-soft)` |
| `--rise-side-bar-item-radius` | item | radius | — | `var(--rise-radius-md)` |
| `--rise-side-bar-item-text` | item | text | — | `var(--rise-text-muted)` |
| `--rise-side-bar-item-text-hover` | item | text | hover | `var(--rise-text-highlighted)` |
| `--rise-side-bar-item-text-selected` | item | text | selected | `var(--rise-primary-text)` |
| `--rise-side-bar-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-side-bar-shadow` | корень | shadow | — | `none` |
| `--rise-side-bar-text` | корень | text | — | `var(--rise-text)` |

## BaseSignaturePad

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-signature-pad-baseline-border` | baseline | border | — | `var(--rise-border-accented)` |
| `--rise-signature-pad-baseline-text` | baseline | text | — | `var(--rise-text-toned)` |
| `--rise-signature-pad-gap` | корень | gap | — | `sz(6px)` |
| `--rise-signature-pad-hint-text` | hint | text | — | `var(--rise-text-toned)` |
| `--rise-signature-pad-surface-bg` | surface | bg | — | `var(--rise-input-bg, var(--rise-bg))` |
| `--rise-signature-pad-surface-border` | surface | border | — | `var(--rise-input-border, var(--rise-border-accented))` |
| `--rise-signature-pad-surface-border-focus` | surface | border | focus | `var(--rise-input-border-focus, var(--rise-primary))` |
| `--rise-signature-pad-surface-radius` | surface | radius | — | `var(--rise-input-radius, var(--rise-control-radius))` |
| `--rise-signature-pad-text` | корень | text | — | `var(--rise-text-highlighted)` |
| `--rise-signature-pad-toolbar-gap` | toolbar | gap | — | `space(4px)` |

## BaseSkeleton

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-skeleton-bg` | корень | bg | — | `var(--rise-bg-elevated)` |
| `--rise-skeleton-height` | корень | height | — | `16px` |
| `--rise-skeleton-radius` | корень | radius | — | `var(--rise-radius-sm)` |

## BaseSlideover

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-slideover-bg` | корень | bg | — | `var(--rise-overlay)` |
| `--rise-slideover-panel-bg` | panel | bg | — | `var(--rise-bg)` |
| `--rise-slideover-panel-border` | panel | border | — | `var(--rise-border)` |
| `--rise-slideover-panel-padding-x` | panel | padding-x | — | `20px` |
| `--rise-slideover-panel-padding-y` | panel | padding-y | — | `16px` |
| `--rise-slideover-panel-radius` | panel | radius | — | `var(--rise-radius-lg)` |
| `--rise-slideover-panel-shadow` | panel | shadow | — | `var(--rise-shadow-xl)` |
| `--rise-slideover-panel-text` | panel | text | — | `var(--rise-text)` |
| `--rise-slideover-panel-width` | panel | width | — | `420px` |
| `--rise-slideover-title-font-size` | title | font-size | — | `var(--rise-font-size-base)` |

## BaseSlider

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-slider-dot-bg` | dot | bg | — | `var(--rise-bg-accented)` |
| `--rise-slider-dot-bg-active` | dot | bg | active | `var(--rise-primary)` |
| `--rise-slider-dot-bg-hover` | dot | bg | hover | `var(--rise-text-dimmed)` |
| `--rise-slider-dots-gap` | dots | gap | — | `8px` |
| `--rise-slider-slide-radius` | slide | radius | — | `var(--rise-radius-lg)` |
| `--rise-slider-thumb-border-active` | thumb | border | active | `var(--rise-primary)` |
| `--rise-slider-thumb-radius` | thumb | radius | — | `var(--rise-radius-md)` |
| `--rise-slider-thumbs-gap` | thumbs | gap | — | `8px` |
| `--rise-slider-title-font-weight` | title | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-slider-viewport-bg` | viewport | bg | — | `var(--rise-bg-elevated)` |
| `--rise-slider-viewport-radius` | viewport | radius | — | `var(--rise-radius-lg)` |

## BaseSparkline

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-sparkline-bar-radius` | bar | radius | — | `2px` |
| `--rise-sparkline-bars-gap` | bars | gap | — | `2px` |
| `--rise-sparkline-dot-border` | dot | border | — | `var(--rise-bg)` |
| `--rise-sparkline-mark-bg` | mark | bg | — | `var(--rise-primary)` |
| `--rise-sparkline-tooltip-bg` | tooltip | bg | — | `var(--rise-bg)` |
| `--rise-sparkline-tooltip-border` | tooltip | border | — | `var(--rise-border)` |
| `--rise-sparkline-tooltip-padding-x` | tooltip | padding-x | — | `8px` |
| `--rise-sparkline-tooltip-padding-y` | tooltip | padding-y | — | `4px` |
| `--rise-sparkline-tooltip-radius` | tooltip | radius | — | `var(--rise-radius-sm)` |
| `--rise-sparkline-tooltip-shadow` | tooltip | shadow | — | `var(--rise-shadow-md)` |
| `--rise-sparkline-tooltip-text` | tooltip | text | — | `var(--rise-text-muted)` |

## BaseSplitButton

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-split-button-gap` | корень | gap | — | `-1px` |
| `--rise-split-button-toggle-border` | toggle | border | — | `color-mix(in srgb, currentcolor 30%, transparent)` |
| `--rise-split-button-toggle-padding-x` | toggle | padding-x | — | `8px` |

## BaseSplitter

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-splitter-handle-bg` | handle | bg | — | `var(--rise-border-accented)` |
| `--rise-splitter-handle-bg-active` | handle | bg | active | `var(--rise-primary)` |
| `--rise-splitter-handle-bg-hover` | handle | bg | hover | `var(--rise-primary)` |
| `--rise-splitter-handle-height` | handle | height | — | `24px` |
| `--rise-splitter-handle-radius` | handle | radius | — | `var(--rise-radius-full)` |
| `--rise-splitter-handle-width` | handle | width | — | `4px` |
| `--rise-splitter-separator-bg` | separator | bg | — | `var(--rise-border)` |
| `--rise-splitter-separator-bg-active` | separator | bg | active | `var(--rise-primary)` |
| `--rise-splitter-separator-bg-hover` | separator | bg | hover | `var(--rise-primary)` |
| `--rise-splitter-separator-ring` | separator | ring | — | `var(--rise-focus-ring)` |
| `--rise-splitter-separator-width` | separator | width | — | `9px` |

## BaseStack

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-stack-gap` | корень | gap | — | `$size` |

## BaseStat

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-stat-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-stat-border` | корень | border | — | `var(--rise-border)` |
| `--rise-stat-gap` | корень | gap | — | `12px` |
| `--rise-stat-icon-text` | icon | text | — | `var(--rise-text-muted)` |
| `--rise-stat-label-text` | label | text | — | `var(--rise-text-muted)` |
| `--rise-stat-padding-x` | корень | padding-x | — | `16px` |
| `--rise-stat-padding-y` | корень | padding-y | — | `16px` |
| `--rise-stat-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-stat-shadow` | корень | shadow | — | `none` |
| `--rise-stat-value-font-size` | value | font-size | — | `var(--rise-font-size-2xl)` |
| `--rise-stat-value-font-weight` | value | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-stat-value-text` | value | text | — | `var(--rise-text-highlighted)` |

## BaseStepper

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-stepper-bg-checked` | корень | bg | checked | `var(--rise-primary)` |
| `--rise-stepper-description-text` | description | text | — | `var(--rise-text-muted)` |
| `--rise-stepper-indicator-bg` | indicator | bg | — | `var(--rise-bg-elevated)` |
| `--rise-stepper-indicator-radius` | indicator | radius | — | `var(--rise-radius-full)` |
| `--rise-stepper-indicator-square-radius` | indicator-square | radius | — | `var(--rise-radius-md)` |
| `--rise-stepper-indicator-text` | indicator | text | — | `var(--rise-text-toned)` |
| `--rise-stepper-indicator-width` | indicator | width | — | `28px` |
| `--rise-stepper-label-font-size` | label | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-stepper-label-font-weight` | label | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-stepper-label-text` | label | text | — | `var(--rise-text)` |
| `--rise-stepper-label-text-active` | label | text | active | `var(--rise-text-highlighted)` |
| `--rise-stepper-line-bg` | line | bg | — | `var(--rise-border-accented)` |
| `--rise-stepper-text-checked` | корень | text | checked | `var(--rise-on-primary)` |

## BaseSubtitleEditor

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-subtitle-editor-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-subtitle-editor-block-bg` | block | bg | — | `color-mix(in srgb, var(--rise-primary) 45%, transparent)` |
| `--rise-subtitle-editor-block-bg-active` | block | bg | active | `var(--rise-primary)` |
| `--rise-subtitle-editor-border` | корень | border | — | `var(--rise-border)` |
| `--rise-subtitle-editor-gap` | корень | gap | — | `12px` |
| `--rise-subtitle-editor-padding` | корень | padding | — | `12px` |
| `--rise-subtitle-editor-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-subtitle-editor-row-bg-active` | row | bg | active | `var(--rise-primary-soft)` |
| `--rise-subtitle-editor-row-radius` | row | radius | — | `var(--rise-radius-md)` |
| `--rise-subtitle-editor-text` | корень | text | — | `var(--rise-text)` |
| `--rise-subtitle-editor-timeline-bg` | timeline | bg | — | `var(--rise-bg-accented)` |
| `--rise-subtitle-editor-timeline-height` | timeline | height | — | `28px` |

## BaseSwitch

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-switch-description-text` | description | text | — | `var(--rise-text-muted)` |
| `--rise-switch-handle-bg` | handle | bg | — | `var(--rise-bg)` |
| `--rise-switch-handle-bg-checked` | handle | bg | checked | `var(--rise-bg)` |
| `--rise-switch-handle-shadow` | handle | shadow | — | `var(--rise-shadow-sm)` |
| `--rise-switch-label-text` | label | text | — | `var(--rise-text)` |
| `--rise-switch-row-gap` | row | gap | — | `8px` |
| `--rise-switch-slider-bg` | slider | bg | — | `var(--rise-bg-accented)` |
| `--rise-switch-slider-bg-checked` | slider | bg | checked | `var(--rise-primary)` |
| `--rise-switch-slider-ring` | slider | ring | — | `var(--rise-focus-ring)` |
| `--rise-switch-slider-shadow` | slider | shadow | — | `none` |

## BaseTable

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-table-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-table-border` | корень | border | — | `var(--rise-border)` |
| `--rise-table-cell-padding-x` | cell | padding-x | — | `16px` |
| `--rise-table-cell-padding-y` | cell | padding-y | — | `12px` |
| `--rise-table-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-table-header-bg` | header | bg | — | `ct(table, bg, var(--rise-bg))` |
| `--rise-table-header-font-weight` | header | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-table-header-text` | header | text | — | `var(--rise-text-highlighted)` |
| `--rise-table-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-table-row-bg-hover` | row | bg | hover | `var(--rise-bg-muted)` |
| `--rise-table-row-bg-selected` | row | bg | selected | `var(--rise-primary-soft)` |
| `--rise-table-text` | корень | text | — | `var(--rise-text)` |

## BaseTabs

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-tabs-border` | корень | border | — | `var(--rise-border)` |
| `--rise-tabs-gap` | корень | gap | — | `4px` |
| `--rise-tabs-indicator-bg` | indicator | bg | — | `var(--rise-primary)` |
| `--rise-tabs-indicator-height` | indicator | height | — | `2px` |
| `--rise-tabs-indicator-radius` | indicator | radius | — | `var(--rise-control-radius)` |
| `--rise-tabs-indicator-shadow` | indicator | shadow | — | `var(--rise-shadow-xs)` |
| `--rise-tabs-list-bg` | list | bg | — | `var(--rise-bg-elevated)` |
| `--rise-tabs-list-padding` | list | padding | — | `4px` |
| `--rise-tabs-list-radius` | list | radius | — | `var(--rise-radius-lg)` |
| `--rise-tabs-pills-indicator-bg` | pills-indicator | bg | — | `var(--rise-bg)` |
| `--rise-tabs-rounded-indicator-radius` | rounded-indicator | radius | — | `var(--rise-radius-full)` |
| `--rise-tabs-rounded-list-radius` | rounded-list | radius | — | `var(--rise-radius-full)` |
| `--rise-tabs-tab-padding-x` | tab | padding-x | — | `12px` |
| `--rise-tabs-tab-text` | tab | text | — | `var(--rise-text-muted)` |
| `--rise-tabs-tab-text-selected` | tab | text | selected | `var(--rise-text-highlighted)` |

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

## BaseTextDiff

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-text-diff-added-bg` | added | bg | — | `var(--rise-success-soft)` |
| `--rise-text-diff-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-text-diff-border` | корень | border | — | `var(--rise-border)` |
| `--rise-text-diff-font-size` | корень | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-text-diff-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-text-diff-removed-bg` | removed | bg | — | `var(--rise-error-soft)` |
| `--rise-text-diff-summary-bg` | summary | bg | — | `transparent` |
| `--rise-text-diff-summary-padding-x` | summary | padding-x | — | `12px` |
| `--rise-text-diff-summary-padding-y` | summary | padding-y | — | `6px` |
| `--rise-text-diff-text` | корень | text | — | `var(--rise-text)` |

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

## BaseTimeline

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-timeline-description-text` | description | text | — | `var(--rise-text-muted)` |
| `--rise-timeline-dot-height` | dot | height | — | `8px` |
| `--rise-timeline-gap` | корень | gap | — | `24px` |
| `--rise-timeline-item-gap` | item | gap | — | `12px` |
| `--rise-timeline-line-bg` | line | bg | — | `var(--rise-border)` |
| `--rise-timeline-marker-bg` | marker | bg | — | `var(--timeline-color)` |
| `--rise-timeline-marker-height` | marker | height | — | `24px` |
| `--rise-timeline-marker-radius` | marker | radius | — | `50%` |
| `--rise-timeline-marker-text` | marker | text | — | `var(--rise-on-primary)` |
| `--rise-timeline-title-font-size` | title | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-timeline-title-font-weight` | title | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-timeline-title-text` | title | text | — | `var(--rise-text)` |

## BaseToolCall

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-tool-call-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-tool-call-border` | корень | border | — | `var(--rise-border)` |
| `--rise-tool-call-code-bg` | code | bg | — | `var(--rise-bg-muted)` |
| `--rise-tool-call-code-radius` | code | radius | — | `var(--rise-radius-sm)` |
| `--rise-tool-call-content-gap` | content | gap | — | `10px` |
| `--rise-tool-call-padding-x` | корень | padding-x | — | `12px` |
| `--rise-tool-call-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-tool-call-text` | корень | text | — | `var(--rise-text)` |
| `--rise-tool-call-title-font-weight` | title | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-tool-call-trigger-bg-hover` | trigger | bg | hover | `var(--rise-bg-muted)` |
| `--rise-tool-call-trigger-gap` | trigger | gap | — | `8px` |
| `--rise-tool-call-trigger-padding-y` | trigger | padding-y | — | `8px` |

## BaseToolbar

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-toolbar-bg` | корень | bg | — | `transparent` |
| `--rise-toolbar-border` | корень | border | — | `transparent` |
| `--rise-toolbar-gap` | корень | gap | — | `4px` |
| `--rise-toolbar-padding` | корень | padding | — | `4px` |
| `--rise-toolbar-radius` | корень | radius | — | `var(--rise-radius-md)` |
| `--rise-toolbar-shadow` | корень | shadow | — | `none` |

## BaseTooltip

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-tooltip-bg` | корень | bg | — | `var(--rise-bg-inverted)` |
| `--rise-tooltip-font-size` | корень | font-size | — | `var(--rise-font-size-xs)` |
| `--rise-tooltip-padding-x` | корень | padding-x | — | `8px` |
| `--rise-tooltip-padding-y` | корень | padding-y | — | `4px` |
| `--rise-tooltip-radius` | корень | radius | — | `var(--rise-radius-sm)` |
| `--rise-tooltip-shadow` | корень | shadow | — | `0 0 transparent` |
| `--rise-tooltip-text` | корень | text | — | `var(--rise-text-inverted)` |
| `--rise-tooltip-width` | корень | width | — | `280px` |

## BaseTour

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-tour-card-bg` | card | bg | — | `var(--rise-bg)` |
| `--rise-tour-card-border` | card | border | — | `var(--rise-border)` |
| `--rise-tour-card-padding` | card | padding | — | `16px` |
| `--rise-tour-card-radius` | card | radius | — | `var(--rise-radius-lg)` |
| `--rise-tour-card-shadow` | card | shadow | — | `var(--rise-shadow-lg)` |
| `--rise-tour-card-text` | card | text | — | `var(--rise-text)` |
| `--rise-tour-card-width` | card | width | — | `320px` |
| `--rise-tour-progress-bar-bg` | progress-bar | bg | — | `var(--rise-bg-accented)` |
| `--rise-tour-progress-bar-fill-bg` | progress-bar-fill | bg | — | `var(--rise-primary)` |
| `--rise-tour-spotlight-radius` | spotlight | radius | — | `8px` |
| `--rise-tour-spotlight-ring` | spotlight | ring | — | `var(--rise-primary)` |
| `--rise-tour-title-font-size` | title | font-size | — | `var(--rise-font-size-sm)` |

## BaseTransfer

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-transfer-count-text` | count | text | — | `var(--rise-text-toned)` |
| `--rise-transfer-gap` | корень | gap | — | `12px` |
| `--rise-transfer-panel-bg` | panel | bg | — | `var(--rise-bg)` |
| `--rise-transfer-panel-border` | panel | border | — | `var(--rise-border)` |
| `--rise-transfer-panel-gap` | panel | gap | — | `8px` |
| `--rise-transfer-panel-padding` | panel | padding | — | `10px` |
| `--rise-transfer-panel-radius` | panel | radius | — | `var(--rise-radius-md)` |
| `--rise-transfer-title-font-weight` | title | font-weight | — | `var(--rise-font-weight-semibold)` |
| `--rise-transfer-title-text` | title | text | — | `var(--rise-text-highlighted)` |

## BaseTree

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-tree-bg` | корень | bg | — | `transparent` |
| `--rise-tree-border` | корень | border | — | `var(--rise-border)` |
| `--rise-tree-children-border` | children | border | — | `var(--rise-border)` |
| `--rise-tree-children-padding-x` | children | padding-x | — | `4px` |
| `--rise-tree-item-bg-hover` | item | bg | hover | `var(--rise-bg-elevated)` |
| `--rise-tree-item-bg-selected` | item | bg | selected | `var(--rise-primary-soft)` |
| `--rise-tree-item-gap` | item | gap | — | `6px` |
| `--rise-tree-item-height` | item | height | — | `auto` |
| `--rise-tree-item-padding-x` | item | padding-x | — | `8px` |
| `--rise-tree-item-radius` | item | radius | — | `var(--rise-radius-md)` |
| `--rise-tree-item-text` | item | text | — | `var(--rise-text)` |
| `--rise-tree-item-text-selected` | item | text | selected | `var(--rise-primary-text)` |

## BaseTreeSelect

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-tree-select-bg` | корень | bg | — | `var(--rise-input-bg, var(--rise-bg))` |
| `--rise-tree-select-border` | корень | border | — | `var(--rise-input-border, var(--rise-border-accented))` |
| `--rise-tree-select-border-focus` | корень | border | focus | `var(--rise-input-border-focus, var(--rise-primary))` |
| `--rise-tree-select-checkbox-bg-checked` | checkbox | bg | checked | `var(--rise-primary)` |
| `--rise-tree-select-node-bg-active` | node | bg | active | `var(--rise-bg-elevated)` |
| `--rise-tree-select-node-radius` | node | radius | — | `var(--rise-radius-md)` |
| `--rise-tree-select-padding-x` | корень | padding-x | — | `var(--rise-control-padding-x)` |
| `--rise-tree-select-padding-y` | корень | padding-y | — | `var(--rise-control-padding-y)` |
| `--rise-tree-select-radius` | корень | radius | — | `var(--rise-input-radius, var(--rise-control-radius))` |
| `--rise-tree-select-text` | корень | text | — | `var(--rise-text-highlighted)` |

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

## BaseVirtualList

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-virtual-list-bg` | корень | bg | — | `transparent` |
| `--rise-virtual-list-item-padding-x` | item | padding-x | — | `0` |
| `--rise-virtual-list-item-padding-y` | item | padding-y | — | `0` |
| `--rise-virtual-list-radius` | корень | radius | — | `0` |

## BaseVoiceRecorder

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-voice-recorder-bg` | корень | bg | — | `var(--rise-bg)` |
| `--rise-voice-recorder-border` | корень | border | — | `var(--rise-border)` |
| `--rise-voice-recorder-dot-bg` | dot | bg | — | `var(--rise-error)` |
| `--rise-voice-recorder-error-text` | error | text | — | `var(--rise-error)` |
| `--rise-voice-recorder-gap` | корень | gap | — | `8px` |
| `--rise-voice-recorder-height` | корень | height | — | `48px` |
| `--rise-voice-recorder-level-bg` | level | bg | — | `var(--rise-primary)` |
| `--rise-voice-recorder-level-radius` | level | radius | — | `var(--rise-radius-full)` |
| `--rise-voice-recorder-meter-height` | meter | height | — | `28px` |
| `--rise-voice-recorder-padding-x` | корень | padding-x | — | `8px` |
| `--rise-voice-recorder-padding-y` | корень | padding-y | — | `6px` |
| `--rise-voice-recorder-radius` | корень | radius | — | `var(--rise-radius-lg)` |
| `--rise-voice-recorder-text` | корень | text | — | `var(--rise-text)` |

## BaseWaveform

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-waveform-bar-bg` | bar | bg | — | `var(--rise-border-accented)` |
| `--rise-waveform-bar-radius` | bar | radius | — | `var(--rise-radius-full)` |
| `--rise-waveform-fill-bg` | fill | bg | — | `var(--rise-primary)` |
| `--rise-waveform-gap` | корень | gap | — | `2px` |
| `--rise-waveform-height` | корень | height | — | `40px` |
| `--rise-waveform-radius` | корень | radius | — | `var(--rise-radius-sm)` |
| `--rise-waveform-selection-bg` | selection | bg | — | `color-mix(in srgb, var(--waveform-color) 18%, transparent)` |
| `--rise-waveform-selection-border` | selection | border | — | `var(--waveform-color)` |
