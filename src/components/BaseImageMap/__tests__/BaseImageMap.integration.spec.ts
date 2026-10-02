import '@testing-library/jest-dom/vitest'
import BaseImageMap from '../ui/BaseImageMap.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { IMAGE_MAP_FLOORS, IMAGE_MAP_HOTSPOTS } from '../stories/fixtures'

describe('BaseImageMap integration', () => {
	it('первый объект достижим по Tab, Enter выбирает его', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseImageMap, {
			props: { data: IMAGE_MAP_HOTSPOTS, defaultAction: 'none', hasZoomControls: false, hasFullscreen: false },
		})
		await user.tab()
		expect(screen.getByRole('button', { name: 'Вершина' })).toHaveFocus()
		await user.keyboard('{Enter}')
		expect(emitted()).toHaveProperty('select')
	})

	it('объекты SVG этажа — кнопки; лифт переводит на следующий этаж', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseImageMap, { props: { data: IMAGE_MAP_FLOORS, hasFullscreen: false } })
		const lift = await screen.findByRole('button', { name: 'Лифт на этаж 2' })
		await user.click(lift)
		expect(emitted()['layer-change']).toEqual([['floor-2']])
		expect(await screen.findByRole('button', { name: 'Магазин 201' })).toBeInTheDocument()
	})
})
