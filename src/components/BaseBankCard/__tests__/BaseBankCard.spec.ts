import '@testing-library/jest-dom/vitest'
import BaseBankCard from '../ui/BaseBankCard.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseBankCard unit', () => {
	it('рендерит label', () => {
		render(BaseBankCard, { props: { label: 'Пример' } })
		expect(screen.getByText('Пример')).toBeInTheDocument()
	})

	it('слот default заменяет label', () => {
		render(BaseBankCard, { props: { label: 'Пример' }, slots: { default: 'Из слота' } })
		expect(screen.getByText('Из слота')).toBeInTheDocument()
		expect(screen.queryByText('Пример')).not.toBeInTheDocument()
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseBankCard, { props: { variant: 'soft' } })
		expect(container.querySelector('.base-bank-card')).toHaveClass('base-bank-card--soft')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseBankCard, { props: { sizeScale: 125 } })
		expect((container.querySelector('.base-bank-card') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseBankCard, { props: { customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-bank-card')).toHaveClass('my-root')
	})
})
