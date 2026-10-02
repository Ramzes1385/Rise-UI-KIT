import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseCryptoProSign from '../ui/BaseCryptoProSign.vue'

describe('BaseCryptoProSign integration', () => {
	it('в режиме verify — область проверки подписи', () => {
		render(BaseCryptoProSign, { props: { mode: 'verify' } })
		expect(screen.getByRole('region', { name: 'Проверка электронной подписи' })).toBeInTheDocument()
	})
})
