import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseSparkline from '../ui/BaseSparkline.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const LINE_PARTS = ['svg', 'line', 'area', 'dot', 'tooltip'] as const
const BAR_PARTS = ['bars', 'bar'] as const
const PROPS = { values: [3, 9, 5], label: 'Заказы' }

async function hover(): Promise<void> {
	await fireEvent.pointerMove(screen.getByRole('img'), { clientX: 0 })
}

describe('BaseSparkline: проп ui', () => {
	it('без ui — только классы кита на всех частях', async () => {
		const { container, unmount } = render(BaseSparkline, { props: { ...PROPS, variant: 'area' } })
		await hover()

		expect(screen.getByRole('img').className).toMatch(/^base-sparkline( |$)/)
		for (const part of LINE_PARTS) {
			expect(container.querySelector(`.base-sparkline__${part}`)).toHaveAttribute('class', `base-sparkline__${part}`)
		}
		unmount()

		const bars = render(BaseSparkline, { props: { ...PROPS, variant: 'bar' } })
		for (const part of BAR_PARTS) {
			expect(bars.container.querySelector(`.base-sparkline__${part}`)).toHaveAttribute('class', `base-sparkline__${part}`)
		}
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', async () => {
		const ui = Object.fromEntries([...LINE_PARTS, ...BAR_PARTS].map(part => [part, `u-${part}`]))
		const { container, unmount } = render(BaseSparkline, {
			props: { ...PROPS, variant: 'area', customClass: { root: 'own-root' }, ui: { ...ui, root: 'u-root' } },
		})
		await hover()

		expect(screen.getByRole('img')).toHaveClass('base-sparkline', 'u-root', 'base-sparkline--area', 'own-root')
		for (const part of LINE_PARTS) expect(container.querySelector(`.base-sparkline__${part}`)).toHaveClass(`u-${part}`)
		unmount()

		const bars = render(BaseSparkline, { props: { ...PROPS, variant: 'bar', ui } })
		await hover()
		for (const part of BAR_PARTS) expect(bars.container.querySelector(`.base-sparkline__${part}`)).toHaveClass(`u-${part}`)
		expect(bars.container.querySelector('.base-sparkline__bar')).toHaveClass('base-sparkline__bar--active')
	})

	it('классы из defaults.BaseSparkline.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseSparkline, {
			props: { ...PROPS, ui: { line: 'own-line' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSparkline: { ui: { root: 'app-root', line: 'app-line' } } } })] },
		})

		expect(screen.getByRole('img')).toHaveClass('base-sparkline', 'app-root')
		expect(container.querySelector('.base-sparkline__line')).toHaveAttribute('class', 'base-sparkline__line app-line own-line')
	})

	it('без markColor цвет не задаётся на корне: его берут токен и основной цвет', () => {
		render(BaseSparkline, { props: PROPS })

		expect(screen.getByRole('img').style.getPropertyValue('--sparkline-color')).toBe('')
	})
})
