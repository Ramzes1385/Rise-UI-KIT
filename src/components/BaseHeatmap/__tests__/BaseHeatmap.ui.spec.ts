import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseHeatmap from '../ui/BaseHeatmap.vue'
import { HEATMAP_PARTS } from '../types/BaseHeatmap.types'

const PROPS = { data: [{ date: '2025-05-14', value: 3 }], label: 'Коммиты', endDate: '2025-05-15', weeks: 6 }

describe('BaseHeatmap: проп ui', () => {
	it('без ui — только классы кита на всех частях', () => {
		const { container } = render(BaseHeatmap, { props: PROPS })

		expect(container.querySelector('.base-heatmap')?.className).toMatch(/^base-heatmap( |$)/)
		for (const part of HEATMAP_PARTS) {
			const element = container.querySelector(`.base-heatmap__${part}`)
			expect(element).toBeInTheDocument()
			expect([...element!.classList].every(name => name.startsWith('base-heatmap__'))).toBe(true)
		}
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries(HEATMAP_PARTS.map(part => [part, `u-${part}`]))
		const { container } = render(BaseHeatmap, {
			props: { ...PROPS, variant: 'square', customClass: { root: 'own-root' }, ui: { ...ui, root: 'u-root' } },
		})

		expect(container.querySelector('.base-heatmap')).toHaveClass('base-heatmap', 'u-root', 'base-heatmap--square', 'own-root')
		for (const part of HEATMAP_PARTS) {
			for (const element of container.querySelectorAll(`.base-heatmap__${part}`)) expect(element).toHaveClass(`u-${part}`)
		}
		expect(container.querySelector('.base-heatmap__cell.u-cell')).toHaveClass('base-heatmap__cell--0')
		expect(container.querySelector('.base-heatmap__swatch.u-swatch')).toHaveClass('base-heatmap__cell--0')
	})

	it('классы из defaults.BaseHeatmap.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseHeatmap, {
			props: { ...PROPS, ui: { footer: 'own-footer' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseHeatmap: { ui: { root: 'app-root', footer: 'app-footer' } } } })] },
		})

		expect(container.querySelector('.base-heatmap')).toHaveClass('base-heatmap', 'app-root')
		expect(container.querySelector('.base-heatmap__footer')).toHaveAttribute('class', 'base-heatmap__footer app-footer own-footer')
	})
})
