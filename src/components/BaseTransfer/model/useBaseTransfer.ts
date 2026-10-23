import { ref, useId } from 'vue'
import { titleOf } from './transferSides'
import { formatMessage } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import { UI_TRANSFER } from '@/locales/messages'
import { useTransferMove } from './useTransferMove'
import type { ListItem } from '@components/BaseList'
import { useTransferMotion } from './useTransferMotion'
import { useTransferChecks, useTransferPanels } from './useTransferPanels'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseTransferEmits, BaseTransferExpose, TransferPanel, TransferProps, TransferSide } from '../types/BaseTransfer.types'

const TRANSFER_ELEMENTS = ['root', 'label', 'panel', 'header', 'list', 'actions', 'error']

function useTransferIds<T extends ListItem>(props: TransferProps<T>) {
	const id = `rise-transfer-${useId()}`
	const ids = { label: `${id}-label`, error: `${id}-error` }
	return {
		ids,
		titleId: (side: TransferSide): string => `${id}-${side}-title`,
		hintId: (side: TransferSide): string => `${id}-${side}-hint`,
		describedBy: (side: TransferSide): string => [`${id}-${side}-hint`, props.error ? ids.error : ''].filter(Boolean).join(' '),
	}
}

export function useBaseTransfer<T extends ListItem>(props: TransferProps<T>, emit: BaseTransferEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const state = useTransferPanels(props)
	const checks = useTransferChecks(props, state)
	const move = useTransferMove(props, emit, state)
	useTransferMotion(props, rootRef)
	const exposed: BaseTransferExpose = {
		transfer: (to, ids) => {
			move.transfer(to, ids)
		},
	}
	return {
		...useStandardBaseComponent('base-transfer', props, TRANSFER_ELEMENTS),
		ui: useUi(props, 'base-transfer'),
		rootRef,
		...useTransferIds(props),
		panels: checks.panels,
		filterOf: state.search.filterOf,
		setQuery: state.search.setQuery,
		setChecked: checks.setChecked,
		toggleAll: checks.toggleAll,
		canMove: (to: TransferSide): boolean => !props.isDisabled && state.checkedShown(to === 'target' ? 'source' : 'target').length > 0,
		reorder(items: T[]): void {
			const known = new Set(props.items.map(item => item.id))
			emit('update:modelValue', [...items.map(item => item.id), ...props.modelValue.filter(id => !known.has(id))])
		},
		formatCount: (panel: TransferPanel<T>): string =>
			formatMessage(UI_TRANSFER.COUNT, { checked: panel.checkedShownCount, total: panel.shownCount }),
		formatSearchLabel: (panel: TransferPanel<T>): string => formatMessage(UI_TRANSFER.SEARCH_IN, { list: panel.title }),
		formatMoveLabel: (to: TransferSide): string => formatMessage(UI_TRANSFER.MOVE_TO, { list: titleOf(props, to) }),
		announcement: move.announcement,
		setListRef: move.setListRef,
		handleMoveClick: move.handleMoveClick,
		handleListKeydown: move.handleListKeydown,
		exposed,
	}
}
