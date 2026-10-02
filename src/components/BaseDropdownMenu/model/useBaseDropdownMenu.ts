import type { ComputedRef, Ref } from 'vue'
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useCustomClass } from '@composables/base/useCustomClass'
import type DropdownMenuContent from '../ui/DropdownMenuContent.vue'
import { useTriggerAttributes } from '@composables/overlay/useTriggerAttributes'
import type { BaseDropdownMenuEmits, BaseDropdownMenuProps, DropdownMenuItem, FocusTarget } from '../types/BaseDropdownMenu.types'

const FALLBACK_TRIGGER_ATTRIBUTES = { role: 'button', tabindex: '0' }

function focusTargetFor(key: string): FocusTarget | null {
	if (['Enter', ' ', 'ArrowDown'].includes(key)) return 'first'
	if (key === 'ArrowUp') return 'last'
	return null
}

function useMenuOpen(props: BaseDropdownMenuProps, emit: BaseDropdownMenuEmits) {
	const isOpenLocal = ref(props.isOpen ?? false)
	let pendingFocus: FocusTarget = 'menu'

	watch(
		() => props.isOpen,
		isOpen => {
			if (isOpen !== undefined) isOpenLocal.value = isOpen
		},
	)

	return {
		isOpenLocal,
		getPendingFocus: (): FocusTarget => pendingFocus,
		setOpen(value: boolean, focus: FocusTarget = 'menu'): void {
			if (value === isOpenLocal.value) return
			pendingFocus = focus
			isOpenLocal.value = value
			emit('update:isOpen', value)
			if (!value) emit('close')
		},
	}
}

function useMenuTrigger(isOpenState: ComputedRef<boolean>, menuId: string) {
	const triggerRef = ref<HTMLElement | null>(null)
	const triggerAttributes = computed(() => ({
		'aria-haspopup': 'menu',
		'aria-expanded': isOpenState.value ? 'true' : 'false',
		'aria-controls': isOpenState.value ? menuId : undefined,
	}))
	const { triggerId, getTrigger } = useTriggerAttributes(
		() => triggerRef.value,
		() => triggerAttributes.value,
		{ withId: true, fallbackAttributes: FALLBACK_TRIGGER_ATTRIBUTES },
	)
	return { triggerRef, triggerAttributes, triggerId, getTrigger }
}

function useMenuFocus(
	isOpen: Ref<boolean>,
	contentRef: Ref<InstanceType<typeof DropdownMenuContent> | null>,
	getPendingFocus: () => FocusTarget,
): void {
	watch(isOpen, async value => {
		if (!value) return
		await nextTick()
		const content = contentRef.value
		const focus = getPendingFocus()
		if (focus === 'first') content?.focusFirst()
		else if (focus === 'last') content?.focusLast()
		else content?.focusMenu()
	})
}

export function useBaseDropdownMenu(props: BaseDropdownMenuProps, emit: BaseDropdownMenuEmits) {
	const { classes } = useCustomClass({
		getClass: () => props.customClass,
		elementKeys: ['root', 'trigger', 'panel', 'item', 'label', 'separator'],
	})
	const menuId = `rise-menu-${useId()}`
	const contentRef = ref<InstanceType<typeof DropdownMenuContent> | null>(null)
	const { isOpenLocal, getPendingFocus, setOpen } = useMenuOpen(props, emit)
	const isOpenState = computed(() => isOpenLocal.value)
	const trigger = useMenuTrigger(isOpenState, menuId)
	useMenuFocus(isOpenLocal, contentRef, getPendingFocus)

	return {
		classes,
		rootClass: computed((): string => ['base-dropdown-menu', classes.value.root].filter(Boolean).join(' ')),
		menuId,
		contentRef,
		isOpenState,
		...trigger,
		setOpen,
		handleTriggerClick: (): void => setOpen(!isOpenLocal.value),
		handleTriggerKeydown(event: KeyboardEvent): void {
			const focus = focusTargetFor(event.key)
			if (!focus) return
			event.preventDefault()
			if (!isOpenLocal.value) {
				setOpen(true, focus)
				return
			}
			if (focus === 'first') contentRef.value?.focusFirst()
			else contentRef.value?.focusLast()
		},
		handleSelect(item: DropdownMenuItem, event: Event, shouldClose: boolean): void {
			emit('select', item, event)
			if (!shouldClose && !(props.closeOnCheck && (item.type === 'radio' || item.type === 'checkbox'))) return
			setOpen(false)
			trigger.getTrigger()?.focus()
		},
		exposed: {
			open: (focus: FocusTarget = 'first') => setOpen(true, focus),
			close: () => setOpen(false),
		},
	}
}
