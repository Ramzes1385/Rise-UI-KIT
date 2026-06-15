/**
 * Integration-тесты для BaseRange.
 * Проверяют взаимодействие: клик по треку, перетаскивание, клавиатура.
 */

import { BaseText } from '@components/BaseText'
import { BaseTooltip } from '@components/BaseTooltip'
import '@testing-library/jest-dom/vitest'
import { fireEvent, render } from '@testing-library/vue'
import BaseRange from '../ui/BaseRange.vue'

/** Общие глобальные компоненты для всех тестов */
const globalComponents = { components: { BaseText, BaseTooltip } }

/** Мок getBoundingClientRect для трека */
function mockTrackRect(width = 200, height = 20): void {
	Element.prototype.getBoundingClientRect = vi.fn(() => ({
		width,
		height,
		top: 0,
		left: 0,
		bottom: height,
		right: width,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	}))
}

describe('BaseRange integration', () => {
	beforeEach(() => {
		mockTrackRect()
	})

	describe('клик по треку', () => {
		it('должен эмитить update:modelValue при клике на трек', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 0, min: 0, max: 100 },
				global: globalComponents,
			})

			const track = container.querySelector('.base-range__track-wrapper')
			if (!track) throw new Error('Track not found')

			await fireEvent.mouseDown(track, { clientX: 100 })
			await fireEvent.mouseUp(document)

			expect(emitted()).toHaveProperty('update:modelValue')
		})

		it('должен эмитить update:rangeValue при клике в режиме диапазона', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { rangeValue: [20, 80], min: 0, max: 100 },
				global: globalComponents,
			})

			const track = container.querySelector('.base-range__track-wrapper')
			if (!track) throw new Error('Track not found')

			await fireEvent.mouseDown(track, { clientX: 50 })
			await fireEvent.mouseUp(document)

			expect(emitted()).toHaveProperty('update:rangeValue')
		})
	})

	describe('перетаскивание ползунка', () => {
		it('должен эмитить update:modelValue при перетаскивании', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 0, min: 0, max: 100 },
				global: globalComponents,
			})

			const thumb = container.querySelector('.base-range__thumb')
			if (!thumb) throw new Error('Thumb not found')

			await fireEvent.mouseDown(thumb, { clientX: 0 })
			await fireEvent.mouseMove(document, { clientX: 100 })
			await fireEvent.mouseUp(document)

			expect(emitted()).toHaveProperty('update:modelValue')
		})
	})

	describe('клавиатурное управление', () => {
		it('должен увеличивать значение при ArrowRight', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 50, min: 0, max: 100, step: 1 },
				global: globalComponents,
			})

			const thumb = container.querySelector('.base-range__thumb')
			if (!thumb) throw new Error('Thumb not found')

			await fireEvent.keyDown(thumb, { key: 'ArrowRight' })

			expect(emitted()).toHaveProperty('update:modelValue')
			const events = emitted('update:modelValue') as number[][]
			expect(events[0][0]).toBe(51)
		})

		it('должен уменьшать значение при ArrowLeft', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 50, min: 0, max: 100, step: 1 },
				global: globalComponents,
			})

			const thumb = container.querySelector('.base-range__thumb')
			if (!thumb) throw new Error('Thumb not found')

			await fireEvent.keyDown(thumb, { key: 'ArrowLeft' })

			expect(emitted()).toHaveProperty('update:modelValue')
			const events = emitted('update:modelValue') as number[][]
			expect(events[0][0]).toBe(49)
		})
	})

	describe('событие change', () => {
		it('должен эмитить change после завершения перетаскивания', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 0, min: 0, max: 100 },
				global: globalComponents,
			})

			const thumb = container.querySelector('.base-range__thumb')
			if (!thumb) throw new Error('Thumb not found')

			await fireEvent.mouseDown(thumb, { clientX: 0 })
			await fireEvent.mouseMove(document, { clientX: 100 })
			await fireEvent.mouseUp(document)

			expect(emitted()).toHaveProperty('change')
		})
	})

	describe('привязка к шагу (step)', () => {
		it('должен привязывать значение к шагу при клике на трек', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 0, min: 0, max: 100, step: 10 },
				global: globalComponents,
			})

			const track = container.querySelector('.base-range__track-wrapper')
			if (!track) throw new Error('Track not found')

			// clientX=35 → ratio=35/200=0.175 → raw=17.5 → snap к 20
			await fireEvent.mouseDown(track, { clientX: 35 })
			await fireEvent.mouseUp(document)

			expect(emitted()).toHaveProperty('update:modelValue')
			const events = emitted('update:modelValue') as number[][]
			expect(events[0][0]).toBe(20)
		})

		it('должен привязывать значение к шагу при перетаскивании', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 0, min: 0, max: 100, step: 25 },
				global: globalComponents,
			})

			const thumb = container.querySelector('.base-range__thumb')
			if (!thumb) throw new Error('Thumb not found')

			// clientX=90 → ratio=90/200=0.45 → raw=45 → snap к 50
			await fireEvent.mouseDown(thumb, { clientX: 0 })
			await fireEvent.mouseMove(document, { clientX: 90 })
			await fireEvent.mouseUp(document)

			expect(emitted()).toHaveProperty('update:modelValue')
			const events = emitted('update:modelValue') as number[][]
			expect(events[0][0]).toBe(50)
		})

		it('должен увеличивать значение на step при ArrowRight', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 20, min: 0, max: 100, step: 10 },
				global: globalComponents,
			})

			const thumb = container.querySelector('.base-range__thumb')
			if (!thumb) throw new Error('Thumb not found')

			await fireEvent.keyDown(thumb, { key: 'ArrowRight' })

			expect(emitted()).toHaveProperty('update:modelValue')
			const events = emitted('update:modelValue') as number[][]
			expect(events[0][0]).toBe(30)
		})

		it('должен уменьшать значение на step при ArrowLeft', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 50, min: 0, max: 100, step: 10 },
				global: globalComponents,
			})

			const thumb = container.querySelector('.base-range__thumb')
			if (!thumb) throw new Error('Thumb not found')

			await fireEvent.keyDown(thumb, { key: 'ArrowLeft' })

			expect(emitted()).toHaveProperty('update:modelValue')
			const events = emitted('update:modelValue') as number[][]
			expect(events[0][0]).toBe(40)
		})

		it('не должен превышать max при увеличении', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 95, min: 0, max: 100, step: 10 },
				global: globalComponents,
			})

			const thumb = container.querySelector('.base-range__thumb')
			if (!thumb) throw new Error('Thumb not found')

			await fireEvent.keyDown(thumb, { key: 'ArrowRight' })

			expect(emitted()).toHaveProperty('update:modelValue')
			const events = emitted('update:modelValue') as number[][]
			expect(events[0][0]).toBe(100)
		})

		it('не должен быть меньше min при уменьшении', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 5, min: 0, max: 100, step: 10 },
				global: globalComponents,
			})

			const thumb = container.querySelector('.base-range__thumb')
			if (!thumb) throw new Error('Thumb not found')

			await fireEvent.keyDown(thumb, { key: 'ArrowLeft' })

			expect(emitted()).toHaveProperty('update:modelValue')
			const events = emitted('update:modelValue') as number[][]
			expect(events[0][0]).toBe(0)
		})

		describe('вертикальный режим', () => {
			it('должен вычислять значение из позиции для вертикального режима', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { modelValue: 0, min: 0, max: 100, isVertical: true },
					global: globalComponents,
				})

				const track = container.querySelector('.base-range__track-wrapper')
				if (!track) throw new Error('Track not found')

				// clientY=50, height=20 → ratio=1-(50-0)/20=1-2.5=-1.5 → clamped к 0 → value=0
				// Но нам нужно clientY внутри трека: clientY=10 → ratio=1-10/20=0.5 → value=50
				await fireEvent.mouseDown(track, { clientY: 10 })
				await fireEvent.mouseUp(document)

				expect(emitted()).toHaveProperty('update:modelValue')
				const events = emitted('update:modelValue') as number[][]
				expect(events[0][0]).toBe(50)
			})

			it('должен применять модификатор --vertical', () => {
				const { container } = render(BaseRange, {
					props: { isVertical: true },
					global: globalComponents,
				})

				expect(container.querySelector('.base-range')?.classList.contains('base-range--vertical')).toBe(true)
			})
		})

		describe('режим disabled', () => {
			it('не должен реагировать на клик по треку когда isDisabled=true', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { modelValue: 0, min: 0, max: 100, isDisabled: true },
					global: globalComponents,
				})

				const track = container.querySelector('.base-range__track-wrapper')
				if (!track) throw new Error('Track not found')

				await fireEvent.mouseDown(track, { clientX: 100 })
				await fireEvent.mouseUp(document)

				expect(emitted()).not.toHaveProperty('update:modelValue')
			})

			it('не должен реагировать на перетаскивание когда isDisabled=true', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { modelValue: 0, min: 0, max: 100, isDisabled: true },
					global: globalComponents,
				})

				const thumb = container.querySelector('.base-range__thumb')
				if (!thumb) throw new Error('Thumb not found')

				await fireEvent.mouseDown(thumb, { clientX: 0 })
				await fireEvent.mouseMove(document, { clientX: 100 })
				await fireEvent.mouseUp(document)

				expect(emitted()).not.toHaveProperty('update:modelValue')
			})

			it('не должен реагировать на клавиатуру когда isDisabled=true', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { modelValue: 50, min: 0, max: 100, isDisabled: true },
					global: globalComponents,
				})

				const thumb = container.querySelector('.base-range__thumb')
				if (!thumb) throw new Error('Thumb not found')

				await fireEvent.keyDown(thumb, { key: 'ArrowRight' })

				expect(emitted()).not.toHaveProperty('update:modelValue')
			})
		})

		describe('тач-события', () => {
			it('должен эмитить update:modelValue при тач-перетаскивании', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { modelValue: 0, min: 0, max: 100 },
					global: globalComponents,
				})

				const thumb = container.querySelector('.base-range__thumb')
				if (!thumb) throw new Error('Thumb not found')

				await fireEvent.touchStart(thumb, { touches: [{ clientX: 0 }] })
				await fireEvent.touchMove(document, { touches: [{ clientX: 100 }] })
				await fireEvent.touchEnd(document)

				expect(emitted()).toHaveProperty('update:modelValue')
			})

			it('должен эмитить change после тач-перетаскивания', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { modelValue: 0, min: 0, max: 100 },
					global: globalComponents,
				})

				const thumb = container.querySelector('.base-range__thumb')
				if (!thumb) throw new Error('Thumb not found')

				await fireEvent.touchStart(thumb, { touches: [{ clientX: 0 }] })
				await fireEvent.touchMove(document, { touches: [{ clientX: 100 }] })
				await fireEvent.touchEnd(document)

				expect(emitted()).toHaveProperty('change')
			})
		})

		describe('режим диапазона (rangeValue)', () => {
			it('должен обновлять первое значение диапазона', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { rangeValue: [20, 80], min: 0, max: 100 },
					global: globalComponents,
				})

				const thumbs = container.querySelectorAll('.base-range__thumb')
				if (thumbs.length < 2) throw new Error('Thumbs not found')

				// clientX=100 при ширине трека 200 → ratio=0.5 → value=50
				await fireEvent.mouseDown(thumbs[0], { clientX: 0 })
				await fireEvent.mouseMove(document, { clientX: 100 })
				await fireEvent.mouseUp(document)

				expect(emitted()).toHaveProperty('update:rangeValue')
				const events = emitted('update:rangeValue') as number[][][]
				expect(events[0][0]).toEqual([50, 80])
			})

			it('должен обновлять второе значение диапазона', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { rangeValue: [20, 80], min: 0, max: 100 },
					global: globalComponents,
				})

				const thumbs = container.querySelectorAll('.base-range__thumb')
				if (thumbs.length < 2) throw new Error('Thumbs not found')

				// clientX=200 при ширине трека 200 → ratio=1 → value=100
				await fireEvent.mouseDown(thumbs[1], { clientX: 0 })
				await fireEvent.mouseMove(document, { clientX: 200 })
				await fireEvent.mouseUp(document)

				expect(emitted()).toHaveProperty('update:rangeValue')
				const events = emitted('update:rangeValue') as number[][][]
				expect(events[0][0]).toEqual([20, 100])
			})

			it('должен обновлять второе значение диапазона по touch-событию', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { rangeValue: [20, 80], min: 0, max: 100 },
					global: globalComponents,
				})

				const thumbs = container.querySelectorAll('.base-range__thumb')
				if (thumbs.length < 2) throw new Error('Thumbs not found')

				await fireEvent.touchStart(thumbs[1], { touches: [{ clientX: 0 }] })
				await fireEvent.touchMove(document, { touches: [{ clientX: 200 }] })
				await fireEvent.touchEnd(document)

				expect(emitted()).toHaveProperty('update:rangeValue')
			})

			it('должен эмитить change для диапазона', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { rangeValue: [20, 80], min: 0, max: 100 },
					global: globalComponents,
				})

				const thumbs = container.querySelectorAll('.base-range__thumb')
				if (thumbs.length < 2) throw new Error('Thumbs not found')

				await fireEvent.mouseDown(thumbs[0], { clientX: 0 })
				await fireEvent.mouseMove(document, { clientX: 50 })
				await fireEvent.mouseUp(document)

				expect(emitted()).toHaveProperty('change')
			})

			it('первое значение не должно превышать второе', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { rangeValue: [20, 80], min: 0, max: 100 },
					global: globalComponents,
				})

				const thumbs = container.querySelectorAll('.base-range__thumb')
				if (thumbs.length < 2) throw new Error('Thumbs not found')

				// Пытаемся перетащить первый ползунок за второй
				await fireEvent.mouseDown(thumbs[0], { clientX: 0 })
				await fireEvent.mouseMove(document, { clientX: 180 }) // > 80% от 200px
				await fireEvent.mouseUp(document)

				expect(emitted()).toHaveProperty('update:rangeValue')
				const events = emitted('update:rangeValue') as number[][][]
				// Первое значение должно быть ограничено вторым (80)
				expect(events[0][0][0]).toBe(80)
				expect(events[0][0][1]).toBe(80)
			})

			it('второе значение не должно быть меньше первого', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { rangeValue: [20, 80], min: 0, max: 100 },
					global: globalComponents,
				})

				const thumbs = container.querySelectorAll('.base-range__thumb')
				if (thumbs.length < 2) throw new Error('Thumbs not found')

				// Пытаемся перетащить второй ползунок за первый
				await fireEvent.mouseDown(thumbs[1], { clientX: 0 })
				await fireEvent.mouseMove(document, { clientX: 10 }) // < 20% от 200px
				await fireEvent.mouseUp(document)

				expect(emitted()).toHaveProperty('update:rangeValue')
				const events = emitted('update:rangeValue') as number[][][]
				// Второе значение должно быть ограничено первым (20)
				expect(events[0][0][0]).toBe(20)
				expect(events[0][0][1]).toBe(20)
			})

			it('клавиатурное управление для первого ползунка в режиме диапазона', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { rangeValue: [20, 80], min: 0, max: 100 },
					global: globalComponents,
				})

				const thumbs = container.querySelectorAll('.base-range__thumb')
				if (thumbs.length < 2) throw new Error('Thumbs not found')

				await fireEvent.keyDown(thumbs[0], { key: 'ArrowRight' })

				expect(emitted()).toHaveProperty('update:rangeValue')
				const events = emitted('update:rangeValue') as number[][][]
				expect(events[0][0]).toEqual([21, 80])
			})

			it('клавиатурное управление для второго ползунка в режиме диапазона', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { rangeValue: [20, 80], min: 0, max: 100 },
					global: globalComponents,
				})

				const thumbs = container.querySelectorAll('.base-range__thumb')
				if (thumbs.length < 2) throw new Error('Thumbs not found')

				await fireEvent.keyDown(thumbs[1], { key: 'ArrowRight' })

				expect(emitted()).toHaveProperty('update:rangeValue')
				const events = emitted('update:rangeValue') as number[][][]
				expect(events[0][0]).toEqual([20, 81])
			})

			it('клавиатурное управление: ArrowUp увеличивает значение', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { modelValue: 50, min: 0, max: 100 },
					global: globalComponents,
				})

				const thumb = container.querySelector('.base-range__thumb')
				if (!thumb) throw new Error('Thumb not found')

				await fireEvent.keyDown(thumb, { key: 'ArrowUp' })

				expect(emitted()).toHaveProperty('update:modelValue')
				const events = emitted('update:modelValue') as number[][]
				expect(events[0][0]).toBe(51)
			})

			it('клавиатурное управление: ArrowDown уменьшает значение', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { modelValue: 50, min: 0, max: 100 },
					global: globalComponents,
				})

				const thumb = container.querySelector('.base-range__thumb')
				if (!thumb) throw new Error('Thumb not found')

				await fireEvent.keyDown(thumb, { key: 'ArrowDown' })

				expect(emitted()).toHaveProperty('update:modelValue')
				const events = emitted('update:modelValue') as number[][]
				expect(events[0][0]).toBe(49)
			})

			it('клавиатурное управление: неизвестная клавиша не меняет значение', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { modelValue: 50, min: 0, max: 100 },
					global: globalComponents,
				})

				const thumb = container.querySelector('.base-range__thumb')
				if (!thumb) throw new Error('Thumb not found')

				await fireEvent.keyDown(thumb, { key: 'Enter' })

				expect(emitted()).not.toHaveProperty('update:modelValue')
			})
		})

		describe('режим нескольких точек (points)', () => {
			it('должен эмитить update:points при перетаскивании среднего ползунка', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { points: [20, 50, 80], min: 0, max: 100 },
					global: globalComponents,
				})

				const thumbs = container.querySelectorAll('.base-range__thumb')
				if (thumbs.length < 3) throw new Error('Thumbs not found')

				// clientX=120 при ширине трека 200 → ratio=0.6 → value=60
				await fireEvent.mouseDown(thumbs[1], { clientX: 0 })
				await fireEvent.mouseMove(document, { clientX: 120 })
				await fireEvent.mouseUp(document)

				expect(emitted()).toHaveProperty('update:points')
				const events = emitted('update:points') as number[][]
				expect(events[0][0]).toEqual([20, 60, 80])
			})

			it('средний ползунок не должен пересекать левого соседа', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { points: [20, 50, 80], min: 0, max: 100 },
					global: globalComponents,
				})

				const thumbs = container.querySelectorAll('.base-range__thumb')
				if (thumbs.length < 3) throw new Error('Thumbs not found')

				// Тащим средний за левого соседа (20) → ограничится 20
				await fireEvent.mouseDown(thumbs[1], { clientX: 0 })
				await fireEvent.mouseMove(document, { clientX: 0 })
				await fireEvent.mouseUp(document)

				const events = emitted('update:points') as number[][]
				expect(events[0][0]).toEqual([20, 20, 80])
			})

			it('средний ползунок не должен пересекать правого соседа', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { points: [20, 50, 80], min: 0, max: 100 },
					global: globalComponents,
				})

				const thumbs = container.querySelectorAll('.base-range__thumb')
				if (thumbs.length < 3) throw new Error('Thumbs not found')

				// Тащим средний за правого соседа (80) → ограничится 80
				await fireEvent.mouseDown(thumbs[1], { clientX: 0 })
				await fireEvent.mouseMove(document, { clientX: 200 })
				await fireEvent.mouseUp(document)

				const events = emitted('update:points') as number[][]
				expect(events[0][0]).toEqual([20, 80, 80])
			})

			it('должен эмитить change с массивом точек', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { points: [20, 50, 80], min: 0, max: 100 },
					global: globalComponents,
				})

				const thumbs = container.querySelectorAll('.base-range__thumb')
				if (thumbs.length < 3) throw new Error('Thumbs not found')

				await fireEvent.mouseDown(thumbs[0], { clientX: 0 })
				await fireEvent.mouseMove(document, { clientX: 20 })
				await fireEvent.mouseUp(document)

				expect(emitted()).toHaveProperty('change')
			})

			it('клавиатурное управление средним ползунком', async () => {
				const { container, emitted } = render(BaseRange, {
					props: { points: [20, 50, 80], min: 0, max: 100, step: 1 },
					global: globalComponents,
				})

				const thumbs = container.querySelectorAll('.base-range__thumb')
				if (thumbs.length < 3) throw new Error('Thumbs not found')

				await fireEvent.keyDown(thumbs[1], { key: 'ArrowRight' })

				const events = emitted('update:points') as number[][]
				expect(events[0][0]).toEqual([20, 51, 80])
			})
		})

		describe('кастомный цвет', () => {
			it('должен устанавливать CSS-переменную --custom-bg', () => {
				const { container } = render(BaseRange, {
					props: { color: { bg: { base: '#ff0000' } } },
					global: globalComponents,
				})

				expect(container.querySelector('.base-range')?.getAttribute('style')).toContain('--custom-bg: #ff0000')
			})
		})
	})
})

