import '@testing-library/jest-dom/vitest'
import BaseAnchor from '../ui/BaseAnchor.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseAnchor unit', () => {
	it('рендерит label', () => {
		render(BaseAnchor, { props: { label: 'Пример' } })
		expect(screen.getByText('Пример')).toBeInTheDocument()
	})

	it('слот default заменяет label', () => {
		render(BaseAnchor, { props: { label: 'Пример' }, slots: { default: 'Из слота' } })
		expect(screen.getByText('Из слота')).toBeInTheDocument()
		expect(screen.queryByText('Пример')).not.toBeInTheDocument()
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseAnchor, { props: { variant: 'soft' } })
		expect(container.querySelector('.base-anchor')).toHaveClass('base-anchor--soft')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseAnchor, { props: { sizeScale: 125 } })
		expect((container.querySelector('.base-anchor') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseAnchor, { props: { customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-anchor')).toHaveClass('my-root')
	})
})
