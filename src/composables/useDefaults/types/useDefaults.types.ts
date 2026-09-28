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

/**
 * Пропсы после значений по умолчанию: у ключей `K` уже нет `undefined`. Такими их получает `<script setup>`
 * после `withDefaults`, и таким же типом их принимает логика компонента в `model/useBaseX.ts`.
 *
 * @example
 * type Props = PropsWithDefaults<BaseSplitterProps, 'modelValue' | 'min' | 'max'>
 */
export type PropsWithDefaults<P, K extends keyof P> = Readonly<Omit<P, K> & { [Key in K]-?: Exclude<P[Key], undefined> }>
