import { useVariant } from '@composables/base/useVariant'
/** Composable: базовая логика UI-компонента (размер, вариант, цвет, классы) */
import { useCustomClass } from '@composables/base/useCustomClass'
import { useCustomColor } from '@composables/base/useCustomColor'
import { SIZE_SCALE_DEFAULT, useSizeScale } from '@composables/base/useSizeScale'
import type { BaseComponentProps, UseBaseComponentOptions } from './types/useBaseComponent.types'

/** Объединяет useSizeScale, useVariant, useCustomColor и useCustomClass в один вызов */
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
function useStandardBaseComponent<T extends Omit<BaseComponentProps, 'color'> & { color?: unknown }>(
	block: string,
	props: T,
	elementKeys?: string[],
) {
	return useBaseComponent({
		block,
		getVariant: () => props.variant,
		getSizeScale: () => props.sizeScale ?? SIZE_SCALE_DEFAULT,
		getColor: () => props.color as import('@composables/base/useCustomColor').CustomColor | undefined,
		getClass: () => props.customClass,
		elementKeys,
	})
}

export { useBaseComponent, useStandardBaseComponent }
