import { UI_COMMAND_PALETTE } from '@/locales/messages'
import { useHotkeys } from '@composables/interaction/useHotkeys'
import { useCustomClass } from '@composables/base/useCustomClass'
import { groupCommands, matchesCommand, nextEnabled } from './commands/commandSearch'
import { computed, getCurrentInstance, nextTick, onMounted, ref, shallowRef, useId, watch } from 'vue'
import type { BaseCommandPaletteEmits, BaseCommandPaletteProps, CommandItem } from '../types/BaseCommandPalette.types'

function useOpenState(props: BaseCommandPaletteProps, emit: BaseCommandPaletteEmits) {
	const isOpen = shallowRef(Boolean(props.isOpen))
	watch(
		() => props.isOpen,
		value => {
			isOpen.value = Boolean(value)
		},
	)
	const setOpen = (value: boolean): void => {
		isOpen.value = value
		emit('update:isOpen', value)
	}
	useHotkeys(() => (props.hotkey === null ? {} : { [props.hotkey ?? 'mod+k']: () => setOpen(!isOpen.value) }), {
		target: useHotkeyTarget(props),
	})
	return { isOpen, setOpen }
}

function useHotkeyTarget(props: BaseCommandPaletteProps) {
	const container = shallowRef<HTMLElement | null>(null)
	const instance = getCurrentInstance()
	onMounted(() => {
		container.value = (instance?.proxy?.$el as Node | null)?.parentElement ?? null
	})
	return (): EventTarget | null => {
		if (props.hotkeyScope === 'container') return container.value
		return typeof window === 'undefined' ? null : window
	}
}

function useCommandList(props: BaseCommandPaletteProps, isOpen: { value: boolean }) {
	const prefix = `rise-command-${useId()}`
	const query = ref('')
	const activeIndex = ref(-1)
	const groups = computed(() =>
		groupCommands(
			props.commands.filter(command => matchesCommand(command, query.value)),
			prefix,
		),
	)
	const options = computed(() => groups.value.flatMap(group => group.options))
	const activeId = computed(() => options.value[activeIndex.value]?.id)
	const moveTo = (index: number): void => {
		activeIndex.value = index
		nextTick(() => (activeId.value ? document.getElementById(activeId.value)?.scrollIntoView?.({ block: 'nearest' }) : undefined))
	}
	const reset = (): void => {
		activeIndex.value = nextEnabled(options.value, -1, 1)
	}
	watch(
		() => isOpen.value,
		value => {
			if (!value) return
			query.value = ''
			reset()
		},
		{ immediate: true },
	)
	return { prefix, query, activeIndex, groups, options, activeId, moveTo, reset }
}

export function useBaseCommandPalette(props: BaseCommandPaletteProps, emit: BaseCommandPaletteEmits) {
	const { isOpen, setOpen } = useOpenState(props, emit)
	const list = useCommandList(props, isOpen)
	const run = (command: CommandItem): void => {
		if (command.isDisabled) return
		setOpen(false)
		emit('select', command)
		command.onSelect?.()
	}
	const keyActions: Record<string, () => void> = {
		ArrowDown: () => list.moveTo(nextEnabled(list.options.value, list.activeIndex.value, 1)),
		ArrowUp: () => list.moveTo(nextEnabled(list.options.value, list.activeIndex.value, -1)),
		Home: () => list.moveTo(nextEnabled(list.options.value, -1, 1)),
		End: () => list.moveTo(nextEnabled(list.options.value, list.options.value.length, -1)),
		Enter: () => list.options.value[list.activeIndex.value] && run(list.options.value[list.activeIndex.value].command),
	}
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'input', 'option'] })
	return {
		classes,
		modalClass: computed(() => ({
			root: ['base-command-palette', classes.value.root].filter(Boolean).join(' '),
			content: 'base-command-palette__content',
			body: 'base-command-palette__body',
		})),
		isOpen,
		setOpen,
		query: list.query,
		activeIndex: list.activeIndex,
		groups: list.groups,
		activeId: list.activeId,
		listId: `${list.prefix}-list`,
		dialogLabel: computed(() => props.ariaLabel ?? UI_COMMAND_PALETTE.LABEL),
		handleInput(event: Event): void {
			list.query.value = (event.target as HTMLInputElement).value
			list.reset()
		},
		handleKeydown(event: KeyboardEvent): void {
			if (event.isComposing || !(event.key in keyActions)) return
			event.preventDefault()
			keyActions[event.key]()
		},
		setActive: (index: number): void => {
			if (!list.options.value[index].command.isDisabled) list.activeIndex.value = index
		},
		run,
	}
}
