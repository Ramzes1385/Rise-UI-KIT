/** Composable: логика DropdownMenuContent — меню по APG Menu: roving tabindex, стрелки, поиск по буквам, подменю и отметки */
import { computed, nextTick, onBeforeUnmount, ref, useId } from 'vue'
import { calcIconScale } from '@utils/iconUtils'
import { findTypeaheadIndex, toMenuGroups } from '@utils/menuUtils'
import type { ComputedRef, Ref } from 'vue'
import type { DropdownMenuItem } from '../types/BaseDropdownMenu.types'
import type { DropdownMenuContentEmits, MenuContentProps } from '../types/DropdownMenuContent.types'

/** Задержка открытия подменю и переключения между подменю при наведении, мс */
const SUBMENU_HOVER_DELAY = 120
/** Пауза, после которой набранные буквы сбрасываются, мс */
const TYPEAHEAD_RESET = 500

function keyOf(groupIndex: number, itemIndex: number): string {
	return `${groupIndex}-${itemIndex}`
}

function isCheckable(item: DropdownMenuItem): boolean {
	return item.type === 'checkbox' || item.type === 'radio'
}

function isLink(item: DropdownMenuItem): boolean {
	return Boolean(item.to || item.href)
}

function itemRole(item: DropdownMenuItem): string {
	if (item.type === 'checkbox') return 'menuitemcheckbox'
	if (item.type === 'radio') return 'menuitemradio'
	return 'menuitem'
}

/** Флажок переключается, переключатель только включается */
function updateChecked(item: DropdownMenuItem): void {
	if (item.type === 'checkbox') item.onUpdateChecked?.(!item.isChecked)
	else if (item.type === 'radio' && !item.isChecked) item.onUpdateChecked?.(true)
}

/** Элементы пунктов (для фокуса) и содержимое подменю (для фокуса на его первом пункте) по ключу пункта */
function createRegistry() {
	const itemElements = new Map<string, HTMLElement>()
	const submenuContents = new Map<string, { focusFirst: () => void }>()
	return {
		itemElements,
		submenuContents,
		/** Элемент пункта: div или корень BaseLink */
		registerItem(key: string, element: unknown): void {
			const node = element && typeof element === 'object' && '$el' in element ? (element as { $el: unknown }).$el : element
			if (node instanceof HTMLElement) itemElements.set(key, node)
			else itemElements.delete(key)
		},
		registerSubmenu(key: string, content: unknown): void {
			if (content) submenuContents.set(key, content as { focusFirst: () => void })
			else submenuContents.delete(key)
		},
	}
}

function useItemView(props: MenuContentProps, baseId: string) {
	const labelId = (groupIndex: number, itemIndex: number): string => `${baseId}-label-${keyOf(groupIndex, itemIndex)}`
	return {
		keyOf,
		isCheckable,
		isLink,
		itemRole,
		itemId: (groupIndex: number, itemIndex: number): string => `${baseId}-item-${keyOf(groupIndex, itemIndex)}`,
		labelId,
		/** Группа называется подписью, если подпись идёт первой */
		groupLabelId: (group: DropdownMenuItem[], groupIndex: number): string | undefined =>
			group[0]?.type === 'label' ? labelId(groupIndex, 0) : undefined,
		itemClasses: (item: DropdownMenuItem): (string | Record<string, boolean | undefined>)[] => [
			{ 'base-dropdown-menu__item--disabled': item.isDisabled, 'base-dropdown-menu__item--danger': item.isDanger },
			props.classes.item ?? '',
		],
		/** Props ссылки: BaseLink рендерит RouterLink приложения или `<a href>` */
		linkProps(item: DropdownMenuItem): Record<string, unknown> {
			if (!isLink(item)) return {}
			return {
				to: item.to,
				href: item.href,
				target: item.target,
				variant: 'ghost',
				isDisabled: item.isDisabled,
				sizeScale: props.sizeScale,
			}
		},
	}
}

/** Фокус по пунктам: стрелки ходят по доступным пунктам без подписей и разделителей, с переходом через край */
function useMenuNavigation(
	groups: ComputedRef<DropdownMenuItem[][]>,
	registry: ReturnType<typeof createRegistry>,
	menuRef: Ref<HTMLElement | null>,
) {
	// Пункт с tabindex="0" (roving tabindex): последний с фокусом, иначе первый доступный. Остальные — -1
	const activeKey = ref<string | null>(null)
	const navigable = computed(() =>
		groups.value.flatMap((group, groupIndex) =>
			group
				.map((item, itemIndex) => ({ item, key: keyOf(groupIndex, itemIndex) }))
				.filter(({ item }) => item.type !== 'label' && item.type !== 'separator' && !item.isDisabled),
		),
	)
	const currentIndex = (): number => navigable.value.findIndex(({ key }) => registry.itemElements.get(key) === document.activeElement)
	const focusAt = (index: number): void => {
		const entry = navigable.value[index]
		if (entry) registry.itemElements.get(entry.key)?.focus()
	}
	// Откуда отсчитывать сдвиг: от пункта в фокусе или, если его нет, из-за края списка
	const focusOrigin = (offset: number, count: number): number => {
		const index = currentIndex()
		if (index !== -1) return index
		return offset > 0 ? -1 : count
	}

	return {
		activeKey,
		navigable,
		currentIndex,
		focusAt,
		tabIndexOf: (key: string): number => (key === (activeKey.value ?? navigable.value[0]?.key) ? 0 : -1),
		/** Первый пункт — при открытии с клавиатуры (Enter, Space, стрелка вниз) */
		focusFirst: (): void => focusAt(0),
		/** Последний пункт — при открытии стрелкой вверх */
		focusLast: (): void => focusAt(navigable.value.length - 1),
		/** Само меню — при открытии мышью: стрелки начнут с первого пункта */
		focusMenu: (): void => menuRef.value?.focus(),
		moveFocus(offset: number): void {
			const count = navigable.value.length
			if (!count) return
			focusAt((focusOrigin(offset, count) + offset + count) % count)
		},
	}
}

