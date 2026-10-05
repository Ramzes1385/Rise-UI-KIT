/**
 * Проп `ui` компонента: классы для его частей — ключ — БЭМ-элемент без `__` (`label`, `icon`), `root` — корень.
 * Классы добавляются к классам кита, а не заменяют их; глобальные (`defaults.BaseX.ui` плагина) и экземпляра склеиваются.
 *
 * @example
 * <BaseButton :ui="{ root: 'shadow-lg', label: 'tracking-wide' }" />
 */
export type UiProp<Part extends string> = Partial<Record<Part | 'root', string>>

/** Классы части строкой: `ui('label')` → `'base-button__label <глобальные> <экземпляра>'` — подходит и для `:class`, и для пропов-строк подкомпонентов */
export type UiClassFn<Part extends string> = (part: Part | 'root') => string
