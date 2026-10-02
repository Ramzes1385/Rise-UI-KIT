import '@testing-library/jest-dom/vitest'
import BaseImageMap from '../ui/BaseImageMap.vue'
import { IMAGE_MAP_HOTSPOTS } from '../stories/fixtures'
import { fireEvent, render, screen } from '@testing-library/vue'

const data = IMAGE_MAP_HOTSPOTS

describe('BaseImageMap unit', () => {
	it('рендерит объекты кнопками с именами', () => {
		render(BaseImageMap, { props: { data } })
		expect(screen.getByRole('button', { name: 'Вершина' })).toBeInTheDocument()
	})

	it('эмитит select по клику', async () => {
		const { emitted } = render(BaseImageMap, { props: { data, defaultAction: 'none' } })
		await fireEvent.click(screen.getByRole('button', { name: 'Вершина' }))
		expect(emitted()).toHaveProperty('select')
	})

	it('недоступный объект помечен aria-disabled', () => {
		render(BaseImageMap, { props: { data } })
		expect(screen.getByRole('button', { name: 'Закрытая трасса' })).toHaveAttribute('aria-disabled', 'true')
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseImageMap, { props: { data, variant: 'outline' } })
		expect(container.querySelector('.base-image-map')).toHaveClass('base-image-map--outline')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseImageMap, { props: { data, sizeScale: 125 } })
		expect((container.querySelector('.base-image-map') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseImageMap, { props: { data, customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-image-map')).toHaveClass('my-root')
	})
})
