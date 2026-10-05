import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseAnimation from '../ui/BaseAnimation.vue'

const SLOT = { default: '<p>Контент</p>' }

describe('BaseAnimation: проп ui', () => {
	it('без ui — только классы кита на корне и внутреннем блоке collapse', () => {
		const { container } = render(BaseAnimation, { props: { name: 'collapse' }, slots: SLOT })

		expect(container.querySelector('.base-animation')).toHaveAttribute('class', 'base-animation base-animation--collapse')
		expect(container.querySelector('.base-animation__inner')).toHaveAttribute('class', 'base-animation__inner')
	})

	it('классы частей добавляются к классам кита, customClass сохраняется', () => {
		const { container } = render(BaseAnimation, {
			props: { name: 'collapse', customClass: 'own-root', ui: { root: 'u-root', inner: 'u-inner' } },
			slots: SLOT,
		})

		expect(container.querySelector('.base-animation')).toHaveClass('u-root', 'own-root', 'base-animation--collapse')
		expect(container.querySelector('.base-animation__inner')).toHaveClass('u-inner')
	})

	it('в режиме isGroup класс root получает контейнер списка', () => {
		const { container } = render(BaseAnimation, {
			props: { isGroup: true, tag: 'ul', ui: { root: 'u-list' } },
			slots: { default: '<li key="1">Первый</li>' },
			global: { stubs: { TransitionGroup: false } },
		})

		expect(container.querySelector('ul')).toHaveClass('base-animation', 'base-animation--group', 'u-list')
	})

	it('классы из defaults.BaseAnimation.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseAnimation, {
			props: { name: 'collapse', ui: { inner: 'own-inner' } },
			slots: SLOT,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseAnimation: { ui: { root: 'app-root', inner: 'app-inner' } } } })] },
		})

		expect(container.querySelector('.base-animation')).toHaveClass('app-root')
		expect(container.querySelector('.base-animation__inner')).toHaveAttribute('class', 'base-animation__inner app-inner own-inner')
	})
})
