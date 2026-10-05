/** Composable: классы частей компонента из пропа `ui` и настроек плагина */
import { useDefaults } from '@composables/base/useDefaults'
import type { UiClassFn, UiProp } from './types/useUi.types'

function componentName(block: string): string {
	return block.replace(/(^|-)([a-z0-9])/g, (_, __, char: string) => char.toUpperCase())
}

function partClass(block: string, part: string): string {
	return part === 'root' ? block : `${block}__${part}`
}

/**
 * Классы частей компонента: БЭМ-класс кита, затем классы из `defaults.<BaseX>.ui` плагина, затем `props.ui` экземпляра.
 * Вызывается в setup (там доступен inject); `props.ui` читается при каждом вызове — классы реактивны в рендере.
 *
 * @example
 * const ui = useUi(props, 'base-button')
 * ui('root') // ['base-button', 'shadow-lg']
 * ui('label') // ['base-button__label']
 */
export function useUi<Part extends string>(props: { readonly ui?: UiProp<Part> }, block: string): UiClassFn<Part> {
	const global = useDefaults()?.[componentName(block)]?.ui as UiProp<Part> | undefined

	return function ui(part) {
		return [partClass(block, part), global?.[part], props.ui?.[part]].filter((value): value is string => Boolean(value))
	}
}
