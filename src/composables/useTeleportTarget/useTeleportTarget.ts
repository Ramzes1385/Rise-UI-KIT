/** Composable: куда телепортируются окна, панели и тултипы, и какую тему они наследуют */
import { hasInjectionContext, inject, onMounted, ref, watch } from 'vue'
import type { InjectionKey, Ref } from 'vue'

/** Цель телепорта: CSS-селектор или элемент */
export type TeleportTarget = string | HTMLElement

/**
 * Ключ provide/inject цели телепорта: `createUiKitPlugin({ teleportTo })` и `<BaseApp teleport-to>`.
 * Symbol.for — как у других ключей плагина: подпути пакета могут оказаться разными копиями модуля
 */
export const TELEPORT_TARGET_KEY: InjectionKey<TeleportTarget> = Symbol.for('rise-ui-kit.teleport-target')

/**
 * Куда телепортировать окна, выпадающие панели и тултипы. По умолчанию `body`; приложение задаёт свой
 * контейнер, например элемент в полноэкранном режиме: в `body` панели не видны поверх полноэкранного элемента.
 */
export function useTeleportTarget(): TeleportTarget {
	if (!hasInjectionContext()) return 'body'
	return inject(TELEPORT_TARGET_KEY, 'body')
}

/**
 * Тема ближайшего предка якоря (`data-theme`) для телепортированной панели: панель из тёмного блока
 * светлой страницы тоже тёмная. Читается при открытии панели.
 *
 * @example
 * const theme = useInheritedTheme(() => wrapperRef.value, () => props.isOpen)
 * // <div class="panel" :data-theme="theme">
 */
export function useInheritedTheme(anchor: () => Element | null | undefined, isActive: () => boolean): Ref<string | undefined> {
	const theme = ref<string | undefined>()

	function read(): void {
		theme.value = anchor()?.closest('[data-theme]')?.getAttribute('data-theme') ?? undefined
	}

	// После обновления DOM: якорь уже в документе. Панель, открытая при монтировании, — в onMounted
	watch(
		isActive,
		active => {
			if (active) read()
		},
		{ flush: 'post' },
	)
	onMounted(() => {
		if (isActive()) read()
	})
	return theme
}
