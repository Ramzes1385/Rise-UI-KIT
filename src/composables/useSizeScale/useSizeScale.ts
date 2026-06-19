/** Composable: пропорциональное масштабирование размеров компонента */
import { computed } from 'vue'
import { SIZE_SCALE_DEFAULT } from '@constants'
import type { UseSizeScaleOptions } from './useSizeScale.types'

/**
 * Composable для пропорционального масштабирования размеров компонента.
 * Устанавливает CSS-переменную --size-scale на корневом элементе.
 * В SCSS используется функция sz() для умножения базовых значений.
 *
 * @example
 * ```vue
 * <script setup>
 * const props = withDefaults(defineProps<{ sizeScale?: number }>(), { sizeScale: SIZE_SCALE_DEFAULT })
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
		const scale = options.getScale() ?? SIZE_SCALE_DEFAULT
		if (scale === SIZE_SCALE_DEFAULT) return undefined
		return { '--size-scale': String(scale / SIZE_SCALE_DEFAULT) }
	})

	return { sizeScaleStyle }
}

export { useSizeScale }
