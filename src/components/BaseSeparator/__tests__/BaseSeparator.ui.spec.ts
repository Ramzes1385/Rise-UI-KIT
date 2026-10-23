import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseSeparator from '../ui/BaseSeparator.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseSeparator: проп ui', () => {
	it('без ui — только классы кита на всех частях', () => {
		const { container } = render(BaseSeparator, { props: { label: 'или' } })
		const [before, after] = container.querySelectorAll('.base-separator__line')

		expect(screen.getByRole('separator')).toHaveAttribute(
			'class',
			'base-separator base-separator--horizontal base-separator--with-content',
		)
		expect(before).toHaveAttribute('class', 'base-separator__line base-separator__line--before')
		expect(after).toHaveAttribute('class', 'base-separator__line base-separator__line--after')
		expect(container.querySelector('.base-separator__content')).toHaveAttribute('class', 'base-separator__content')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseSeparator, {
			props: {
				label: 'или',
				isDashed: true,
				customClass: { root: 'own-root', line: 'own-line' },
				ui: { root: 'u-root', line: 'u-line', content: 'u-content' },
			},
		})
		const lines = container.querySelectorAll('.base-separator__line')

		expect(screen.getByRole('separator')).toHaveClass('base-separator', 'u-root', 'base-separator--dashed', 'own-root')
		expect(lines).toHaveLength(2)
		for (const line of lines) expect(line).toHaveClass('u-line', 'own-line')
		expect(container.querySelector('.base-separator__content')).toHaveClass('u-content')
	})

	it('без подписи — одна линия с классами ui', () => {
		const { container } = render(BaseSeparator, { props: { ui: { line: 'u-line' } } })

		expect(container.querySelector('.base-separator__line')).toHaveAttribute('class', 'base-separator__line u-line')
	})

	it('классы из defaults.BaseSeparator.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseSeparator, {
			props: { label: 'или', ui: { content: 'own-content' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSeparator: { ui: { root: 'app-root', content: 'app-content' } } } })] },
		})

		expect(screen.getByRole('separator')).toHaveClass('base-separator', 'app-root')
		expect(container.querySelector('.base-separator__content')).toHaveAttribute(
			'class',
			'base-separator__content app-content own-content',
		)
	})
})
