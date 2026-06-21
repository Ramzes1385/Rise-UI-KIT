/**
 * Тип для пропса customClass.
 * Может быть строкой (для корневого элемента) или объектом с классами для внутренних элементов.
 * @template K — union тип ключей элементов компонента (например 'root' | 'input' | 'label')
 */
export type CustomClassProp<K extends string = string> = string | Partial<Record<K, string>>

/**
 * Параметры для composable useCustomClass
 */
export interface UseCustomClassOptions {
	/**
	 * Функция для получения значения пропса customClass
	 */
	getClass: () => CustomClassProp | undefined

	/**
	 * Список известных ключей элементов компонента (например, ['root', 'input', 'label'])
	 * По умолчанию: ['root']
	 */
	elementKeys?: string[]
}
