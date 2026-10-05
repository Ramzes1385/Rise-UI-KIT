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

## BaseAnchor

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-anchor-border` | корень | border | — | `var(--rise-border)` |
| `--rise-anchor-font-size` | корень | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-anchor-font-weight-active` | корень | font-weight | active | `var(--rise-font-weight-medium)` |
| `--rise-anchor-gap` | корень | gap | — | `2px` |
| `--rise-anchor-indicator-bg` | indicator | bg | — | `var(--rise-primary)` |
| `--rise-anchor-padding-x` | корень | padding-x | — | `8px` |
| `--rise-anchor-padding-y` | корень | padding-y | — | `4px` |
| `--rise-anchor-radius` | корень | radius | — | `var(--rise-radius-sm)` |
| `--rise-anchor-text` | корень | text | — | `var(--rise-text-muted)` |
| `--rise-anchor-text-active` | корень | text | active | `var(--rise-primary-text)` |
| `--rise-anchor-text-hover` | корень | text | hover | `var(--rise-text)` |

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
| `--rise-bottom-nav-text` | корень | text | — | `var(--rise-text-toned)` |
| `--rise-bottom-nav-text-active` | корень | text | active | `var(--rise-text-highlighted)` |
| `--rise-bottom-nav-text-hover` | корень | text | hover | `var(--rise-text)` |

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

## BaseSplitButton

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-split-button-gap` | корень | gap | — | `-1px` |
| `--rise-split-button-toggle-border` | toggle | border | — | `color-mix(in srgb, currentcolor 30%, transparent)` |
| `--rise-split-button-toggle-padding-x` | toggle | padding-x | — | `8px` |

## BaseStepper

| Токен | Часть | Свойство | Состояние | По умолчанию |
|---|---|---|---|---|
| `--rise-stepper-bg-checked` | корень | bg | checked | `var(--rise-primary)` |
| `--rise-stepper-description-text` | description | text | — | `var(--rise-text-muted)` |
| `--rise-stepper-indicator-bg` | indicator | bg | — | `var(--rise-bg-elevated)` |
| `--rise-stepper-indicator-radius` | indicator | radius | — | `var(--rise-radius-full)` |
| `--rise-stepper-indicator-text` | indicator | text | — | `var(--rise-text-toned)` |
| `--rise-stepper-indicator-width` | indicator | width | — | `28px` |
| `--rise-stepper-label-font-size` | label | font-size | — | `var(--rise-font-size-sm)` |
| `--rise-stepper-label-font-weight` | label | font-weight | — | `var(--rise-font-weight-medium)` |
| `--rise-stepper-label-text` | label | text | — | `var(--rise-text)` |
| `--rise-stepper-label-text-active` | label | text | active | `var(--rise-text-highlighted)` |
| `--rise-stepper-line-bg` | line | bg | — | `var(--rise-border-accented)` |
| `--rise-stepper-text-checked` | корень | text | checked | `var(--rise-on-primary)` |

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
