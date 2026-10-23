import { afterEach, vi } from 'vitest'
import { useSortable } from '../useSortable'
import { defineComponent, h, ref } from 'vue'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import type { UseSortableOptions, UseSortableReturn } from '../types/useSortable.types'

enableAutoUnmount(afterEach)

export interface Item {
	id: string
	title: string
}

export const ITEMS: Item[] = [
	{ id: 'a', title: 'Альфа' },
	{ id: 'b', title: 'Бета' },
	{ id: 'c', title: 'Гамма' },
]

export function sortableOptions(overrides: Partial<UseSortableOptions<Item, number>> = {}): UseSortableOptions<Item, number> {
	return {
		rootRef: ref<HTMLElement | null>(null),
		itemId: item => item.id,
		isDisabled: () => false,
		locate: id => ITEMS.findIndex(item => item.id === id),
		isSamePlace: (a, b) => a === b,
		stepPlace: vi.fn((_id: string, key: string) => (key === 'ArrowDown' ? 2 : null)),
		dropPlace: vi.fn(() => null),
		itemElement: () => null,
		onStart: vi.fn(),
		onPreview: vi.fn(),
		onDrop: vi.fn(),
		onCancel: vi.fn(),
		onAnnounce: vi.fn(),
		focusItem: vi.fn(),
		...overrides,
	}
}

export function mountSortable(options: UseSortableOptions<Item, number>) {
	let sortable = {} as UseSortableReturn<Item>
	const wrapper = mount(
		defineComponent({
			setup() {
				sortable = useSortable(options)
				return () => h('div')
			},
		}),
	)
	return { sortable, wrapper }
}

export const key = (name: string, init: ConstructorParameters<typeof KeyboardEvent>[1] = {}) =>
	new KeyboardEvent('keydown', { key: name, cancelable: true, ...init })

export const pointer = (type: string, [x, y]: number[], init: ConstructorParameters<typeof PointerEvent>[1] = {}) =>
	new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, pointerType: 'mouse', ...init })

export const rect = ([left, top, width, height]: number[]) =>
	({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top }) as DOMRect
