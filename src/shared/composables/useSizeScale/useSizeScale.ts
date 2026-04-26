import { computed } from 'vue'

import type { UseSizeScaleOptions } from './useSizeScale.types'

/**
 * Composable для пропорционального масштабирования размеров компонента.
 * Устанавливает CSS-переменную --size-scale на корневом элементе.
 * В SCSS используется функция sz() для умножения базовых значений.
 *
 * @example
 * ```vue
 * <script setup>
 * const props = withDefaults(defineProps<{ sizeScale?: number }>(), { sizeScale: 100 })
 * const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
 * </script>
 *
 * <template>
 *   <button :style="sizeScaleStyle">...</button>
 * </template>
 * ```
 */
function useSizeScale(options: UseSizeScaleOptions) {
	const sizeScaleStyle = computed(() => {
		const scale = options.getScale() ?? 100
		if (scale === 100) return undefined
		return { '--size-scale': String(scale / 100) }
	})

	return { sizeScaleStyle }
}

export { useSizeScale }
