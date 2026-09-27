/** Composable: управление вариантом отображения компонента (БЭМ-модификатор, CSS-переменная) */
import { computed } from 'vue'
import { DEFAULT_VARIANT } from '@constants'
import type { UseVariantOptions } from './useVariant.types'

/**
 * Composable для управления вариантом отображения компонента.
 * Устанавливает БЭМ-модификатор и CSS-переменную --variant на корневом элементе.
 * CSS-переменная наследуется дочерними элементами — позволяет рекурсивно
 * применять стили варианта внутри вложенных компонентов.
 *
 * @example
 * ```vue
 * <script setup>
 * const props = withDefaults(defineProps<{ variant?: string }>(), { variant: DEFAULT_VARIANT })
 * const { variantClass, variantStyle } = useVariant({
 *   block: 'base-accordion',
 *   getVariant: () => props.variant,
 * })
 * </script>
 *
 * <template>
 *   <div :class="variantClass" :style="variantStyle">...</div>
 * </template>
 * ```
 */
function useVariant(options: UseVariantOptions) {
	/** БЭМ-модификатор варианта (например 'base-accordion--ghost'); вариант по умолчанию модификатора не даёт */
	const variantClass = computed(() => {
		const variant = options.getVariant()
		if (!variant || variant === DEFAULT_VARIANT) return undefined
		return `${options.block}--${variant}`
	})

	/** CSS-переменная --variant для каскадного наследования */
	const variantStyle = computed(() => {
		const variant = options.getVariant()
		if (!variant || variant === DEFAULT_VARIANT) return undefined
		return { '--variant': variant }
	})

	return { variantClass, variantStyle }
}

export { useVariant }
