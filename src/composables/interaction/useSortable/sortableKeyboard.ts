/** Composable: перестановка с клавиатуры — пробел берёт, стрелки двигают, пробел или Enter кладут, Escape отменяет */
import { computed, shallowRef } from 'vue'
import type { SortableMove, UseSortableOptions } from './types/useSortable.types'

const DEFAULT_MOVE_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']

const ACTION_KEYS = new Set([' ', 'Enter', 'Escape'])

/** Захват с клавиатуры: взятый элемент, шаг клавишей, бросок и отмена */
export function useSortableKeyboard<TItem, TPlace>(options: UseSortableOptions<TItem, TPlace>) {
	const grabbed = shallowRef<SortableMove<TPlace> | null>(null)
	const moveKeys = new Set(options.moveKeys ?? DEFAULT_MOVE_KEYS)
	const drop = (): void => {
		grabbed.value = null
	}
	const release = (id: string) => (): void => {
		drop()
		options.focusItem(id)
	}
	const step = (key: string, id: string): void => {
		const place = options.stepPlace(id, key)
		if (!place) return
		options.onPreview(id, place)
		options.onAnnounce('MOVED', id)
		options.focusItem(id)
	}
	const handleKey = (event: KeyboardEvent, current: SortableMove<TPlace>): void => {
		if (event.key === 'Tab') options.onCancel(current.id, drop)
		if (!moveKeys.has(event.key) && !ACTION_KEYS.has(event.key)) return
		event.preventDefault()
		if (event.key === 'Escape') options.onCancel(current.id, release(current.id))
		else if (event.key === ' ' || event.key === 'Enter') options.onDrop(current, release(current.id))
		else step(event.key, current.id)
	}
	return {
		grabbedId: computed(() => grabbed.value?.id ?? null),
		grab(item: TItem): void {
			const id = options.itemId(item)
			const origin = options.locate(id)
			if (options.isDisabled() || origin === null) return
			grabbed.value = { id, origin }
			options.onStart(id, 'keyboard')
			options.onAnnounce('PICKED', id)
		},
		handleGrabbedKeydown(event: KeyboardEvent): boolean {
			if (!grabbed.value) return false
			handleKey(event, grabbed.value)
			return true
		},
	}
}
