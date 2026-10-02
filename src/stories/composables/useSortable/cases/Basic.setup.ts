import { computed, nextTick, ref, useTemplateRef } from 'vue'
import { useSortable, type SortableAnnouncement, type SortablePoint } from '@composables/interaction/useSortable'

interface Step {
	id: string
	title: string
}

const STEP_KEYS: Record<string, (index: number, last: number) => number> = {
	ArrowUp: index => index - 1,
	ArrowDown: index => index + 1,
	Home: () => 0,
	End: (_, last) => last,
}

export function setup() {
	const steps = ref<Step[]>([
		{ id: 'brief', title: 'Бриф' },
		{ id: 'design', title: 'Дизайн' },
		{ id: 'code', title: 'Код' },
		{ id: 'release', title: 'Выпуск' },
	])
	const draft = ref<Step[] | null>(null)
	const shown = computed(() => draft.value ?? steps.value)
	const message = ref('')
	const rootRef = useTemplateRef<HTMLElement>('root')

	const indexOf = (id: string): number => shown.value.findIndex(step => step.id === id)
	const titleOf = (id: string): string => shown.value[indexOf(id)]?.title ?? ''
	const element = (id: string): HTMLElement | null => rootRef.value?.querySelector<HTMLElement>(`[data-step-id="${id}"]`) ?? null

	function moveTo(id: string, index: number): void {
		const step = shown.value[indexOf(id)]
		const rest = shown.value.filter(item => item.id !== id)
		draft.value = [...rest.slice(0, index), step, ...rest.slice(index)]
	}

	function stepPlace(id: string, key: string): number | null {
		const index = indexOf(id)
		const next = STEP_KEYS[key]?.(index, shown.value.length - 1) ?? index
		return next < 0 || next >= shown.value.length || next === index ? null : next
	}

	function dropPlace(point: SortablePoint): number | null {
		const rows = [...(rootRef.value?.querySelectorAll<HTMLElement>('[data-step-id]') ?? [])]
		const index = rows.findIndex(row => point.y < row.getBoundingClientRect().bottom)
		return index === -1 ? rows.length - 1 : index
	}

	function announce(kind: SortableAnnouncement, id: string): void {
		const place = `место ${indexOf(id) + 1} из ${shown.value.length}`
		message.value = kind === 'PICKED' ? `«${titleOf(id)}» взят, ${place}` : place
	}

	const { grabbedId, drag, ghostRef, ghostStyle, grab, handleGrabbedKeydown, handlePointerDown, consumeClick } = useSortable<
		Step,
		number
	>({
		rootRef,
		itemId: step => step.id,
		isDisabled: () => false,
		locate: id => (indexOf(id) === -1 ? null : indexOf(id)),
		isSamePlace: (a, b) => a === b,
		stepPlace,
		dropPlace,
		itemElement: element,
		onStart: () => (draft.value = [...steps.value]),
		onPreview: moveTo,
		onDrop: (move, done) => {
			message.value = `«${titleOf(move.id)}» на месте ${indexOf(move.id) + 1} из ${shown.value.length}`
			steps.value = shown.value
			draft.value = null
			done()
		},
		onCancel: (id, done) => {
			draft.value = null
			message.value = `Отменено, «${titleOf(id)}» на прежнем месте`
			done()
		},
		onAnnounce: announce,
		focusItem: id => nextTick(() => element(id)?.focus()),
		flip: { source: () => shown.value, items: { selector: '[data-step-id]', key: 'stepId' } },
	})

	function handleKeydown(event: KeyboardEvent, step: Step): void {
		if (handleGrabbedKeydown(event) || event.key !== ' ') return
		event.preventDefault()
		grab(step)
	}

	function handleClick(step: Step): void {
		if (!consumeClick()) message.value = `Открыт шаг «${step.title}»`
	}

	return { shown, message, grabbedId, drag, ghostRef, ghostStyle, handleKeydown, handlePointerDown, handleClick }
}
