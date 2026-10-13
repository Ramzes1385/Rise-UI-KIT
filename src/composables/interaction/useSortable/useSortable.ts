/** Composable: перестановка элементов мышью и с клавиатуры (WCAG 2.5.7) с объявлениями и анимацией */

import { useSortableFlip } from './sortableFlip'
import { useSortablePointer } from './sortablePointer'
import { useMotion } from '@composables/app/useMotion'
import { useSortableKeyboard } from './sortableKeyboard'
import type { UseSortableOptions, UseSortableReturn } from './types/useSortable.types'

/**
 * Перестановка элементов: мышью (порог 5 px, «призрак» под курсором, Escape отменяет) и с клавиатуры
 * (пробел берёт, стрелки двигают, пробел или Enter кладут, Escape отменяет) — альтернатива перетаскиванию по WCAG 2.5.7.
 * Каждый шаг объявляется через `onAnnounce`. Место (`TPlace`) и черновик порядка ведёт вызывающий код.
 *
 * @example
 * ```ts
 * const index = (id: string): number => items.value.findIndex(item => item.id === id)
 * const sortable = useSortable<Item, number>({
 *   rootRef,
 *   itemId: item => item.id,
 *   isDisabled: () => props.isDisabled,
 *   locate: id => (index(id) < 0 ? null : index(id)),
 *   isSamePlace: (a, b) => a === b,
 *   stepPlace: (id, key) => {
 *     const next = index(id) + (key === 'ArrowUp' ? -1 : 1)
 *     return next < 0 || next >= items.value.length ? null : next
 *   },
 *   dropPlace: point => indexUnder(point),
 *   itemElement: id => rootRef.value?.querySelector<HTMLElement>(`[data-id="${id}"]`) ?? null,
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
	const motion = useMotion(options.rootRef)
	const pointer = useSortablePointer(options, motion.isReduced)
	if (options.flip) useSortableFlip(options.rootRef, options.flip, motion)
	return { ...keyboard, ...pointer }
}
