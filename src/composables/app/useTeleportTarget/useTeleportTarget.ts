import type { InjectionKey, Ref } from 'vue'
/** Composable: куда телепортируются окна, панели и тултипы, и какую тему они наследуют */
import { hasInjectionContext, inject, onMounted, ref, watch } from 'vue'
import type { InheritedThemeAttrs, TeleportTarget } from './types/useTeleportTarget.types'

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

/** Атрибуты темы ближайших предков элемента: `data-theme` и `data-rise-theme` ищутся независимо (closest) */
export function readThemeAttrs(anchor: Element | null | undefined): InheritedThemeAttrs {
	const attrs: InheritedThemeAttrs = {}
	const mode = anchor?.closest('[data-theme]')?.getAttribute('data-theme')
	const theme = anchor?.closest('[data-rise-theme]')?.getAttribute('data-rise-theme')
	if (mode) attrs['data-theme'] = mode
	if (theme) attrs['data-rise-theme'] = theme
	return attrs
}

/**
 * Тема области якоря для телепортированной панели: и режим (`data-theme`), и тема бренда (`data-rise-theme`) —
 * меню из «фиолетовой» тёмной области открывается фиолетовым и тёмным. Читается при открытии панели.
 * На панели оба атрибута стоят на одном элементе, поэтому кит пересчитывает семантику из сидов темы.
 *
 * @example
 * const themeAttrs = useInheritedThemeAttrs(() => wrapperRef.value, () => props.isOpen)
 * // <div class="panel" v-bind="themeAttrs">
 */
export function useInheritedThemeAttrs(anchor: () => Element | null | undefined, isActive: () => boolean): Ref<InheritedThemeAttrs> {
	const attrs = ref<InheritedThemeAttrs>({})

	watch(
		isActive,
		active => {
			if (active) attrs.value = readThemeAttrs(anchor())
		},
		{ flush: 'post' },
	)
	onMounted(() => {
		if (isActive()) attrs.value = readThemeAttrs(anchor())
	})
	return attrs
}
