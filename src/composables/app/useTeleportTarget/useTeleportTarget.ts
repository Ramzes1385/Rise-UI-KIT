import type { InjectionKey, Ref } from 'vue'
import type { InheritedThemeAttrs, TeleportTarget } from './types/useTeleportTarget.types'
/** Composable: куда телепортируются окна, панели и тултипы, и какую тему они наследуют */
import { getCurrentInstance, hasInjectionContext, inject, onMounted, ref, watch } from 'vue'

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

const INHERITED_ATTRS = ['data-theme', 'data-rise-theme', 'data-rise-motion'] as const

/**
 * Атрибуты области ближайших предков элемента: `data-theme`, `data-rise-theme` и пресет движения `data-rise-motion`
 * ищутся независимо (closest); `dir` — только если направление письма якоря отличается от направления страницы
 */
export function readThemeAttrs(anchor: Element | null | undefined): InheritedThemeAttrs {
	const attrs: InheritedThemeAttrs = {}
	for (const name of INHERITED_ATTRS) {
		const value = anchor?.closest(`[${name}]`)?.getAttribute(name)
		if (value) attrs[name] = value
	}
	const dir = readDirection(anchor)
	if (dir) attrs.dir = dir
	return attrs
}

/** Направление якоря, если оно отличается от направления страницы: панель в `body` не видит `dir` блока, из которого открыта */
function readDirection(anchor: Element | null | undefined): 'ltr' | 'rtl' | undefined {
	if (!anchor) return undefined
	const own = getComputedStyle(anchor).direction
	if (own !== 'ltr' && own !== 'rtl') return undefined
	return own === getComputedStyle(document.documentElement).direction ? undefined : own
}

/**
 * Тема области якоря для телепортированной панели: режим (`data-theme`), тема бренда (`data-rise-theme`) и пресет
 * движения (`data-rise-motion`) — меню из «фиолетовой» тёмной области со спокойным движением открывается фиолетовым,
 * тёмным и спокойным. Читается при открытии панели.
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

/**
 * Тема области для компонента, у которого корень — `<Teleport>` (окно, шторка, уведомления, тур): якорь — родитель
 * места компонента в разметке (Vue оставляет там метку телепорта). Читается при открытии.
 *
 * @example
 * const themeAttrs = useOwnThemeAttrs(() => props.isOpen)
 * // <Teleport><div class="base-modal" v-bind="themeAttrs">
 */
export function useOwnThemeAttrs(isActive: () => boolean): Ref<InheritedThemeAttrs> {
	const instance = getCurrentInstance()
	return useInheritedThemeAttrs(() => (instance?.proxy?.$el as Node | null | undefined)?.parentElement, isActive)
}
