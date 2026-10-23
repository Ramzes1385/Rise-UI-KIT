import { mount } from '@vue/test-utils'
import { useSortable } from '../useSortable'
import { defineComponent, h, nextTick, ref, type Ref } from 'vue'
import { ITEMS, key, mountSortable, pointer, rect, sortableOptions } from './sortableHarness'

describe('useSortable', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('клавиатура и мышь работают через один объект', () => {
		const options = sortableOptions()
		const { sortable } = mountSortable(options)
		expect(sortable.ghostRef.value).toBeNull()
		sortable.grab(ITEMS[0])
		expect(sortable.grabbedId.value).toBe('a')
		expect(sortable.drag.value).toBeNull()
		expect(sortable.handleGrabbedKeydown(key('ArrowDown'))).toBe(true)
		expect(options.onPreview).toHaveBeenCalledWith('a', 2)

		const element = document.createElement('div')
		element.getBoundingClientRect = () => rect([0, 0, 100, 40])
		element.addEventListener('pointerdown', event => sortable.handlePointerDown(event as PointerEvent, ITEMS[1]))
		element.dispatchEvent(pointer('pointerdown', [10, 10]))
		window.dispatchEvent(pointer('pointermove', [10, 30]))
		expect(sortable.drag.value?.item).toBe(ITEMS[1])
		expect(sortable.ghostStyle.value).toEqual({ width: '100px', transform: 'translate(0px, 20px)' })
		window.dispatchEvent(pointer('pointerup', [10, 30]))
		expect(options.onDrop).toHaveBeenCalledWith({ id: 'b', origin: 1 }, expect.any(Function))
		expect(sortable.consumeClick()).toBe(true)
	})

	it('с опцией flip следит за источником порядка, без неё — нет', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
		const order = ref(['a', 'b'])
		const source = vi.fn(() => order.value)
		mountSortable(sortableOptions({ flip: { source, items: { selector: '[data-id]', key: 'id' } } }))
		const calls = source.mock.calls.length
		expect(calls).toBeGreaterThan(0)
		order.value = ['b', 'a']
		await nextTick()
		expect(source.mock.calls.length).toBeGreaterThan(calls)
		expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
	})

	describe('FLIP берёт движение области корня', () => {
		const animate = vi.fn()

		function mountFlip(preset: string) {
			const order = ref(['a', 'b'])
			const rootRef = ref<HTMLElement | null>(null)
			mount(
				defineComponent({
					setup() {
						mountSortableOptions(rootRef, order)
						return () =>
							h('div', { 'data-rise-motion': preset }, [
								h(
									'div',
									{ ref: rootRef },
									order.value.map(id => h('i', { key: id, 'data-id': id })),
								),
							])
					},
				}),
				{ attachTo: document.body },
			)
			return order
		}

		function mountSortableOptions(rootRef: Ref<HTMLElement | null>, order: Ref<string[]>) {
			useSortable(sortableOptions({ rootRef, flip: { source: () => order.value, items: { selector: '[data-id]', key: 'id' } } }))
		}

		beforeEach(() => {
			vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
				return rect([0, [...this.parentElement!.children].indexOf(this) * 50, 100, 40])
			})
			HTMLElement.prototype.animate = animate as unknown as HTMLElement['animate']
		})

		afterEach(() => {
			vi.restoreAllMocks()
			animate.mockClear()
			delete (HTMLElement.prototype as Partial<HTMLElement>).animate
			document.body.innerHTML = ''
		})

		it('пресет standard — элементы едут', async () => {
			const order = mountFlip('standard')
			order.value = ['b', 'a']
			await nextTick()
			expect(animate).toHaveBeenCalled()
		})

		it('пресет none — без анимации', async () => {
			const order = mountFlip('none')
			order.value = ['b', 'a']
			await nextTick()
			expect(animate).not.toHaveBeenCalled()
		})
	})
})
