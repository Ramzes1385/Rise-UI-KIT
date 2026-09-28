import '@testing-library/jest-dom/vitest'
import BaseProgress from '../ui/BaseProgress.vue'
import { render, screen } from '@testing-library/vue'

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
		it('должен рендерить подпись с процентом когда hasLabel=true и shape=line', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: true },
			})

			expect(container.querySelector('.base-progress__status')).toHaveTextContent('50%')
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

	describe('некорректные value/max', () => {
		it.each([
			['value=NaN', { value: Number.NaN }],
			['max=0', { value: 10, max: 0 }],
			['max=NaN', { value: 10, max: Number.NaN }],
			['max<0', { value: 10, max: -50 }],
		])('не должен выводить «NaN» и лишний прогресс при %s', (_, props) => {
			const { container } = render(BaseProgress, {
				props: { ...props, shape: 'circle', hasLabel: true },
			})

			const progressbar = screen.getByRole('progressbar')
			expect(progressbar).toHaveAttribute('aria-valuenow', '0')
			expect(container.textContent).not.toContain('NaN')
			expect(container.querySelector('.base-progress__circle-label')).toHaveTextContent('0%')
		})

		it('не должен эмитить complete при некорректном max', async () => {
			const { emitted, rerender } = render(BaseProgress, { props: { value: 10, max: 100 } })

			await rerender({ value: 10, max: -1 })

			expect(emitted()).not.toHaveProperty('complete')
		})

		it('должен ограничивать value=Infinity до 100%', () => {
			render(BaseProgress, { props: { value: Number.POSITIVE_INFINITY } })

			expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
		})
	})

	describe('доступное имя', () => {
		it('должен иметь доступное имя по умолчанию', () => {
			render(BaseProgress, { props: { value: 40 } })

			expect(screen.getByRole('progressbar', { name: 'Прогресс' })).toBeInTheDocument()
		})

		it('должен использовать ariaLabel как доступное имя', () => {
			render(BaseProgress, { props: { value: 40, ariaLabel: 'Загрузка файла' } })

			expect(screen.getByRole('progressbar', { name: 'Загрузка файла' })).toBeInTheDocument()
		})

		it('должен уступать имя внешнему aria-labelledby', () => {
			render({
				components: { BaseProgress },
				template: '<span id="upload-caption">Отчёт.pdf</span><BaseProgress :value="40" aria-labelledby="upload-caption" />',
			})

			expect(screen.getByRole('progressbar', { name: 'Отчёт.pdf' })).toBeInTheDocument()
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

	describe('цвет заливки с подписью', () => {
		it('должен задавать --custom-bg на корне и при hasLabel (цвет заливки читают полоса и кольцо)', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: true, color: { bg: { base: '#00ff00' } } },
			})

			expect(container.querySelector('.base-progress')?.getAttribute('style')).toContain('--custom-bg: #00ff00')
		})

		it('не должен задавать inline-стили без пропа color (цвет берётся из токена --rise-primary)', () => {
			const { container } = render(BaseProgress, {
				props: { value: 50, hasLabel: true },
			})

			const style = container.querySelector('.base-progress')?.getAttribute('style')
			expect(style).toBeNull()
		})
	})

	describe('isIndeterminate mode', () => {
		it.each(['line', 'circle'] as const)('не должен показывать «0%» в неопределённом режиме (shape=%s)', shape => {
			render(BaseProgress, {
				props: { value: 75, isIndeterminate: true, hasLabel: true, shape },
			})

			expect(screen.getByRole('progressbar')).not.toHaveTextContent('%')
		})

		it('не должен задавать ширину заливки в неопределённом режиме (её задают стили бегущей полосы)', () => {
			const { container } = render(BaseProgress, {
				props: { value: 75, isIndeterminate: true },
			})

			expect((container.querySelector('.base-progress__fill') as HTMLElement).style.width).toBe('')
		})

		it('не должен сообщать aria-valuenow когда isIndeterminate=true (значение неизвестно)', () => {
			render(BaseProgress, {
				props: { value: 75, isIndeterminate: true },
			})

			expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow')
		})

		it('должен вернуть aria-valuenow после выхода из неопределённого режима', async () => {
			const { rerender } = render(BaseProgress, {
				props: { value: 75, isIndeterminate: true },
			})

			await rerender({ value: 75, isIndeterminate: false })

			expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75')
		})

		it('должен рендерить круговой прогресс с full circumference когда isIndeterminate=true', () => {
			const { container } = render(BaseProgress, {
				props: { value: 75, isIndeterminate: true, shape: 'circle' },
			})

			const circle = container.querySelector('.base-progress__fill-circle')
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
			expect(container.querySelector('.base-progress__status')).toHaveClass('custom-tooltip-trigger')
			expect(container.querySelector('.base-progress__status-text')).toHaveClass('custom-tooltip-anchor')
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
