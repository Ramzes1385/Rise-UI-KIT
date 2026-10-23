import '@testing-library/jest-dom/vitest'
import { fireEvent, screen } from '@testing-library/vue'
import { mapData, mountMap, pinned, viewportOf } from '../flowUi'

describe('BaseFlowMap и направление справа налево', () => {
	beforeEach(() => {
		document.documentElement.setAttribute('dir', 'rtl')
	})
	afterEach(() => {
		document.documentElement.removeAttribute('dir')
	})

	it('холст — островок слева направо, остальной интерфейс следует направлению страницы', () => {
		const { container } = mountMap()
		expect(viewportOf(container)).toHaveAttribute('dir', 'ltr')
		expect(container.firstElementChild).not.toHaveAttribute('dir')
	})

	it('стрелка вправо по-прежнему идёт к узлу, лежащему правее на экране', async () => {
		mountMap({
			data: mapData({
				nodes: [
					{ id: 'a', kind: 'service', label: 'Alpha', ...pinned(0, 0) },
					{ id: 'b', kind: 'service', label: 'Beta', ...pinned(300, 0) },
				],
				edges: [],
			}),
		})
		const alpha = screen.getByRole('graphics-object', { name: /^Alpha/ })
		alpha.focus()
		await fireEvent.keyDown(alpha, { key: 'ArrowRight' })
		await vi.waitFor(() => expect(screen.getByRole('graphics-object', { name: /^Beta/ })).toHaveFocus())
		await fireEvent.keyDown(screen.getByRole('graphics-object', { name: /^Beta/ }), { key: 'ArrowLeft' })
		await vi.waitFor(() => expect(alpha).toHaveFocus())
	})
})
