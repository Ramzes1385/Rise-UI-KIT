import { computed } from 'vue'
import type { ColorStates, CustomColor, UseCustomColorOptions } from './useCustomColor.types'

/**
 * Префиксы для CSS-переменных
 */
const PREFIX_BG = '--custom-bg'
const PREFIX_TEXT = '--custom-text'

/**
 * Преобразует ColorStates в CSS-переменные с заданным префиксом
 */
function mapStates(styles: Record<string, string>, prefix: string, states: ColorStates): void {
	if (states.base) styles[prefix] = states.base
	if (states.hover) styles[`${prefix}-hover`] = states.hover
	if (states.active) styles[`${prefix}-active`] = states.active
	if (states.focus) styles[`${prefix}-focus`] = states.focus
}

/**
 * Composable для назначения кастомного цвета компоненту.
 * Устанавливает CSS-переменные --custom-bg*, --custom-text* на корневом элементе.
 * В SCSS используются миксины custom-bg* / custom-text* для применения с fallback.
 *
 * @example
 * ```vue
 * <script setup>
 * const props = defineProps<{ color?: CustomColor }>()
 * const { customColorStyle } = useCustomColor({ getColor: () => props.color })
 * </script>
 *
 * <template>
 *   <button :style="customColorStyle">...</button>
 * </template>
 * ```
 */
function useCustomColor(options: UseCustomColorOptions) {
	const customColorStyle = computed(() => {
		const color = options.getColor()
		if (!color) return undefined

		const styles: Record<string, string> = {}

		if (color.bg) mapStates(styles, PREFIX_BG, color.bg)
		if (color.text) mapStates(styles, PREFIX_TEXT, color.text)

		if (Object.keys(styles).length === 0) return undefined

		return styles
	})

	return { customColorStyle }
}

export { useCustomColor }
export type { ColorStates, CustomColor }
