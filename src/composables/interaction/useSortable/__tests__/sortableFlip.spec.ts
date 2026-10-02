import { mount } from '@vue/test-utils'
import { rect } from './sortableHarness'
import { useSortableFlip } from '../sortableFlip'
import { defineComponent, h, nextTick, ref, type Ref } from 'vue'
import type { SortableFlipOptions } from '../types/useSortable.types'

type Board = Record<string, string[]>

const ITEMS = { selector: '[data-item]', key: 'item' }

const CONTAINERS = { selector: '[data-col]', key: 'col' }

function layout(this: HTMLElement): DOMRect {
	const parent = this.parentElement as HTMLElement
	const siblings = [...parent.children]
	if (this.dataset.col) return rect([siblings.indexOf(this) * 100, 0, 100, this.children.length * 50])
	if (this.dataset.item)
		return rect([[...(parent.parentElement as HTMLElement).children].indexOf(parent) * 100, siblings.indexOf(this) * 50, 100, 40])
	return rect([0, 0, 0, 0])
}

function mountBoard(initial: Board, options: Partial<SortableFlipOptions> = {}, { withRoot = true, isReducedMotion = false } = {}) {
	const board = ref(initial) as Ref<Board>
	const rootRef = ref<HTMLElement | null>(null)
	const wrapper = mount(
		defineComponent({
			setup() {
				useSortableFlip(rootRef, { source: () => board.value, items: ITEMS, ...options }, ref(isReducedMotion))
				return () =>
					h(
						'div',
						{ ref: withRoot ? rootRef : undefined },
						Object.entries(board.value).map(([col, ids]) =>
							h(
								'div',
								{ key: col, 'data-col': col },
								ids.map(id => h('div', { key: id, 'data-item': id })),
							),
						),
					)
			},
		}),
		{ attachTo: document.body },
	)
	return { board, wrapper }
}

const element = (selector: string) => document.querySelector(selector) as HTMLElement

describe('useSortable: анимация перестановки (FLIP)', () => {
	let animate: ReturnType<typeof vi.fn>

	beforeEach(() => {
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(layout)
		animate = vi.fn()
		HTMLElement.prototype.animate = animate as unknown as HTMLElement['animate']
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		delete (HTMLElement.prototype as Partial<HTMLElement>).animate
		document.body.innerHTML = ''
	})

	it('сдвинутые элементы едут со старого места, несдвинутые — стоят', async () => {
		const { board } = mountBoard({ todo: ['a', 'b', 'c'] })
		board.value = { todo: ['b', 'a', 'c'] }
		await nextTick()
		expect(animate).toHaveBeenCalledTimes(2)
		const calls = animate.mock.contexts.map((context, index) => [(context as HTMLElement).dataset.item, animate.mock.calls[index]])
		expect(calls).toEqual([
			[
				'b',
				[
					[{ transform: 'translate(0px, 50px)' }, { transform: 'none' }],
					{ duration: 220, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
				],
			],
			[
				'a',
				[
					[{ transform: 'translate(0px, -50px)' }, { transform: 'none' }],
					{ duration: 220, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
				],
			],
		])
	})

	it('новый элемент появляется; длительность — из опций', async () => {
		const { board } = mountBoard({ todo: ['a'] }, { duration: 100 })
		board.value = { todo: ['a', 'n'] }
		await nextTick()
		expect(animate).toHaveBeenCalledOnce()
		expect(animate.mock.contexts[0]).toBe(element('[data-item="n"]'))
		expect(animate).toHaveBeenCalledWith(
			[
				{ opacity: 0, transform: 'scale(0.96)' },
				{ opacity: 1, transform: 'none' },
			],
			{ duration: 100, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
		)
	})

	it('контейнеры плавно меняют высоту, если она изменилась; новый контейнер — без анимации высоты', async () => {
		const { board } = mountBoard({ todo: ['a', 'b'], done: ['c'], same: ['d'] }, { containers: CONTAINERS })
		board.value = { todo: ['a'], done: ['b', 'c'], same: ['d'], extra: [] }
		await nextTick()
		const heights = animate.mock.calls.filter(([frames]) => 'height' in frames[0])
		expect(heights).toEqual([
			[[{ height: '100px' }, { height: '50px' }], expect.any(Object)],
			[[{ height: '50px' }, { height: '100px' }], expect.any(Object)],
		])
	})

	it('при уменьшенном движении ничего не анимирует', async () => {
		const { board } = mountBoard({ todo: ['a', 'b'] }, { containers: CONTAINERS }, { isReducedMotion: true })
		board.value = { todo: ['b', 'a'] }
		await nextTick()
		expect(animate).not.toHaveBeenCalled()
	})

	it('без animate у элементов и без корня не падает', async () => {
		delete (HTMLElement.prototype as Partial<HTMLElement>).animate
		const { board } = mountBoard({ todo: ['a', 'b'] }, { containers: CONTAINERS })
		board.value = { todo: ['b'], done: ['a'] }
		await nextTick()
		expect(element('[data-item="a"]')).toBeTruthy()

		HTMLElement.prototype.animate = animate as unknown as HTMLElement['animate']
		const rootless = mountBoard({ x: ['p', 'q'] }, { containers: CONTAINERS }, { withRoot: false })
		rootless.board.value = { x: ['q', 'p'] }
		await nextTick()
		expect(animate).not.toHaveBeenCalled()
	})
})
