/**
 * Unit-тесты для BaseColorPicker.
 * Покрывают: рендер swatch, открытие панели, выбор тона, ручной ввод HEX,
 * выбор пресета, выбор в SV-области, состояние disabled и кастомные пресеты.
 */

import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { UI_COLOR_PICKER } from '@/locales/messages'
import BaseColorPicker from '../ui/BaseColorPicker.vue'
import { DEFAULT_COLOR_PRESETS } from '../model/colorPresets'

/** Мок размеров SV-области (200×140 в начале координат) */
function mockAreaRect(): void {
	Element.prototype.getBoundingClientRect = vi.fn(() => ({
		width: 200,
		height: 140,
		top: 0,
		left: 0,
		bottom: 140,
		right: 200,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	}))
}

/** Открыть панель кликом по swatch и вернуть её корень из body */
async function openPanel(container: ParentNode): Promise<HTMLElement> {
	const swatch = container.querySelector('.base-color-picker__swatch')
	if (!swatch) throw new Error('Swatch не найден')
	await fireEvent.click(swatch)
	const panel = document.body.querySelector<HTMLElement>('.base-color-picker__panel')
	if (!panel) throw new Error('Панель не открылась')
	return panel
}

afterEach(() => {
	document.body.querySelectorAll('.base-dropdown__panel').forEach(element => element.remove())
})

