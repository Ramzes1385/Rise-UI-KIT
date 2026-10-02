import '@testing-library/jest-dom/vitest'
import { defineComponent, ref } from 'vue'
import BaseRange from '../ui/BaseRange.vue'
import { BaseText } from '@components/BaseText'
import { BaseTooltip } from '@components/BaseTooltip'
import { fireEvent, render } from '@testing-library/vue'

const globalComponents = { components: { BaseText, BaseTooltip } }

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

		it('должен эмитить change с новым значением при управлении с клавиатуры', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 50, min: 0, max: 100 },
				global: globalComponents,
			})

			await fireEvent.keyDown(container.querySelector('.base-range__thumb')!, { key: 'ArrowRight' })

			expect(emitted('change')).toEqual([[51]])
		})

		it('должен эмитить change с обновлённым диапазоном при управлении с клавиатуры', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { rangeValue: [20, 70], min: 0, max: 100 },
				global: globalComponents,
			})

			await fireEvent.keyDown(container.querySelectorAll('.base-range__thumb')[1], { key: 'ArrowLeft' })

			expect(emitted('change')).toEqual([[[20, 69]]])
		})

		it('должен эмитить change с массивом точек при управлении с клавиатуры', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { points: [20, 50, 80], min: 0, max: 100 },
				global: globalComponents,
			})

			await fireEvent.keyDown(container.querySelectorAll('.base-range__thumb')[1], { key: 'ArrowRight' })

			expect(emitted('change')).toEqual([[[20, 51, 80]]])
		})

		it('не должен эмитить change с клавиатуры, если значение упёрлось в границу', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 100, min: 0, max: 100 },
				global: globalComponents,
			})

			await fireEvent.keyDown(container.querySelector('.base-range__thumb')!, { key: 'ArrowRight' })

			expect(emitted('change')).toBeUndefined()
		})
	})

	describe('точность дробного шага', () => {
		it('должен эмитить значение без хвостов плавающей точки при step=0.1', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 0.2, min: 0, max: 1, step: 0.1 },
				global: globalComponents,
			})

			await fireEvent.keyDown(container.querySelector('.base-range__thumb')!, { key: 'ArrowRight' })

			expect(emitted('update:modelValue')).toEqual([[0.3]])
		})

		it('должен показывать точное значение в подписи и aria-valuenow через v-model', async () => {
			const Host = defineComponent({
				components: { BaseRange },
				setup() {
					const volume = ref(0.5)
					return { volume }
				},
				template: '<BaseRange v-model="volume" :min="0" :max="1" :step="0.05" has-label />',
			})
			const { container } = render(Host, { global: globalComponents })
			const thumb = container.querySelector('.base-range__thumb')!

			await fireEvent.keyDown(thumb, { key: 'ArrowRight' })
			await fireEvent.keyDown(thumb, { key: 'ArrowRight' })

			expect(thumb).toHaveAttribute('aria-valuenow', '0.6')
			expect(container.querySelector('.base-range__label-value')).toHaveTextContent(/^0\.6$/)
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

				await fireEvent.mouseDown(thumbs[0], { clientX: 0 })
				await fireEvent.mouseMove(document, { clientX: 180 })
				await fireEvent.mouseUp(document)

				expect(emitted()).toHaveProperty('update:rangeValue')
				const events = emitted('update:rangeValue') as number[][][]
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

				await fireEvent.mouseDown(thumbs[1], { clientX: 0 })
				await fireEvent.mouseMove(document, { clientX: 10 })
				await fireEvent.mouseUp(document)

				expect(emitted()).toHaveProperty('update:rangeValue')
				const events = emitted('update:rangeValue') as number[][][]
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

	describe('клавиатура APG Slider: Home, End, PageUp, PageDown', () => {
		it.each([
			['Home', 0],
			['End', 100],
			['PageUp', 55],
			['PageDown', 35],
		])('%s ставит одиночный ползунок в %s и эмитит change', async (key, expected) => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 45, min: 0, max: 100, step: 1 },
				global: globalComponents,
			})

			const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
			container.querySelector('.base-range__thumb')!.dispatchEvent(event)

			expect(event.defaultPrevented).toBe(true)
			expect(emitted('update:modelValue')).toEqual([[expected]])
			expect(emitted('change')).toEqual([[expected]])
		})

		it('PageUp у края не выходит за max', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 95, min: 0, max: 100, step: 1 },
				global: globalComponents,
			})

			await fireEvent.keyDown(container.querySelector('.base-range__thumb')!, { key: 'PageUp' })

			expect(emitted('update:modelValue')).toEqual([[100]])
		})

		it('Home и End у диапазона упираются в соседний ползунок', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { rangeValue: [20, 60], min: 0, max: 100, step: 5 },
				global: globalComponents,
			})
			const thumbs = container.querySelectorAll('.base-range__thumb')

			await fireEvent.keyDown(thumbs[1], { key: 'Home' })
			await fireEvent.keyDown(thumbs[0], { key: 'End' })

			expect(emitted('update:rangeValue')).toEqual([[[20, 20]], [[60, 60]]])
		})

		it('End при шаге, который не делит диапазон, ставит последнее значение шага', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 0, min: 0, max: 10, step: 3 },
				global: globalComponents,
			})

			await fireEvent.keyDown(container.querySelector('.base-range__thumb')!, { key: 'End' })

			expect(emitted('update:modelValue')).toEqual([[9]])
		})

		it('Home в min не эмитит change', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 0, min: 0, max: 100 },
				global: globalComponents,
			})

			await fireEvent.keyDown(container.querySelector('.base-range__thumb')!, { key: 'Home' })

			expect(emitted('change')).toBeUndefined()
		})
	})

	describe('проверка min, max, step и значения', () => {
		let warnSpy: ReturnType<typeof vi.spyOn>

		beforeEach(() => {
			warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		})

		afterEach(() => {
			warnSpy.mockRestore()
		})

		it('step = 0 заменяется на 1: стрелка двигает на 1, а не даёт NaN', async () => {
			const { container, emitted } = render(BaseRange, {
				props: { modelValue: 10, step: 0 },
				global: globalComponents,
			})

			await fireEvent.keyDown(container.querySelector('.base-range__thumb')!, { key: 'ArrowRight' })

			expect(emitted('update:modelValue')).toEqual([[11]])
			expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('BaseRange: `step` = 0'))
		})

		it('значение больше max: aria-valuenow и подпись — max', () => {
			const { container } = render(BaseRange, {
				props: { modelValue: 500, max: 100, hasLabel: true },
				global: globalComponents,
			})

			expect(container.querySelector('.base-range__thumb')).toHaveAttribute('aria-valuenow', '100')
			expect(container.querySelector('.base-range__label-value')?.textContent).toBe('100')
		})

		it('max меньше min: границы и подписи сведены к min', () => {
			const { container } = render(BaseRange, {
				props: { modelValue: 5, min: 10, max: 0, hasLabel: true },
				global: globalComponents,
			})
			const thumb = container.querySelector('.base-range__thumb')

			expect(thumb).toHaveAttribute('aria-valuemin', '10')
			expect(thumb).toHaveAttribute('aria-valuemax', '10')
			expect(thumb).toHaveAttribute('aria-valuenow', '10')
			expect(container.querySelector('.base-range__label-max')?.textContent).toBe('10')
			expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('`max` = 0 меньше `min` = 10'))
		})

		it('NaN в max: используется 100', () => {
			const { container } = render(BaseRange, {
				props: { modelValue: 30, max: Number.NaN },
				global: globalComponents,
			})

			expect(container.querySelector('.base-range__thumb')).toHaveAttribute('aria-valuemax', '100')
		})
	})
})
