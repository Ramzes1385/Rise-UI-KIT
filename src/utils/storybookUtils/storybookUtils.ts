import type { ArgTypes } from '@storybook/vue3'

import type { BuildArgTypesOptions, PropMeta } from './storybookUtils.types'

/** Скрытые пропы Vue по умолчанию */
const HIDDEN_VUE_PROPS = ['class', 'style', 'key', 'ref']

/**
 * Строит argTypes для Storybook из мета-информации о пропах.
 * Автоматически скрывает технические Vue-пропы (class, style, key, ref).
 *
 * @example
 * ```ts
 * import { buildArgTypes } from '@utils/storybookUtils'
 * import { ACCORDION_VARIANTS } from './BaseAccordion.types'
 *
 * const argTypes = buildArgTypes({
 *   props: {
 *     variant: { control: 'inline-radio', options: ACCORDION_VARIANTS },
 *     sizeScale: { control: { type: 'range', min: 50, max: 200, step: 10 } },
 *     color: { control: 'object' },
 *     items: { table: { disable: true } },
 *   },
 * })
 * ```
 */
function buildArgTypes(options: BuildArgTypesOptions): ArgTypes {
	const { props, hidden = [] } = options
	const result: ArgTypes = {}

	const allHidden = [...HIDDEN_VUE_PROPS, ...hidden]

	for (const key of allHidden) {
		result[key] = { table: { disable: true } }
	}

	for (const [name, meta] of Object.entries(props)) {
		result[name] = buildPropArgType(meta)
	}

	return result
}

/**
 * Строит argType для одного пропа
 */
function buildPropArgType(meta: PropMeta): Record<string, unknown> {
	const entry: Record<string, unknown> = {}

	if (meta.control) {
		entry.control = meta.control
	}

	if (meta.options) {
		entry.options = [...meta.options]
	}

	if (meta.description) {
		entry.description = meta.description
	}

	if (meta.table) {
		entry.table = meta.table
	}

	return entry
}

export { buildArgTypes }