describe('BaseColorPicker — unit', () => {
	it('рендерит swatch с цветом текущего значения', () => {
		const { container } = render(BaseColorPicker, { props: { modelValue: '#ff0000' } })
		const swatch = container.querySelector<HTMLElement>('.base-color-picker__swatch')
		expect(swatch).toBeInTheDocument()
		expect(swatch?.style.backgroundColor).toBe('rgb(255, 0, 0)')
	})

	it('использует цвет палитры для swatch при невалидном modelValue', () => {
		const { container } = render(BaseColorPicker, { props: { modelValue: 'invalid' } })
		const swatch = container.querySelector<HTMLElement>('.base-color-picker__swatch')
		expect(swatch?.style.backgroundColor).toBe('rgb(0, 0, 0)')
	})

	it('блокирует swatch при isDisabled=true', () => {
		const { container } = render(BaseColorPicker, { props: { modelValue: '#ff0000', isDisabled: true } })
		expect(container.querySelector('.base-color-picker__swatch')).toBeDisabled()
	})

	it('открывает панель по клику на swatch', async () => {
		const { container } = render(BaseColorPicker, { props: { modelValue: '#ff0000' } })
		const panel = await openPanel(container)
		expect(panel).toBeInTheDocument()
	})

	it('эмитит update:modelValue и change при изменении тона', async () => {
		const { container, emitted } = render(BaseColorPicker, { props: { modelValue: '#ff0000' } })
		const panel = await openPanel(container)
		const hue = panel.querySelector('.base-color-picker__hue')
		if (!hue) throw new Error('Слайдер тона не найден')
		await fireEvent.update(hue, '120')
		expect(emitted()).toHaveProperty('update:modelValue')
		expect(emitted()).toHaveProperty('change')
	})

	it('применяет валидный HEX из поля ввода', async () => {
		const { container, emitted } = render(BaseColorPicker, { props: { modelValue: '#ff0000' } })
		const panel = await openPanel(container)
		const hex = panel.querySelector('.base-color-picker__hex') as HTMLInputElement
		hex.value = '#00ff00'
		await fireEvent.change(hex)
		const events = emitted()['update:modelValue'] as string[][]
		expect(events.at(-1)?.[0]).toBe('#00ff00')
	})

	it('выбирает цвет-пресет по клику', async () => {
		const { container, emitted } = render(BaseColorPicker, { props: { modelValue: '#ff0000' } })
		const panel = await openPanel(container)
		const preset = panel.querySelector('.base-color-picker__preset')
		if (!preset) throw new Error('Пресет не найден')
		await fireEvent.click(preset)
		expect(emitted()).toHaveProperty('update:modelValue')
	})

	it.each(DEFAULT_COLOR_PRESETS)('эмитит точный HEX пресета %s без искажения через HSV', async preset => {
		const { container, emitted } = render(BaseColorPicker, { props: { modelValue: '#000000' } })
		await openPanel(container)
		await fireEvent.click(screen.getByRole('button', { name: `${UI_COLOR_PICKER.PRESET} ${preset}` }))
		expect(emitted()['update:modelValue']).toEqual([[preset]])
		expect(emitted().change).toEqual([[preset]])
	})

	it('эмитит введённый HEX без искажения через HSV', async () => {
		const { container, emitted } = render(BaseColorPicker, { props: { modelValue: '#ff0000' } })
		await openPanel(container)
		const hex = screen.getByRole<HTMLInputElement>('textbox', { name: UI_COLOR_PICKER.HEX_VALUE })
		hex.value = '#123456'
		await fireEvent.change(hex)
		expect(emitted()['update:modelValue']).toEqual([['#123456']])
	})

	it('выбирает saturation/value кликом по SV-области', async () => {
		mockAreaRect()
		const { container, emitted } = render(BaseColorPicker, { props: { modelValue: '#ff0000' } })
		const panel = await openPanel(container)
		const area = panel.querySelector('.base-color-picker__area')
		if (!area) throw new Error('SV-область не найдена')
		await fireEvent.pointerDown(area, { clientX: 100, clientY: 70 })
		const move = Object.assign(new Event('pointermove'), { clientX: 150, clientY: 35 })
		window.dispatchEvent(move)
		window.dispatchEvent(new Event('pointerup'))
		expect(emitted()).toHaveProperty('update:modelValue')
	})

	it('снимает pointer-листенеры при размонтировании во время перетаскивания', async () => {
		mockAreaRect()
		const { container, emitted, unmount } = render(BaseColorPicker, { props: { modelValue: '#ff0000' } })
		const panel = await openPanel(container)
		const area = panel.querySelector('.base-color-picker__area')
		if (!area) throw new Error('SV-область не найдена')
		await fireEvent.pointerDown(area, { clientX: 100, clientY: 70 })
		await nextTick()
		unmount()
		const countBefore = ((emitted()['update:modelValue'] as unknown[]) ?? []).length
		const move = Object.assign(new Event('pointermove'), { clientX: 10, clientY: 10 })
		window.dispatchEvent(move)
		await nextTick()
		const after = (emitted()['update:modelValue'] as unknown[]) ?? []
		expect(after.length).toBe(countBefore)
	})

	it('скрывает поле HEX при isHexHidden=true', async () => {
		const { container } = render(BaseColorPicker, { props: { modelValue: '#ff0000', isHexHidden: true } })
		const panel = await openPanel(container)
		expect(panel.querySelector('.base-color-picker__hex')).toBeNull()
	})

	it('скрывает пресеты при isPresetsHidden=true', async () => {
		const { container } = render(BaseColorPicker, { props: { modelValue: '#ff0000', isPresetsHidden: true } })
		const panel = await openPanel(container)
		expect(panel.querySelector('.base-color-picker__presets')).toBeNull()
	})

	it('рендерит переданный набор пресетов', async () => {
		const { container } = render(BaseColorPicker, {
			props: { modelValue: '#ff0000', presets: ['#111111', '#222222'] },
		})
		const panel = await openPanel(container)
		expect(panel.querySelectorAll('.base-color-picker__preset')).toHaveLength(2)
	})

	it('рендерит содержимое слота trigger', () => {
		const { getByText } = render(BaseColorPicker, {
			props: { modelValue: '#ff0000' },
			slots: { trigger: 'Выбрать' },
		})
		expect(getByText('Выбрать')).toBeInTheDocument()
	})

	it('не рендерит кнопку сброса по умолчанию', async () => {
		const { container } = render(BaseColorPicker, { props: { modelValue: '#ff0000' } })
		const panel = await openPanel(container)
		expect(panel.querySelector('.base-color-picker__reset')).toBeNull()
	})

	it('не заливает swatch цветом при hasTransparentSwatch=true', () => {
		const { container } = render(BaseColorPicker, {
			props: { modelValue: '#ff0000', hasTransparentSwatch: true },
		})
		const swatch = container.querySelector<HTMLElement>('.base-color-picker__swatch')
		expect(swatch?.style.backgroundColor).toBe('')
	})

	it('рендерит кнопку сброса с подписью и эмитит reset', async () => {
		const { container, emitted } = render(BaseColorPicker, {
			props: { modelValue: '#ff0000', isResettable: true, resetLabel: 'Без цвета' },
		})
		const panel = await openPanel(container)
		const reset = panel.querySelector('.base-color-picker__reset')
		if (!reset) throw new Error('Кнопка сброса не найдена')
		expect(reset).toHaveTextContent('Без цвета')
		await fireEvent.click(reset)
		expect(emitted()).toHaveProperty('reset')
	})

	describe('доступность', () => {
		it('образец сообщает, открыта ли панель (aria-expanded)', async () => {
			const { container } = render(BaseColorPicker, { props: { modelValue: '#ff0000' } })
			const swatch = screen.getByRole('button', { name: `${UI_COLOR_PICKER.SELECTED_COLOR} #ff0000` })

			expect(swatch).toHaveAttribute('aria-expanded', 'false')
			await openPanel(container)
			expect(swatch).toHaveAttribute('aria-expanded', 'true')
		})

		it('SV-область — слайдер в порядке Tab со значением насыщенности', async () => {
			const { container } = render(BaseColorPicker, { props: { modelValue: '#808080' } })
			await openPanel(container)
			const area = screen.getByRole('slider', { name: UI_COLOR_PICKER.SATURATION_BRIGHTNESS })

			expect(area).toHaveAttribute('tabindex', '0')
			expect(area).toHaveAttribute('aria-valuenow', '0')
			expect(area).toHaveAttribute('aria-valuetext', '#808080')
		})

		it('стрелки в SV-области меняют насыщенность и яркость, Shift — шаг 10%', async () => {
			const { container, emitted } = render(BaseColorPicker, { props: { modelValue: '#808080' } })
			await openPanel(container)
			const area = screen.getByRole('slider', { name: UI_COLOR_PICKER.SATURATION_BRIGHTNESS })

			await fireEvent.keyDown(area, { key: 'ArrowRight', shiftKey: true })
			expect(area).toHaveAttribute('aria-valuenow', '10')
			await fireEvent.keyDown(area, { key: 'ArrowLeft' })
			expect(area).toHaveAttribute('aria-valuenow', '9')
			// #808080: яркость 50% → стрелка вверх 51%, вниз с Shift — 41%
			await fireEvent.keyDown(area, { key: 'ArrowUp' })
			await fireEvent.keyDown(area, { key: 'ArrowDown', shiftKey: true })
			await fireEvent.keyDown(area, { key: 'Enter' })
			const updates = emitted()['update:modelValue'] as string[][]
			expect(updates).toHaveLength(4)
			expect(area.querySelector('.base-color-picker__marker')).toHaveStyle({ left: '9%', top: '59%' })
		})

		it('выбранный пресет отмечен aria-pressed и классом, класс пресета из customClass', async () => {
			const { container } = render(BaseColorPicker, {
				props: { modelValue: '#EF4444', customClass: { preset: 'custom-preset' } },
			})
			await openPanel(container)

			const selected = screen.getByRole('button', { name: `${UI_COLOR_PICKER.PRESET} #ef4444` })
			expect(selected).toHaveAttribute('aria-pressed', 'true')
			expect(selected).toHaveClass('base-color-picker__preset--selected', 'custom-preset')
			expect(screen.getByRole('button', { name: `${UI_COLOR_PICKER.PRESET} #f97316` })).toHaveAttribute('aria-pressed', 'false')
		})
	})

	describe('defineExpose (FormFieldExpose)', () => {
		it('должен экспонировать rootRef指向 swatch-кнопку', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseColorPicker, { props: { modelValue: '#ff0000' } })

			const exposed = wrapper.vm as unknown as { rootRef: HTMLElement | null }
			expect(exposed.rootRef).toBeInstanceOf(HTMLElement)
			expect(exposed.rootRef?.classList.contains('base-color-picker__swatch')).toBe(true)
			wrapper.unmount()
		})

		it('должен вызывать focus на swatch через exposed.focus()', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseColorPicker, { props: { modelValue: '#ff0000' } })
			const swatch = wrapper.find('.base-color-picker__swatch').element as HTMLElement
			const focusSpy = vi.spyOn(swatch, 'focus')

			const exposed = wrapper.vm as unknown as { focus: () => void }
			exposed.focus()

			expect(focusSpy).toHaveBeenCalled()
			wrapper.unmount()
		})

		it('должен вызывать blur на swatch через exposed.blur()', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseColorPicker, { props: { modelValue: '#ff0000' } })
			const swatch = wrapper.find('.base-color-picker__swatch').element as HTMLElement
			const blurSpy = vi.spyOn(swatch, 'blur')

			const exposed = wrapper.vm as unknown as { blur: () => void }
			exposed.blur()

			expect(blurSpy).toHaveBeenCalled()
			wrapper.unmount()
		})

		it('должен возвращать isValid при вызове exposed.validate()', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseColorPicker, { props: { modelValue: '#ff0000' } })

			const exposed = wrapper.vm as unknown as { validate: () => boolean }
			const result = exposed.validate()

			expect(typeof result).toBe('boolean')
			expect(result).toBe(true)
			wrapper.unmount()
		})

		it('должен сбрасывать состояние при вызове exposed.reset()', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseColorPicker, { props: { modelValue: '#ff0000' } })

			const exposed = wrapper.vm as unknown as { reset: () => void }
			expect(() => exposed.reset()).not.toThrow()
			wrapper.unmount()
		})
	})
})
