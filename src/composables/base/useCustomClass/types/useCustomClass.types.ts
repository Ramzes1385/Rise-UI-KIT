/** Строка — класс для корневого элемента; объект — классы по ключам элементов (`K` — их union, например 'root' | 'input' | 'label'). */
export type CustomClassProp<K extends string = string> = string | Partial<Record<K, string>>

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

export type ClassResultInternal = string | Record<string, string | boolean | undefined> | undefined
