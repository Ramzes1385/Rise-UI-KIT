import '@testing-library/jest-dom/vitest'
import BaseStat from '../ui/BaseStat.vue'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import { STAT_PARTS } from '../types/BaseStat.types'

const PROPS = { label: 'Выручка', value: 120, change: 0.1, changeLabel: 'к августу' }

const SLOTS = { icon: '<span>значок</span>', chart: '<span>график</span>' }

const kitOnly = (element: Element | null): boolean => [...(element?.classList ?? [])].every(name => name.startsWith('base-'))

describe('BaseStat: проп ui', () => {
	it('без ui — только классы кита на всех частях', () => {
		const { container } = render(BaseStat, { props: PROPS, slots: SLOTS })

		expect(container.querySelector('.base-stat')?.className).toMatch(/^base-stat( |$)/)
		for (const part of STAT_PARTS) {
			const element = container.querySelector(`.base-stat__${part}`)
			expect(element).toBeInTheDocument()
			expect(kitOnly(element)).toBe(true)
		}
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries(STAT_PARTS.map(part => [part, `u-${part}`]))
		const { container } = render(BaseStat, {
			props: { ...PROPS, variant: 'soft', customClass: { root: 'own-root', value: 'own-value' }, ui: { ...ui, root: 'u-root' } },
			slots: SLOTS,
		})

		expect(container.querySelector('.base-stat')).toHaveClass(
			'base-stat',
			'u-root',
			'base-stat--soft',
			'own-root',
			'base-stat--with-icon',
		)
		for (const part of STAT_PARTS) expect(container.querySelector(`.base-stat__${part}`)).toHaveClass(`u-${part}`)
		expect(container.querySelector('.base-stat__value')).toHaveClass('own-value')
		expect(container.querySelector('.base-stat__change')).toHaveClass('base-stat__change--positive')
	})

	it('при загрузке ui достаётся частям value и change с заглушками', () => {
		const { container } = render(BaseStat, { props: { ...PROPS, isLoading: true, ui: { value: 'u-value', change: 'u-change' } } })

		expect(container.querySelector('.base-stat__value')).toHaveClass('u-value')
		expect(container.querySelector('.base-stat__change')).toHaveClass('u-change')
		expect(container.querySelector('.base-stat__content')).toBeNull()
	})

	it('классы из defaults.BaseStat.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseStat, {
			props: { ...PROPS, ui: { value: 'own-value' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseStat: { ui: { root: 'app-root', value: 'app-value' } } } })] },
		})

		expect(container.querySelector('.base-stat')).toHaveClass('base-stat', 'app-root')
		expect(container.querySelector('.base-stat__value')).toHaveAttribute('class', 'base-stat__value app-value own-value')
	})
})
