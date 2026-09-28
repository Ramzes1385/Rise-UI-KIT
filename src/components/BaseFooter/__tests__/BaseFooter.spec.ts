import '@testing-library/jest-dom/vitest'
import BaseFooter from '../ui/BaseFooter.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseFooter unit', () => {
	it('рендерит <footer> с тремя зонами', () => {
		const { container } = render(BaseFooter, { slots: { start: '© 2026 Rise', default: 'Ссылки', end: 'Соцсети' } })
		expect(screen.getByRole('contentinfo')).toBeInTheDocument()
		expect(container.querySelector('.base-footer__start')).toHaveTextContent('© 2026 Rise')
		expect(container.querySelector('.base-footer__center')).toHaveTextContent('Ссылки')
		expect(container.querySelector('.base-footer__end')).toHaveTextContent('Соцсети')
		expect(container.querySelector('.base-footer__inner')).toHaveClass('base-container--full')
	})

	it('пустые зоны не рендерятся', () => {
		const { container } = render(BaseFooter, { slots: { default: 'Ссылки' } })
		expect(container.querySelector('.base-footer__start')).not.toBeInTheDocument()
		expect(container.querySelector('.base-footer__end')).not.toBeInTheDocument()
	})

	it('containerSize, вариант и customClass', () => {
		const { container } = render(BaseFooter, { props: { containerSize: 'lg', variant: 'soft', customClass: { inner: 'my-inner' } } })
		expect(container.querySelector('.base-footer')).toHaveClass('base-footer--soft')
		expect(container.querySelector('.base-footer__inner')).toHaveClass('base-container--lg', 'my-inner')
	})
})
