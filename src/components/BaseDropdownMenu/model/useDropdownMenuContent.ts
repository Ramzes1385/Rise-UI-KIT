import type { ComputedRef, Ref } from 'vue'
import { calcIconScale } from '@utils/iconUtils'
import { findTypeaheadIndex, toMenuGroups } from '@utils/menuUtils'
import { computed, nextTick, onBeforeUnmount, ref, useId } from 'vue'
import type { DropdownMenuItem } from '../types/BaseDropdownMenu.types'
import type { DropdownMenuContentEmits, MenuContentProps } from '../types/DropdownMenuContent.types'

const SUBMENU_HOVER_DELAY = 120
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

function updateChecked(item: DropdownMenuItem): void {
	if (item.type === 'checkbox') item.onUpdateChecked?.(!item.isChecked)
	else if (item.type === 'radio' && !item.isChecked) item.onUpdateChecked?.(true)
}

function createRegistry() {
	const itemElements = new Map<string, HTMLElement>()
	const submenuContents = new Map<string, { focusFirst: () => void }>()
	return {
		itemElements,
		submenuContents,
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
		groupLabelId: (group: DropdownMenuItem[], groupIndex: number): string | undefined =>
			group[0]?.type === 'label' ? labelId(groupIndex, 0) : undefined,
		itemClasses: (item: DropdownMenuItem): (string | Record<string, boolean | undefined>)[] => [
			{ 'base-dropdown-menu__item--disabled': item.isDisabled, 'base-dropdown-menu__item--danger': item.isDanger },
			props.classes.item ?? '',
		],
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

function useMenuNavigation(
	groups: ComputedRef<DropdownMenuItem[][]>,
	registry: ReturnType<typeof createRegistry>,
	menuRef: Ref<HTMLElement | null>,
) {
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
		focusFirst: (): void => focusAt(0),
		focusLast: (): void => focusAt(navigable.value.length - 1),
		focusMenu: (): void => menuRef.value?.focus(),
		moveFocus(offset: number): void {
			const count = navigable.value.length
			if (!count) return
			focusAt((focusOrigin(offset, count) + offset + count) % count)
		},
	}
}

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
		handleSubmenuUpdate(isOpen: boolean): void {
			if (!isOpen) closeSubmenu(false)
		},
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
		[' ', handled(() => (typeahead.isTyping() ? typeahead.handleTypeahead(' ') : activation.activateCurrent(' ')))],
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
