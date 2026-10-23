import { formatMessage } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import { UI_CHECKLIST } from '@/locales/messages'
import { computed, shallowRef, useId, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseChecklistEmits, BaseChecklistProps, ChecklistItem, ChecklistRow } from '../types/BaseChecklist.types'

function useCompleted(props: BaseChecklistProps, emit: BaseChecklistEmits) {
	const completed = shallowRef<readonly string[]>(props.completed ?? [])
	watch(
		() => props.completed,
		ids => {
			completed.value = ids ?? []
		},
	)
	return {
		isDone: (itemId: string): boolean => completed.value.includes(itemId),
		toggle(itemId: string): void {
			const ids = completed.value
			const next = ids.includes(itemId) ? ids.filter(id => id !== itemId) : [...ids, itemId]
			completed.value = next
			emit('update:completed', next)
		},
	}
}

function row(item: ChecklistItem, context: { prefix: string; index: number; isDone: boolean; isNext: boolean }): ChecklistRow {
	const base = `${context.prefix}-${context.index}`
	const described = [item.description ? `${base}-description` : '', context.isNext ? `${base}-next` : ''].filter(Boolean)
	return {
		item,
		isDone: context.isDone,
		isNext: context.isNext,
		checkboxId: `${base}-checkbox`,
		describedBy: described.length ? described.join(' ') : undefined,
		descriptionId: `${base}-description`,
		nextId: `${base}-next`,
	}
}

function holdLeavingPlace(element: Element): void {
	const item = element as HTMLElement
	item.style.left = `${item.offsetLeft}px`
	item.style.top = `${item.offsetTop}px`
	item.style.width = `${item.offsetWidth}px`
}

export function useBaseChecklist(props: BaseChecklistProps, emit: BaseChecklistEmits) {
	const prefix = `rise-checklist-${useId()}`
	const { isDone, toggle } = useCompleted(props, emit)
	const nextItem = computed(() => props.items.find(item => !isDone(item.id)))
	const doneCount = computed(() => props.items.filter(item => isDone(item.id)).length)
	return {
		...useStandardBaseComponent('base-checklist', props, ['root', 'item']),
		ui: useUi(props, 'base-checklist'),
		holdLeavingPlace,
		titleId: `${prefix}-title`,
		heading: computed(() => props.title ?? UI_CHECKLIST.TITLE),
		doneCount,
		progressText: computed(() => formatMessage(UI_CHECKLIST.PROGRESS, { done: doneCount.value, total: props.items.length })),
		isComplete: computed(() => props.items.length > 0 && !nextItem.value),
		rows: computed(() =>
			props.items.map((item, index) => row(item, { prefix, index, isDone: isDone(item.id), isNext: item === nextItem.value })),
		),
		toggle,
		runAction: (item: ChecklistItem): void => emit('action', item),
	}
}
