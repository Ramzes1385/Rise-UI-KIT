import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import type { UseBaseComponentOptions } from './useBaseComponent.types'

/**
 * Composable для базовой логики UI-компонента.
 * Объединяет useSizeScale, useVariant, useCustomColor и useCustomClass в один вызов.
 */
function useBaseComponent(options: UseBaseComponentOptions) {
	const { sizeScaleStyle } = useSizeScale({ getScale: options.getSizeScale })

	const { variantClass, variantStyle } = useVariant({
		block: options.block,
		getVariant: options.getVariant,
	})

	const { customColorStyle } = useCustomColor({ getColor: options.getColor })

	const { classes } = useCustomClass({
		getClass: options.getClass,
		elementKeys: options.elementKeys,
	})

	return { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes }
}

export { useBaseComponent }
