import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseProgress from '../ui/BaseProgress.vue'
import { render, screen } from '@testing-library/vue'
import styleSource from '../styles/BaseProgress.style.scss?raw'

const LINE_PARTS = ['status', 'status-text', 'track', 'bar', 'fill'] as const
const CIRCLE_PARTS = ['svg', 'track-circle', 'fill-circle', 'circle-label'] as const

describe('BaseProgress: проп ui', () => {
	it('без ui — только классы кита на всех частях', () => {
		const { container, unmount } = render(BaseProgress, { props: { value: 40, hasLabel: true } })

		expect(screen.getByRole('progressbar').className).toMatch(/^base-progress /)
		for (const part of LINE_PARTS) {
			expect(container.querySelector(`.base-progress__${part}`)).toHaveAttribute('class', `base-progress__${part}`)
		}
		unmount()

		const circle = render(BaseProgress, { props: { value: 40, hasLabel: true, shape: 'circle' } })
		for (const part of CIRCLE_PARTS) {
			expect(circle.container.querySelector(`.base-progress__${part}`)).toHaveAttribute('class', `base-progress__${part}`)
		}
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([...LINE_PARTS, ...CIRCLE_PARTS].map(part => [part, `u-${part}`]))
		const { container, unmount } = render(BaseProgress, {
			props: {
				value: 40,
				hasLabel: true,
				animation: 'glow',
				customClass: { root: 'own-root', fill: 'own-fill' },
				ui: { ...ui, root: 'u-root' },
			},
		})

		expect(screen.getByRole('progressbar')).toHaveClass(
			'base-progress',
			'u-root',
			'base-progress--line',
			'base-progress--glow',
			'own-root',
		)
		for (const part of LINE_PARTS) expect(container.querySelector(`.base-progress__${part}`)).toHaveClass(`u-${part}`)
		expect(container.querySelector('.base-progress__fill')).toHaveClass('own-fill')
		unmount()

		const circle = render(BaseProgress, { props: { value: 40, hasLabel: true, shape: 'circle', ui } })
		for (const part of CIRCLE_PARTS) expect(circle.container.querySelector(`.base-progress__${part}`)).toHaveClass(`u-${part}`)
	})

	it('классы из defaults.BaseProgress.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseProgress, {
			props: { value: 40, ui: { fill: 'own-fill' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseProgress: { ui: { root: 'app-root', fill: 'app-fill' } } } })] },
		})

		expect(screen.getByRole('progressbar')).toHaveClass('base-progress', 'app-root')
		expect(container.querySelector('.base-progress__fill')).toHaveAttribute('class', 'base-progress__fill app-fill own-fill')
	})

	it('RTL: градиент и радуга зеркалятся вместе с заливкой (270deg в :dir(rtl))', () => {
		const rules = [
			...styleSource.matchAll(
				/--fill-(gradient|rainbow) &__fill \{[^]*?&:dir\(rtl\) \{\s*--progress-paint: linear-gradient\(270deg/g,
			),
		]

		expect(rules.map(rule => rule[1])).toEqual(['gradient', 'rainbow'])
	})
})
