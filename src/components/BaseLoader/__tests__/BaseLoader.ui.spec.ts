import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseLoader from '../ui/BaseLoader.vue'
import { render } from '@testing-library/vue'
import type { LoaderVariant } from '../types/BaseLoader.types'

function renderLoader(variant: LoaderVariant, ui?: Record<string, string>) {
	const { container } = render(BaseLoader, { props: { variant, hasLabel: true, ui } })
	return container.querySelector('.base-loader')!
}

describe('BaseLoader: проп ui', () => {
	it('без ui — только классы кита на всех частях', () => {
		const root = renderLoader('spinner')

		expect(root.className).toMatch(/^base-loader /)
		for (const part of ['animation', 'spinner-track', 'spinner-fill', 'label', 'announce']) {
			expect(root.querySelector(`.base-loader__${part}`)).toHaveAttribute('class', `base-loader__${part}`)
		}
		expect(root.querySelector('.base-loader__spinner')).toHaveAttribute('class', 'base-loader__spinner')
	})

	it('классы частей добавляются к классам кита во всех вариантах', () => {
		const ui = {
			root: 'u-root',
			animation: 'u-animation',
			spinner: 'u-spinner',
			'spinner-track': 'u-track',
			'spinner-fill': 'u-fill',
			dot: 'u-dot',
			pulse: 'u-pulse',
			bar: 'u-bar',
			label: 'u-label',
			announce: 'u-announce',
		}
		const spinner = renderLoader('spinner', ui)
		expect(spinner).toHaveClass('base-loader', 'u-root', 'base-loader--spinner')
		expect(spinner.querySelector('.base-loader__animation')).toHaveClass('u-animation')
		expect(spinner.querySelector('.base-loader__spinner')).toHaveClass('u-spinner')
		expect(spinner.querySelector('.base-loader__spinner-track')).toHaveClass('u-track')
		expect(spinner.querySelector('.base-loader__spinner-fill')).toHaveClass('u-fill')
		expect(spinner.querySelector('.base-loader__label')).toHaveClass('u-label')
		expect(spinner.querySelector('.base-loader__announce')).toHaveClass('u-announce')

		for (const dot of renderLoader('dots', ui).querySelectorAll('.base-loader__dot')) expect(dot).toHaveClass('u-dot')
		expect(renderLoader('pulse', ui).querySelector('.base-loader__pulse')).toHaveClass('u-pulse')
		for (const bar of renderLoader('bars', ui).querySelectorAll('.base-loader__bar')) expect(bar).toHaveClass('u-bar')
	})

	it('классы из defaults.BaseLoader.ui плагина склеиваются с классами экземпляра, customClass сохраняется', () => {
		const { container } = render(BaseLoader, {
			props: { hasLabel: true, customClass: { label: 'own-custom' }, ui: { label: 'own-label' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseLoader: { ui: { root: 'app-root', label: 'app-label' } } } })] },
		})
		const root = container.querySelector('.base-loader')!

		expect(root).toHaveClass('app-root')
		expect(root.querySelector('.base-loader__label')).toHaveClass('base-loader__label', 'app-label', 'own-label', 'own-custom')
	})
})
