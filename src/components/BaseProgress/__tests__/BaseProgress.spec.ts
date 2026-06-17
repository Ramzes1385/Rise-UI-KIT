/**
 * Unit-тесты для BaseProgress.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import BaseProgress from '../ui/BaseProgress.vue'

describe('BaseProgress unit', () => {
	describe('рендер', () => {
		it('должен рендерить прогресс-бар', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50 },
			})

			expect(container.querySelector('.base-progress')).toBeInTheDocument()
		})

		it('должен устанавливать role=progressbar', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('role')).toBe('progressbar')
		})

		it('должен устанавливать aria-valuenow', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('aria-valuenow')).toBe('50')
		})
	})

	describe('пропс shape', () => {
		it('должен рендерить линейный прогресс по умолчанию', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50 },
			})

			expect(container.querySelector('.base-progress__track')).toBeInTheDocument()
		})

		it('должен рендерить круговой прогресс когда shape=circle', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, shape: 'circle' },
			})

			expect(container.querySelector('.base-progress__svg')).toBeInTheDocument()
		})

		it('должен применять модификатор --line по умолчанию', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50 },
			})

			expect(container.querySelector('.base-progress')?.classList.contains('base-progress--line')).toBe(true)
		})

		it('должен применять модификатор --circle когда shape=circle', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, shape: 'circle' },
			})

			expect(container.querySelector('.base-progress')?.classList.contains('base-progress--circle')).toBe(true)
		})
	})

	describe('пропс hasLabel', () => {
		it('должен рендерить BaseTooltip внутри fill когда hasLabel=true и shape=line', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: true },
			})

			const trigger = container.querySelector('.base-progress__tooltip-trigger')
			expect(trigger).toBeInTheDocument()
			expect(trigger?.closest('.base-progress__fill')).toBeInTheDocument()
		})

		it('должен рендерить метку когда hasLabel=true и shape=circle', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: true, shape: 'circle' },
			})

			expect(container.querySelector('.base-progress__circle-label')).toBeInTheDocument()
		})
	})

	describe('пропс isIndeterminate', () => {
		it('должен применять модификатор --indeterminate когда isIndeterminate=true', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, isIndeterminate: true },
			})

			expect(container.querySelector('.base-progress')?.classList.contains('base-progress--indeterminate')).toBe(true)
		})
	})

	describe('пропс animation', () => {
		it('должен применять модификатор --striped когда animation=striped', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, animation: 'striped' },
			})

			expect(container.querySelector('.base-progress')?.classList.contains('base-progress--striped')).toBe(true)
		})

		it('должен применять модификатор --pulse когда animation=pulse', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, animation: 'pulse' },
			})

			expect(container.querySelector('.base-progress')?.classList.contains('base-progress--pulse')).toBe(true)
		})

		it('не должен применять модификатор анимации когда animation=none', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, animation: 'none' },
			})

			const el = container.querySelector('.base-progress')
			expect(el?.classList.contains('base-progress--none')).toBe(false)
			expect(el?.classList.contains('base-progress--striped')).toBe(false)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать style когда sizeScale=100', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, sizeScale: 100 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('style')).toBeNull()
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, sizeScale: 150 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('style')).toContain('--size-scale: 1.5')
		})
	})

	describe('пропс value — граничные значения', () => {
		it('должен устанавливать 0% когда value=0', () => {
			const { container } = render(BaseProgress, {
				props: { value: 0 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('aria-valuenow')).toBe('0')
			expect(container.querySelector('.base-progress__fill')?.getAttribute('style')).toContain('width: 0%')
		})

		it('должен устанавливать 50% когда value=50', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('aria-valuenow')).toBe('50')
			expect(container.querySelector('.base-progress__fill')?.getAttribute('style')).toContain('width: 50%')
		})

		it('должен устанавливать 100% когда value=100', () => {
			const { container } = render(BaseProgress, {
				props: { value: 100 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('aria-valuenow')).toBe('100')
			expect(container.querySelector('.base-progress__fill')?.getAttribute('style')).toContain('width: 100%')
		})

		it('должен ограничивать value сверху при value>max', () => {
			const { container } = render(BaseProgress, {
				props: { value: 150 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('aria-valuenow')).toBe('100')
		})

		it('должен ограничивать value снизу при value<0', () => {
			const { container } = render(BaseProgress, {
				props: { value: -10 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('aria-valuenow')).toBe('0')
		})
	})

	describe('пропс max', () => {
		it('должен использовать max=100 по умолчанию', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('aria-valuenow')).toBe('50')
		})

		it('должен вычислять процент относительно max', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, max: 200 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('aria-valuenow')).toBe('25')
		})

		it('должен устанавливать 100% когда value=max', () => {
			const { container } = render(BaseProgress, {
				props: { value: 200, max: 200 },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('aria-valuenow')).toBe('100')
		})
	})

	describe('пропс color', () => {
		it('должен устанавливать CSS-переменную --custom-bg когда передан color.bg.base', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, color: { bg: { base: '#ff0000' } } },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('style')).toContain('--custom-bg: #ff0000')
		})
	})

	describe('tooltipColor', () => {
		it('должен использовать color.bg.base для тултипа когда передан', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: true, color: { bg: { base: '#00ff00' } } },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('style')).toContain('--custom-bg: #00ff00')
		})

		it('должен использовать var(--color-accent) для тултипа когда color.bg.base не передан', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: true },
			})

			// Проверяем что нет кастомного цвета в style
			const style = container.querySelector('.base-progress')?.getAttribute('style')
			expect(style).toBeNull()
		})
	})

	describe('isIndeterminate mode', () => {
		it('должен возвращать percent=0 когда isIndeterminate=true', () => {
			const { container } = render(BaseProgress, {
				props: { value: 75, isIndeterminate: true },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('aria-valuenow')).toBe('0')
		})

		it('должен рендерить круговой прогресс с full circumference когда isIndeterminate=true', () => {
			const { container } = render(BaseProgress, {
				props: { value: 75, isIndeterminate: true, shape: 'circle' },
			})

			const circle = container.querySelector('.base-progress__fill-circle')
			// stroke-dashoffset должен быть равен circumference (2 * Math.PI * 52 ≈ 326.73)
			const dashoffset = circle?.getAttribute('stroke-dashoffset')
			const expectedOffset = (2 * Math.PI * 52).toFixed(2)
			expect(parseFloat(dashoffset || '0')).toBeCloseTo(parseFloat(expectedOffset), 1)
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, customClass: 'custom-progress-root' },
			})

			expect(container.querySelector('.base-progress')).toHaveClass('custom-progress-root')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseProgress, {
				props: {
					value: 50,
					hasLabel: true,
					shape: 'circle',
					customClass: {
						root: 'custom-root',
						trackCircle: 'custom-track-circle',
						fillCircle: 'custom-fill-circle',
						circleLabel: 'custom-circle-label',
					},
				},
			})

			expect(container.querySelector('.base-progress')).toHaveClass('custom-root')
			expect(container.querySelector('.base-progress__track-circle')).toHaveClass('custom-track-circle')
			expect(container.querySelector('.base-progress__fill-circle')).toHaveClass('custom-fill-circle')
			expect(container.querySelector('.base-progress__circle-label')).toHaveClass('custom-circle-label')
		})

		it('должен распределять объект классов по внутренним элементам для линейного вида', () => {
			const { container } = render(BaseProgress, {
				props: {
					value: 50,
					hasLabel: true,
					shape: 'line',
					customClass: {
						root: 'custom-root',
						track: 'custom-track',
						fill: 'custom-fill',
						tooltipTrigger: 'custom-tooltip-trigger',
						tooltipAnchor: 'custom-tooltip-anchor',
					},
				},
			})

			expect(container.querySelector('.base-progress')).toHaveClass('custom-root')
			expect(container.querySelector('.base-progress__track')).toHaveClass('custom-track')
			expect(container.querySelector('.base-progress__fill')).toHaveClass('custom-fill')
			expect(container.querySelector('.base-progress__tooltip-trigger')).toHaveClass('custom-tooltip-trigger')
			expect(container.querySelector('.base-progress__tooltip-anchor')).toHaveClass('custom-tooltip-anchor')
		})
	})

	describe('событие complete', () => {
		it('эмитит complete при достижении 100%', async () => {
			const { rerender, emitted } = render(BaseProgress, {
				props: {
					value: 50,
				},
			})

			await rerender({ value: 100 })
			expect(emitted()).toHaveProperty('complete')
		})

		it('не эмитит complete при значении меньше 100%', async () => {
			const { rerender, emitted } = render(BaseProgress, {
				props: {
					value: 50,
				},
			})

			await rerender({ value: 80 })
			expect(emitted()).not.toHaveProperty('complete')
		})
	})
})
