/**
 * Unit-тесты для BaseColorPicker.
 * Покрывают: рендер swatch, открытие панели, выбор тона, ручной ввод HEX,
 * выбор пресета, выбор в SV-области, состояние disabled и кастомные пресеты.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import BaseColorPicker from '../ui/BaseColorPicker.vue'

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
})
