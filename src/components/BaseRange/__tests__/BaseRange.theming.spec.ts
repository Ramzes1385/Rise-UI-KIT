import '@testing-library/jest-dom/vitest'
import BaseRange from '../ui/BaseRange.vue'
import { RANGE_PARTS } from '../types/BaseRange.types'
import { fireEvent, render } from '@testing-library/vue'
import { DEFAULTS_KEY } from '@composables/base/useDefaults'

const MARKS = [
	{ value: 0, label: '0' },
	{ value: 50, label: '50' },
]

describe('BaseRange: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...RANGE_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseRange, {
			props: {
				modelValue: 30,
				hasLabel: true,
				marks: MARKS,
				variant: 'soft',
				customClass: { root: 'own-root', thumb: 'own-thumb' },
				ui,
			},
		})
		const root = container.querySelector('.base-range')!

		expect(root).toHaveClass('u-root', 'base-range--soft', 'own-root')
		for (const part of RANGE_PARTS) expect(root.querySelector(`.base-range__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-range__thumb')).toHaveClass('own-thumb')
		expect(root.querySelector('.base-range__mark')).toHaveClass('base-range__mark--major')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseRange, {
			props: { modelValue: 30, ui: { thumb: 'own' } },
			global: { provide: { [DEFAULTS_KEY]: { BaseRange: { ui: { thumb: 'app', root: 'app-root' } } } } },
		})
		const root = container.querySelector('.base-range')!

		expect(root).toHaveClass('base-range', 'app-root')
		expect(root.querySelector('.base-range__track')).toHaveAttribute('class', 'base-range__track')
		expect(root.querySelector('.base-range__thumb')).toHaveAttribute('class', 'base-range__thumb app own')
	})
})

describe('BaseRange: позиция через transform', () => {
	it('ползунок получает смещение --range-offset, заполнение — границы --range-fill-start/end', () => {
		const { container } = render(BaseRange, { props: { modelValue: 25, min: 0, max: 200 } })

		expect(container.querySelector('.base-range__thumb-container')).toHaveStyle({ '--range-offset': '12.5' })
		const fill = container.querySelector('.base-range__fill')!
		expect(fill).toHaveStyle({ '--range-fill-start': '0%', '--range-fill-end': '12.5%' })
		expect(fill.getAttribute('style')).not.toMatch(/left|width/)
	})

	it('заполнение диапазона и точек — между соседними ползунками', () => {
		const { container } = render(BaseRange, { props: { points: [10, 40, 90] } })
		const fills = container.querySelectorAll('.base-range__fill')

		expect(fills).toHaveLength(2)
		expect(fills[0]).toHaveStyle({ '--range-fill-start': '10%', '--range-fill-end': '40%' })
		expect(fills[1]).toHaveStyle({ '--range-fill-start': '40%', '--range-fill-end': '90%' })
	})
})

describe('BaseRange: движение только при шаге и клике', () => {
	it('перетаскивание ползунка ставит --dragging после первого движения и снимает его при отпускании', async () => {
		const { container } = render(BaseRange, { props: { modelValue: 0 } })
		const root = container.querySelector('.base-range')!

		await fireEvent.mouseDown(container.querySelector('.base-range__thumb')!, { clientX: 0 })
		expect(root).not.toHaveClass('base-range--dragging')
		await fireEvent.mouseMove(document, { clientX: 40 })
		expect(root).toHaveClass('base-range--dragging')
		await fireEvent.mouseUp(document)
		expect(root).not.toHaveClass('base-range--dragging')
	})

	it('клик по дорожке — прыжок с переходом; ведение после клика — без перехода', async () => {
		const { container, emitted } = render(BaseRange, { props: { modelValue: 0 } })
		const root = container.querySelector('.base-range')!

		await fireEvent.mouseDown(container.querySelector('.base-range__track-wrapper')!, { clientX: 60 })
		expect(emitted('update:modelValue')).toEqual([[60]])
		expect(root).not.toHaveClass('base-range--dragging')
		await fireEvent.mouseMove(document, { clientX: 70 })
		expect(root).toHaveClass('base-range--dragging')
		await fireEvent.mouseUp(document)
		expect(root).not.toHaveClass('base-range--dragging')
	})

	it('шаг с клавиатуры и клик по выключенному слайдеру не включают --dragging', async () => {
		const { container, emitted, rerender } = render(BaseRange, { props: { modelValue: 10 } })
		const root = container.querySelector('.base-range')!

		await fireEvent.keyDown(container.querySelector('.base-range__thumb')!, { key: 'ArrowRight' })
		expect(emitted('update:modelValue')).toEqual([[11]])
		expect(root).not.toHaveClass('base-range--dragging')
		await rerender({ isDisabled: true })
		await fireEvent.mouseDown(container.querySelector('.base-range__track-wrapper')!, { clientX: 60 })
		await fireEvent.mouseMove(document, { clientX: 70 })
		expect(root).not.toHaveClass('base-range--dragging')
	})
})
