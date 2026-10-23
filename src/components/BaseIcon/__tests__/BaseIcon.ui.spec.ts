import '@testing-library/jest-dom/vitest'
import BaseIcon from '../ui/BaseIcon.vue'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'

vi.mock('@composables/app/useIcon', () => ({
	useIcon: () => ({
		resolveIcon: (name: string) => ({ url: `icons.svg#${name}` }),
	}),
	createIconPlugin: () => ({ install: () => {} }),
}))

describe('BaseIcon: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseIcon, { props: { name: 'star' } })

		expect(container.querySelector('.base-icon')).toHaveAttribute('class', 'base-icon')
		expect(container.querySelector('svg')).toHaveAttribute('class', 'base-icon__svg')
	})

	it('классы частей добавляются к классам кита, customClass сохраняется', () => {
		const { container } = render(BaseIcon, {
			props: { name: 'star', customClass: { root: 'own-root', svg: 'own-svg' }, ui: { root: 'u-root', svg: 'u-svg' } },
		})

		expect(container.querySelector('.base-icon')).toHaveClass('u-root', 'own-root')
		expect(container.querySelector('.base-icon__svg')).toHaveClass('u-svg', 'own-svg')
	})

	it('классы из defaults.BaseIcon.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseIcon, {
			props: { name: 'star', ui: { svg: 'own-svg' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseIcon: { ui: { root: 'app-root', svg: 'app-svg' } } } })] },
		})

		expect(container.querySelector('.base-icon')).toHaveClass('base-icon', 'app-root')
		expect(container.querySelector('svg')).toHaveAttribute('class', 'base-icon__svg app-svg own-svg')
	})
})
