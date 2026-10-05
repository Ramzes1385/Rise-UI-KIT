import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseSkeleton from '../ui/BaseSkeleton.vue'

describe('BaseSkeleton: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseSkeleton, { props: { shape: 'text' } })

		expect(container.firstElementChild).toHaveAttribute('class', 'base-skeleton base-skeleton--text base-skeleton--animated')
	})

	it('классы root добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseSkeleton, {
			props: { shape: 'circle', isPulse: true, customClass: 'own-root', ui: { root: 'u-root' } },
		})

		expect(container.firstElementChild).toHaveClass(
			'base-skeleton',
			'u-root',
			'base-skeleton--circle',
			'base-skeleton--pulse',
			'own-root',
		)
	})

	it('классы из defaults.BaseSkeleton.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseSkeleton, {
			props: { ui: { root: 'own-root' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSkeleton: { ui: { root: 'app-root' } } } })] },
		})

		expect(container.firstElementChild?.className).toMatch(/^base-skeleton app-root own-root /)
	})
})
