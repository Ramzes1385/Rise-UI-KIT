import { nextTick, ref } from 'vue'
import { ITEMS, mountSortable, sortableOptions } from './sortableHarness'

describe('useSortable', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('отдаёт клавиатуру и мышь одним объектом', () => {
		const { sortable } = mountSortable(sortableOptions())
		expect(Object.keys(sortable).sort()).toEqual(
			['consumeClick', 'drag', 'ghostRef', 'ghostStyle', 'grab', 'grabbedId', 'handleGrabbedKeydown', 'handlePointerDown'].sort(),
		)
		sortable.grab(ITEMS[0])
		expect(sortable.grabbedId.value).toBe('a')
		expect(sortable.drag.value).toBeNull()
	})

	it('с опцией flip следит за источником порядка, без неё — нет', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true })),
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
})
