import type { StyleValue } from 'vue'

/**
 * Тип для пропса customStyle.
 * Может быть строкой, плоским объектом стилей или вложенным объектом стилей по ключам элементов.
 */
export type CustomStyleProp = string | Record<string, any> | StyleValue

/**
 * Параметры для composable useCustomStyle
 */
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
