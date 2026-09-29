/** argTypes для stories: группировка props в Docs. Категория `slots` обязательна — по ней Storybook для Vue передаёт arg как содержимое слота, а не как атрибут. */

import type { ArgTypes } from '@storybook/vue3-vite'
import type { ArgGroup, BaseArgTypesOptions } from '../types/helpers.types'

/** Смысловые группы props (подкатегории таблицы в Docs). */
export const ARG_GROUP = {
	content: 'Содержимое',
	appearance: 'Внешний вид',
	state: 'Состояние',
	behavior: 'Поведение',
	a11y: 'Доступность',
} as const

export function propGroup(group: ArgGroup): { category: 'props'; subcategory: ArgGroup } {
	return { category: 'props', subcategory: group }
}

/**
 * argTypes общих props `BaseComponentProps`: variant, sizeScale, color, customClass — группа «Внешний вид».
 *
 * @example
 * argTypes: {
 *   ...baseArgTypes({ variants: BUTTON_VARIANTS }),
 *   isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
 * }
 */
export function baseArgTypes(options: BaseArgTypesOptions = {}): ArgTypes {
	const argTypes: ArgTypes = {
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 12.5 },
			table: propGroup(ARG_GROUP.appearance),
		},
		color: {
			control: 'object',
			table: propGroup(ARG_GROUP.appearance),
		},
		customClass: {
			control: 'object',
			table: propGroup(ARG_GROUP.appearance),
		},
	}
	if (options.variants) {
		argTypes.variant = {
			control: 'inline-radio',
			options: [...options.variants],
			table: propGroup(ARG_GROUP.appearance),
		}
	}
	return argTypes
}

/** Скрывает props/события/слоты из таблицы и панели Controls (служебные или не имеющие смысла в примере). */
export function hiddenArgTypes(...names: string[]): ArgTypes {
	return Object.fromEntries(names.map(name => [name, { table: { disable: true } }]))
}

/** argType для текстового содержимого слота (default, label, …): редактируется в Controls и рендерится как слот. */
export function slotArgType(description: string): ArgTypes[string] {
	return {
		control: 'text',
		description,
		table: { category: 'slots' },
	}
}