/** Подменю: открытие кликом, стрелкой вправо или наведением с задержкой; закрытие может вернуть фокус на пункт */
function useSubmenus(registry: ReturnType<typeof createRegistry>) {
	const openSubmenu = ref<string | null>(null)
	let pointerTimer: ReturnType<typeof setTimeout> | null = null
	const clearPointerTimer = (): void => {
		if (pointerTimer) clearTimeout(pointerTimer)
		pointerTimer = null
	}
	const openSubmenuAt = async (key: string, shouldFocus: boolean): Promise<void> => {
		clearPointerTimer()
		openSubmenu.value = key
		if (!shouldFocus) return
		await nextTick()
		registry.submenuContents.get(key)?.focusFirst()
	}
	const closeSubmenu = (focusParent: boolean): void => {
		const key = openSubmenu.value
		openSubmenu.value = null
		if (focusParent && key) registry.itemElements.get(key)?.focus()
	}
	onBeforeUnmount(clearPointerTimer)

	return {
		openSubmenu,
		clearPointerTimer,
		openSubmenuAt,
		closeSubmenu,
		/** Подменю закрылось само: Escape или нажатие вне */
		handleSubmenuUpdate(isOpen: boolean): void {
			if (!isOpen) closeSubmenu(false)
		},
		/** После паузы открыть подменю под указателем (target) или закрыть открытое */
		scheduleSubmenu(target: string | null): void {
			clearPointerTimer()
			pointerTimer = setTimeout(() => {
				pointerTimer = null
				if (target) void openSubmenuAt(target, false)
				else closeSubmenu(false)
			}, SUBMENU_HOVER_DELAY)
		},
	}
}

/** Поиск пункта по первым буквам; набранное сбрасывается после паузы TYPEAHEAD_RESET */
function useTypeahead(nav: ReturnType<typeof useMenuNavigation>) {
	let typeahead = ''
	let typeaheadTimer: ReturnType<typeof setTimeout> | null = null
	onBeforeUnmount(() => {
		if (typeaheadTimer) clearTimeout(typeaheadTimer)
	})

	return {
		isTyping: (): boolean => typeahead !== '',
		handleTypeahead(char: string): void {
			typeahead += char
			if (typeaheadTimer) clearTimeout(typeaheadTimer)
			typeaheadTimer = setTimeout(() => {
				typeahead = ''
				typeaheadTimer = null
			}, TYPEAHEAD_RESET)
			const labels = nav.navigable.value.map(({ item }) => item.label ?? '')
			const index = findTypeaheadIndex(labels, typeahead, nav.currentIndex())
			if (index !== -1) nav.focusAt(index)
		},
	}
}

/** Выбор пунктов; клавиша активации запоминается: Enter закрывает меню и на флажке, Space и клик — нет */
function useActivation(
	emit: DropdownMenuContentEmits,
	nav: ReturnType<typeof useMenuNavigation>,
	parts: { registry: ReturnType<typeof createRegistry>; submenus: ReturnType<typeof useSubmenus> },
) {
	let activationKey: string | null = null
	return {
		activateCurrent(key: string): void {
			const entry = nav.navigable.value[nav.currentIndex()]
			if (!entry) return
			activationKey = key
			parts.registry.itemElements.get(entry.key)?.click()
			activationKey = null
		},
		handleSubmenuClick(item: DropdownMenuItem, key: string): void {
			const byKeyboard = activationKey !== null
			activationKey = null
			if (item.isDisabled) return
			if (parts.submenus.openSubmenu.value === key && !byKeyboard) parts.submenus.closeSubmenu(false)
			else void parts.submenus.openSubmenuAt(key, byKeyboard)
		},
		handleItemClick(item: DropdownMenuItem, event: Event): void {
			const key = activationKey
			activationKey = null
			if (item.isDisabled) {
				event.preventDefault()
				return
			}
			updateChecked(item)
			item.onSelect?.(event)
			emit('select', item, event, !isCheckable(item) || key === 'Enter')
		},
	}
}

