/**
 * Значения props по умолчанию для всего приложения: `createUiKitPlugin({ defaults })`.
 * `global` — для всех компонентов (например, `sizeScale`), по имени компонента — только для него.
 * Значение компонента важнее `global`, а props, переданные в шаблоне, важнее обоих.
 *
 * @example
 * { global: { sizeScale: 90 }, BaseButton: { variant: 'soft' }, BaseModal: { closeOnOverlay: false } }
 */
export interface UiKitDefaults {
	/** Для всех компонентов, у которых есть такой проп */
	global?: Record<string, unknown>
	/** Для одного компонента: ключ — имя компонента, например `BaseButton` */
	[component: string]: Record<string, unknown> | undefined
}
