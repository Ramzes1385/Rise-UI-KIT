import { nextTick, ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_TRANSFER } from '@/locales/messages'
import { otherSide, titleOf } from './transferSides'
import { resolveArrowKey } from '@utils/dom/directionUtils'
import type { BaseListExpose, ListItem } from '@components/BaseList'
import type { BaseTransferEmits, TransferPanelsState, TransferProps, TransferSide } from '../types/BaseTransfer.types'

const KEY_TARGETS: Record<string, TransferSide> = { ArrowRight: 'target', ArrowLeft: 'source' }

function useTransferAnnounce() {
	const announcement = ref('')
	return {
		announcement,
		announce(text: string): void {
			announcement.value = ''
			nextTick(() => (announcement.value = text))
		},
	}
}

function useTransferFocus<T extends ListItem>(state: TransferPanelsState<T>, lists: Record<TransferSide, BaseListExpose | null>) {
	return (from: TransferSide, moved: string[], index: number | null): void => {
		nextTick(() => {
			const rest = state.shown(from)
			if (index !== null && rest.length) return lists[from]?.focusItem(rest[Math.min(index, rest.length - 1)].id)
			const to = otherSide(from)
			const landed = state.shown(to).find(item => moved.includes(item.id))
			if (landed) return lists[to]?.focusItem(landed.id)
			if (rest.length) lists[from]?.focusItem(rest[0].id)
		})
	}
}

export function useTransferMove<T extends ListItem>(props: TransferProps<T>, emit: BaseTransferEmits, state: TransferPanelsState<T>) {
	const lists: Record<TransferSide, BaseListExpose | null> = { source: null, target: null }
	const { announcement, announce } = useTransferAnnounce()
	const focusAfter = useTransferFocus(state, lists)
	const transfer = (to: TransferSide, ids?: string[]): string[] => {
		const from = otherSide(to)
		const wanted = new Set(ids ?? state.checkedShown(from).map(item => item.id))
		const moved = state.sideItems.value[from].filter(item => wanted.has(item.id) && !item.isDisabled).map(item => item.id)
		if (props.isDisabled || !moved.length) return []
		const value = to === 'target' ? [...props.modelValue, ...moved] : props.modelValue.filter(id => !moved.includes(id))
		state.checked.value[from] = state.checked.value[from].filter(id => !moved.includes(id))
		emit('update:modelValue', value)
		emit('change', { to, ids: moved })
		announce(formatMessage(UI_TRANSFER.MOVED, { list: titleOf(props, to), count: moved.length }))
		return moved
	}
	return {
		announcement,
		transfer,
		setListRef(side: TransferSide, list: unknown): void {
			lists[side] = list as BaseListExpose | null
		},
		handleMoveClick(to: TransferSide): void {
			focusAfter(otherSide(to), transfer(to), null)
		},
		handleListKeydown(event: KeyboardEvent, side: TransferSide): void {
			const to = KEY_TARGETS[resolveArrowKey(event)]
			if (!(event.ctrlKey || event.altKey) || !to || to === side) return
			event.preventDefault()
			const row = (event.target as HTMLElement).closest<HTMLElement>('[data-list-index]')
			const moved = transfer(to)
			if (moved.length) focusAfter(side, moved, row ? Number(row.dataset.listIndex) : null)
		},
	}
}
