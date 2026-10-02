/** Composable: перестановка элементов мышью и с клавиатуры (WCAG 2.5.7) с объявлениями и анимацией */
import { useSortableFlip } from './sortableFlip'
import { useSortablePointer } from './sortablePointer'
import { useSortableKeyboard } from './sortableKeyboard'
import type { UseSortableOptions, UseSortableReturn } from './types/useSortable.types'

/**
 * Перестановка элементов: мышью (порог 5 px, «призрак» под курсором, Escape отменяет) и с клавиатуры
 * (пробел берёт, стрелки двигают, пробел или Enter кладут, Escape отменяет) — альтернатива перетаскиванию по WCAG 2.5.7.
 * Каждый шаг объявляется через `onAnnounce`. Место (`TPlace`) и черновик порядка ведёт вызывающий код.
 *
 * @example
 * ```ts
 * const sortable = useSortable<Item, number>({
 *   rootRef,
 *   itemId: item => item.id,
 *   isDisabled: () => props.isDisabled,
 *   locate: id => shown.value.findIndex(item => item.id === id),
 *   isSamePlace: (a, b) => a === b,
 *   stepPlace: (id, key) => (key === 'ArrowUp' ? index(id) - 1 : index(id) + 1),
 *   dropPlace: point => indexUnder(point),
 *   itemElement: id => rootRef.value?.querySelector(`[data-id="${id}"]`) ?? null,
 *   onStart: () => (draft.value = [...items.value]),
 *   onPreview: (id, index) => (draft.value = moveTo(draft.value, id, index)),
 *   onDrop: (move, done) => { commit(); done() },
 *   onCancel: (id, done) => { draft.value = null; done() },
 *   onAnnounce: (message, id) => say(message, id),
 *   focusItem: id => focus(id),
 * })
 * ```
 */
export function useSortable<TItem, TPlace>(options: UseSortableOptions<TItem, TPlace>): UseSortableReturn<TItem> {
	const keyboard = useSortableKeyboard(options)
	const pointer = useSortablePointer(options)
	if (options.flip) useSortableFlip(options.rootRef, options.flip)
	return { ...keyboard, ...pointer }
}
