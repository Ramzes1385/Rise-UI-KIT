import '@testing-library/jest-dom/vitest'
import BaseCode from '../ui/BaseCode.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseCode unit', () => {
	it('рендерит label', () => {
		render(BaseCode, { props: { label: 'Пример' } })
		expect(screen.getByText('Пример')).toBeInTheDocument()
	})

	it('слот default заменяет label', () => {
		render(BaseCode, { props: { label: 'Пример' }, slots: { default: 'Из слота' } })
		expect(screen.getByText('Из слота')).toBeInTheDocument()
		expect(screen.queryByText('Пример')).not.toBeInTheDocument()
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseCode, { props: { variant: 'soft' } })
		expect(container.querySelector('.base-code')).toHaveClass('base-code--soft')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseCode, { props: { sizeScale: 125 } })
		expect((container.querySelector('.base-code') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseCode, { props: { customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-code')).toHaveClass('my-root')
	})
})
