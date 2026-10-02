import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseCryptoProSign from '../ui/BaseCryptoProSign.vue'

describe('BaseCryptoProSign unit', () => {
	it('рендерит область подписи', () => {
		render(BaseCryptoProSign)
		expect(screen.getByRole('region', { name: 'Электронная подпись' })).toBeInTheDocument()
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseCryptoProSign, { props: { variant: 'soft' } })
		expect(container.querySelector('.base-crypto-pro-sign')).toHaveClass('base-crypto-pro-sign--soft')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseCryptoProSign, { props: { sizeScale: 125 } })
		expect((container.querySelector('.base-crypto-pro-sign') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseCryptoProSign, { props: { customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-crypto-pro-sign')).toHaveClass('my-root')
	})
})