/** Наведение мышью: пункт получает фокус (стрелки продолжат от него), подменю открывается с задержкой */
function createPointerMove(registry: ReturnType<typeof createRegistry>, submenus: ReturnType<typeof useSubmenus>) {
	const focusUnderPointer = (item: DropdownMenuItem, key: string): void => {
		const element = registry.itemElements.get(key)
		if (!item.isDisabled && element && document.activeElement !== element) element.focus({ preventScroll: true })
	}
	return (item: DropdownMenuItem, key: string, event: PointerEvent): void => {
		if (event.pointerType && event.pointerType !== 'mouse') return
		focusUnderPointer(item, key)
		const target = item.children?.length && !item.isDisabled ? key : null
		if (target === submenus.openSubmenu.value) {
			submenus.clearPointerTimer()
			return
		}
		submenus.scheduleSubmenu(target)
	}
}

/** Клавиши меню; false — клавиша не обработана и не отменяется */
function createKeyActions(
	props: MenuContentProps,
	emit: DropdownMenuContentEmits,
	ctx: {
		nav: ReturnType<typeof useMenuNavigation>
		submenus: ReturnType<typeof useSubmenus>
		typeahead: ReturnType<typeof useTypeahead>
		activation: ReturnType<typeof useActivation>
	},
): Map<string, (entry: { item: DropdownMenuItem; key: string } | undefined) => boolean> {
	const { nav, submenus, typeahead, activation } = ctx
	const handled = (action: () => void) => (): boolean => {
		action()
		return true
	}
	return new Map<string, (entry: { item: DropdownMenuItem; key: string } | undefined) => boolean>([
		['ArrowDown', handled(() => nav.moveFocus(1))],
		['ArrowUp', handled(() => nav.moveFocus(-1))],
		['Home', handled(nav.focusFirst)],
		['PageUp', handled(nav.focusFirst)],
		['End', handled(nav.focusLast)],
		['PageDown', handled(nav.focusLast)],
		[
			'ArrowRight',
			entry => {
				if (!entry?.item.children?.length) return false
				void submenus.openSubmenuAt(entry.key, true)
				return true
			},
		],
		[
			'ArrowLeft',
			() => {
				if (props.level === 0) return false
				emit('back')
				return true
			},
		],
		['Enter', handled(() => activation.activateCurrent('Enter'))],
		// Пробел внутри набираемого слова — часть поиска, иначе — выбор пункта
		[' ', handled(() => (typeahead.isTyping() ? typeahead.handleTypeahead(' ') : activation.activateCurrent(' ')))],
		// Меню не входит в порядок Tab: фокус остаётся в меню до выбора или Escape
		['Tab', () => true],
	])
}

export function useDropdownMenuContent(props: MenuContentProps, emit: DropdownMenuContentEmits) {
	const baseId = useId()
	const menuRef = ref<HTMLElement | null>(null)
	const groups = computed(() => toMenuGroups(props.items))
	const registry = createRegistry()
	const nav = useMenuNavigation(groups, registry, menuRef)
	const submenus = useSubmenus(registry)
	const typeahead = useTypeahead(nav)
	const activation = useActivation(emit, nav, { registry, submenus })
	const keyActions = createKeyActions(props, emit, { nav, submenus, typeahead, activation })

	return {
		menuRef,
		groups,
		iconScale: computed(() => calcIconScale('sm', props.sizeScale)),
		// Колонка отметок нужна, если в меню есть флажок или переключатель: подписи пунктов выравниваются
		hasIndicators: computed(() => groups.value.some(group => group.some(isCheckable))),
		...useItemView(props, baseId),
		registerItem: registry.registerItem,
		registerSubmenu: registry.registerSubmenu,
		activeKey: nav.activeKey,
		tabIndexOf: nav.tabIndexOf,
		openSubmenu: submenus.openSubmenu,
		clearPointerTimer: submenus.clearPointerTimer,
		closeSubmenu: submenus.closeSubmenu,
		handleSubmenuUpdate: submenus.handleSubmenuUpdate,
		handleSubmenuClick: activation.handleSubmenuClick,
		handleItemClick: activation.handleItemClick,
		handleNestedSelect(item: DropdownMenuItem, event: Event, shouldClose: boolean): void {
			if (shouldClose) submenus.closeSubmenu(false)
			emit('select', item, event, shouldClose)
		},
		handlePointerMove: createPointerMove(registry, submenus),
		handleKeydown(event: KeyboardEvent): void {
			// Клавиши из поля ввода внутри пункта — не для меню
			if (event.defaultPrevented) return
			const action = keyActions.get(event.key)
			if (action) {
				if (!action(nav.navigable.value[nav.currentIndex()])) return
			} else {
				if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return
				typeahead.handleTypeahead(event.key)
			}
			event.preventDefault()
		},
		exposed: { focusFirst: nav.focusFirst, focusLast: nav.focusLast, focusMenu: nav.focusMenu },
	}
}
