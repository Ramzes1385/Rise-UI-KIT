import type { StyleValue } from 'vue'

/** Может быть строкой, плоским объектом стилей или вложенным объектом стилей по ключам элементов. */
export type CustomStyleProp = string | Record<string, string | number | undefined> | StyleValue

export interface UseCustomStyleOptions {
	/**
	 * Функция для получения значения пропса customStyle
	 */
	getStyle: () => CustomStyleProp | undefined

	/**
	 * Список известных ключей элементов компонента (например, ['root', 'input', 'label'])
	 * По умолчанию: ['root']
	 */
	elementKeys?: string[]
}

export type StyleResultValue = string | number | Record<string, string | number | undefined> | undefined
