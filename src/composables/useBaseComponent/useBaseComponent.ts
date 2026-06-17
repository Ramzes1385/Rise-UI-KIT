import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { SIZE_SCALE_DEFAULT } from '@constants'
import type { UseBaseComponentOptions } from './useBaseComponent.types'
import type { BaseComponentProps } from '@/types/base.types'

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

/**
 * Упрощённая обёртка над useBaseComponent.
 * Принимает props напрямую вместо getter-функций, устраняя бойлерплейт.
 *
 * @param block — БЭМ-блок (например 'base-button')
 * @param props — реактивные пропсы компонента (BaseComponentProps)
 * @param elementKeys — ключи элементов для customClass
 */
function useStandardBaseComponent<T extends BaseComponentProps>(
	block: string,
	props: T,
	elementKeys?: string[],
) {
	return useBaseComponent({
		block,
		getVariant: () => props.variant,
		getSizeScale: () => props.sizeScale ?? SIZE_SCALE_DEFAULT,
		getColor: () => props.color,
		getClass: () => props.customClass,
		elementKeys,
	})
}

export { useBaseComponent, useStandardBaseComponent }
