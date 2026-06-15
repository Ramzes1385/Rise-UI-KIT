/**
 * Unit-тесты для BaseRange.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'

import { BaseText } from '@components/BaseText'
import { BaseTooltip } from '@components/BaseTooltip'

import BaseRange from '../ui/BaseRange.vue'

/** Общие глобальные компоненты для всех тестов */
const globalComponents = { components: { BaseText, BaseTooltip } }

describe('BaseRange unit', () => {
	describe('рендер', () => {
		it('должен рендерить range-компонент', () => {
			const { container } = render(BaseRange, { global: globalComponents })

			expect(container.querySelector('.base-range')).toBeInTheDocument()
		})

		it('должен рендерить трек', () => {
			const { container } = render(BaseRange, { global: globalComponents })

			expect(container.querySelector('.base-range__track')).toBeInTheDocument()
		})

		it('должен рендерить ползунок', () => {
			const { container } = render(BaseRange, { global: globalComponents })

			expect(container.querySelector('.base-range__thumb')).toBeInTheDocument()
		})

		it('ползунок должен иметь tabindex=0', () => {
			const { container } = render(BaseRange, { global: globalComponents })

			expect(container.querySelector('.base-range__thumb')?.getAttribute('tabindex')).toBe('0')
		})

		it('ползунок должен иметь role=slider', () => {
			const { container } = render(BaseRange, { global: globalComponents })

			expect(container.querySelector('.base-range__thumb')?.getAttribute('role')).toBe('slider')
		})
	})

	describe('пропс variant', () => {
		it('не должен применять модификатор по умолчанию (variant=default)', () => {
			const { container } = render(BaseRange, { global: globalComponents })

			const root = container.querySelector('.base-range')
			expect(root?.classList.contains('base-range--default')).toBe(false)
			expect(root?.classList.contains('base-range--ghost')).toBe(false)
		})

		it('должен применять модификатор --shadow когда variant=shadow', () => {
			const { container } = render(BaseRange, {
				props: { variant: 'shadow' },
				global: globalComponents,
			})

			expect(container.querySelector('.base-range')?.classList.contains('base-range--shadow')).toBe(true)
		})

		it('должен устанавливать CSS-переменную --variant', () => {
			const { container } = render(BaseRange, {
				props: { variant: 'soft' },
				global: globalComponents,
			})

			expect(container.querySelector('.base-range')?.getAttribute('style')).toContain('--variant: soft')
		})
	})

	describe('пропс isDisabled', () => {
		it('должен применять модификатор --disabled когда isDisabled=true', () => {
			const { container } = render(BaseRange, {
				props: { isDisabled: true },
				global: globalComponents,
			})

			expect(container.querySelector('.base-range')?.classList.contains('base-range--disabled')).toBe(true)
		})
	})

	describe('пропс hasLabel', () => {
		it('должен рендерить метку когда hasLabel=true', () => {
			const { container } = render(BaseRange, {
				props: { hasLabel: true },
				global: globalComponents,
			})

			expect(container.querySelector('.base-range__label')).toBeInTheDocument()
		})

		it('не должен рендерить метку по умолчанию', () => {
			const { container } = render(BaseRange, { global: globalComponents })

			expect(container.querySelector('.base-range__label')).not.toBeInTheDocument()
		})
	})

	describe('пропс hasTooltip', () => {
		it('должен рендерить BaseTooltip когда hasTooltip=true', () => {
			const { container } = render(BaseRange, {
				props: { hasTooltip: true },
				global: globalComponents,
			})

			expect(container.querySelector('.base-tooltip-wrapper')).toBeInTheDocument()
		})
	})

	describe('пропс isVertical', () => {
		it('должен применять модификатор --vertical когда isVertical=true', () => {
			const { container } = render(BaseRange, {
				props: { isVertical: true },
				global: globalComponents,
			})

			expect(container.querySelector('.base-range')?.classList.contains('base-range--vertical')).toBe(true)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseRange, {
				props: { sizeScale: 100 },
				global: globalComponents,
			})

			const style = container.querySelector('.base-range')?.getAttribute('style') ?? ''
			expect(style).not.toContain('--size-scale')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseRange, {
				props: { sizeScale: 150 },
				global: globalComponents,
			})

			expect(container.querySelector('.base-range')?.getAttribute('style')).toContain('--size-scale: 1.5')
		})
	})

	describe('пропс rangeValue', () => {
		it('должен рендерить два ползунка в режиме диапазона', () => {
			const { container } = render(BaseRange, {
				props: { rangeValue: [20, 70] },
				global: globalComponents,
			})

			expect(container.querySelectorAll('.base-range__thumb')).toHaveLength(2)
		})

		it('должен рендерить один ползунок без rangeValue', () => {
			const { container } = render(BaseRange, { global: globalComponents })

			expect(container.querySelectorAll('.base-range__thumb')).toHaveLength(1)
		})
	})

	describe('пропс points', () => {
		it('должен рендерить ползунок для каждой точки', () => {
			const { container } = render(BaseRange, {
				props: { points: [20, 50, 80] },
				global: globalComponents,
			})

			expect(container.querySelectorAll('.base-range__thumb')).toHaveLength(3)
		})

		it('должен поддерживать произвольное количество точек', () => {
			const { container } = render(BaseRange, {
				props: { points: [10, 30, 50, 70, 90] },
				global: globalComponents,
			})

			expect(container.querySelectorAll('.base-range__thumb')).toHaveLength(5)
		})

		it('должен рендерить сегменты заливки между соседними точками', () => {
			const { container } = render(BaseRange, {
				props: { points: [20, 50, 80] },
				global: globalComponents,
			})

			expect(container.querySelectorAll('.base-range__fill')).toHaveLength(2)
		})

		it('должен ограничивать aria-границы ползунка соседями', () => {
			const { container } = render(BaseRange, {
				props: { points: [20, 50, 80], min: 0, max: 100 },
				global: globalComponents,
			})

			const thumbs = container.querySelectorAll('.base-range__thumb')
			expect(thumbs[1].getAttribute('aria-valuemin')).toBe('20')
			expect(thumbs[1].getAttribute('aria-valuemax')).toBe('80')
		})
	})

	describe('пропс marks', () => {
		it('должен рендерить метки когда передан массив', () => {
			const { container } = render(BaseRange, {
				props: {
					marks: [
						{ value: 0, label: '0' },
						{ value: 50, label: '50' },
						{ value: 100, label: '100' },
					],
				},
				global: globalComponents,
			})

			expect(container.querySelectorAll('.base-range__mark')).toHaveLength(3)
		})

		it('должен рендерить текст метки', () => {
			const { container } = render(BaseRange, {
				props: {
					marks: [{ value: 50, label: 'Середина' }],
				},
				global: globalComponents,
			})

			expect(container.querySelector('.base-range__mark-text')?.textContent).toBe('Середина')
		})

		it('должен рендерить деление mark-tick', () => {
			const { container } = render(BaseRange, {
				props: {
					marks: [{ value: 50 }],
				},
				global: globalComponents,
			})

			expect(container.querySelector('.base-range__mark-tick')).toBeInTheDocument()
		})

		it('должен применять модификатор --major по умолчанию', () => {
			const { container } = render(BaseRange, {
				props: {
					marks: [{ value: 50 }],
				},
				global: globalComponents,
			})

			expect(container.querySelector('.base-range__mark')?.classList.contains('base-range__mark--major')).toBe(true)
		})

		it('должен применять модификатор --minor когда tickSize=minor', () => {
			const { container } = render(BaseRange, {
				props: {
					marks: [{ value: 50, tickSize: 'minor' }],
				},
				global: globalComponents,
			})

			expect(container.querySelector('.base-range__mark')?.classList.contains('base-range__mark--minor')).toBe(true)
		})

		it('должен применять модификатор --sub когда tickSize=sub', () => {
			const { container } = render(BaseRange, {
				props: {
					marks: [{ value: 50, tickSize: 'sub' }],
				},
				global: globalComponents,
			})

			expect(container.querySelector('.base-range__mark')?.classList.contains('base-range__mark--sub')).toBe(true)
		})
	})

	describe('слот thumb', () => {
		it('должен рендерить thumb-dot по умолчанию', () => {
			const { container } = render(BaseRange, { global: globalComponents })

			expect(container.querySelector('.base-range__thumb-dot')).toBeInTheDocument()
		})

		it('не должен добавлять модификатор --custom без слота', () => {
			const { container } = render(BaseRange, { global: globalComponents })

			expect(container.querySelector('.base-range__thumb--custom')).not.toBeInTheDocument()
		})

		it('должен рендерить кастомный контент слота thumb', () => {
			const { container } = render(BaseRange, {
				global: globalComponents,
				slots: {
					thumb: '<div class="custom-thumb">custom</div>',
				},
			})

			expect(container.querySelector('.custom-thumb')).toBeInTheDocument()
			expect(container.querySelector('.custom-thumb')?.textContent).toBe('custom')
		})

		it('должен добавлять модификатор --custom при использовании слота', () => {
			const { container } = render(BaseRange, {
				global: globalComponents,
				slots: {
					thumb: '<div class="custom-thumb">custom</div>',
				},
			})

			expect(container.querySelector('.base-range__thumb--custom')).toBeInTheDocument()
		})

		it('не должен рендерить thumb-dot при кастомном слоте', () => {
			const { container } = render(BaseRange, {
				global: globalComponents,
				slots: {
					thumb: '<div class="custom-thumb">custom</div>',
				},
			})

			expect(container.querySelector('.base-range__thumb-dot')).not.toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseRange, {
				props: { customClass: 'custom-range-root' },
				global: globalComponents,
			})

			expect(container.querySelector('.base-range')).toHaveClass('custom-range-root')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseRange, {
				props: {
					hasLabel: true,
					marks: [{ value: 50, label: '50%' }],
					customClass: {
						root: 'custom-root',
						label: 'custom-label',
						labelMin: 'custom-label-min',
						labelValue: 'custom-label-value',
						labelMax: 'custom-label-max',
						body: 'custom-body',
						trackWrapper: 'custom-track-wrapper',
						track: 'custom-track',
						fill: 'custom-fill',
						thumbContainer: 'custom-thumb-container',
						thumb: 'custom-thumb',
						thumbDot: 'custom-thumb-dot',
						marks: 'custom-marks',
						mark: 'custom-mark',
						markTick: 'custom-mark-tick',
						markText: 'custom-mark-text',
					},
				},
				global: globalComponents,
			})

			expect(container.querySelector('.base-range')).toHaveClass('custom-root')
			expect(container.querySelector('.base-range__label')).toHaveClass('custom-label')
			expect(container.querySelector('.base-range__label-min')).toHaveClass('custom-label-min')
			expect(container.querySelector('.base-range__label-value')).toHaveClass('custom-label-value')
			expect(container.querySelector('.base-range__label-max')).toHaveClass('custom-label-max')
			expect(container.querySelector('.base-range__body')).toHaveClass('custom-body')
			expect(container.querySelector('.base-range__track-wrapper')).toHaveClass('custom-track-wrapper')
			expect(container.querySelector('.base-range__track')).toHaveClass('custom-track')
			expect(container.querySelector('.base-range__fill')).toHaveClass('custom-fill')
			expect(container.querySelector('.base-range__thumb-container')).toHaveClass('custom-thumb-container')
			expect(container.querySelector('.base-range__thumb')).toHaveClass('custom-thumb')
			expect(container.querySelector('.base-range__thumb-dot')).toHaveClass('custom-thumb-dot')
			expect(container.querySelector('.base-range__marks')).toHaveClass('custom-marks')
			expect(container.querySelector('.base-range__mark')).toHaveClass('custom-mark')
			expect(container.querySelector('.base-range__mark-tick')).toHaveClass('custom-mark-tick')
			expect(container.querySelector('.base-range__mark-text')).toHaveClass('custom-mark-text')
		})
	})
})
