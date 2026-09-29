import '@testing-library/jest-dom/vitest'
import BaseWaveform from '../ui/BaseWaveform.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

function setup(props: Record<string, unknown> = {}) {
	const result = render(BaseWaveform, { props: { peaks: [0.5, 1, 0.5, 1], duration: 100, label: 'Перемотка', ...props } })
	const slider = screen.getByRole('slider')
	slider.getBoundingClientRect = () => ({ left: 0, width: 200 }) as DOMRect
	const times = () => ((result.emitted('update:currentTime') ?? []) as Array<[number]>).map(([time]) => time)
	const selections = () => ((result.emitted('update:selection') ?? []) as Array<[unknown]>).map(([range]) => range)
	return { ...result, slider, times, selections }
}

describe('BaseWaveform integration', () => {
	it('клавиши: стрелки на step, PageUp/PageDown на десятую часть, Home/End; граница записи', async () => {
		const { slider, times } = setup({ currentTime: 50, step: 5 })
		for (const key of ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Enter']) {
			await fireEvent.keyDown(slider, { key })
		}
		expect(times()).toEqual([55, 55, 45, 45, 60, 40, 0, 100])
	})

	it('Shift со стрелками выделяет фрагмент от позиции и двигает ближний край; Escape снимает выделение', async () => {
		const { slider, selections, rerender } = setup({ currentTime: 50, isSelectable: true })
		await fireEvent.keyDown(slider, { key: 'ArrowRight', shiftKey: true })
		await rerender({ currentTime: 55, selection: { start: 50, end: 55 } })
		await fireEvent.keyDown(slider, { key: 'ArrowRight', shiftKey: true })
		await rerender({ currentTime: 50, selection: { start: 50, end: 60 } })
		await fireEvent.keyDown(slider, { key: 'ArrowLeft', shiftKey: true })
		await fireEvent.keyDown(slider, { key: 'Escape' })
		expect(selections()).toEqual([{ start: 50, end: 55 }, { start: 50, end: 60 }, { start: 45, end: 60 }, null])
	})

	it('без isSelectable Shift не выделяет; Escape без фрагмента ничего не делает', async () => {
		const { slider, selections, times } = setup({ currentTime: 50 })
		await fireEvent.keyDown(slider, { key: 'ArrowRight', shiftKey: true })
		await fireEvent.keyDown(slider, { key: 'Escape' })
		expect(selections()).toEqual([])
		expect(times()).toEqual([55])
	})

	it('нажатие сразу перематывает и снимает выделение; перетаскивание выделяет, позиция — в начало фрагмента', async () => {
		const { slider, times, selections } = setup({ isSelectable: true, selection: { start: 10, end: 20 } })
		await fireEvent.pointerDown(slider, { button: 0, pointerId: 1, clientX: 100 })
		await fireEvent.pointerMove(slider, { pointerId: 1, clientX: 102 })
		await fireEvent.pointerUp(slider, { pointerId: 1, clientX: 102 })
		await fireEvent.pointerDown(slider, { button: 0, pointerId: 1, clientX: 150 })
		await fireEvent.pointerMove(slider, { pointerId: 1, clientX: 60 })
		await fireEvent.pointerUp(slider, { pointerId: 1, clientX: 40 })
		expect(times()).toEqual([50, 75, 20])
		expect(selections()).toEqual([null, { start: 30, end: 75 }, { start: 20, end: 75 }])
	})

	it('без isSelectable позиция идёт за указателем с первого нажатия; за краями — начало и конец', async () => {
		const { slider, times, selections } = setup()
		await fireEvent.pointerDown(slider, { button: 0, pointerId: 1, clientX: 20 })
		await fireEvent.pointerMove(slider, { pointerId: 1, clientX: 21 })
		await fireEvent.pointerMove(slider, { pointerId: 1, clientX: 260 })
		await fireEvent.pointerMove(slider, { pointerId: 1, clientX: -30 })
		await fireEvent.pointerUp(slider, { pointerId: 1, clientX: -30 })
		expect(times()).toEqual([10, 10.5, 100, 0])
		expect(selections()).toEqual([])
	})

	it('правая кнопка, движение без нажатия, отпускание после отмены жеста и отключённая волна — без перемотки', async () => {
		const { slider, times, rerender } = setup()
		await fireEvent.pointerMove(slider, { clientX: 50 })
		await fireEvent.pointerUp(slider, { clientX: 50 })
		await fireEvent.pointerDown(slider, { button: 2, clientX: 50 })
		await fireEvent.pointerDown(slider, { button: 0, clientX: 50 })
		await fireEvent.pointerCancel(slider)
		await fireEvent.pointerMove(slider, { clientX: 150 })
		await fireEvent.pointerUp(slider, { clientX: 150 })
		await rerender({ isDisabled: true })
		await fireEvent.pointerDown(slider, { button: 0, clientX: 50 })
		await fireEvent.keyDown(slider, { key: 'End' })
		expect(times()).toEqual([25])
	})

	it('шкала нулевой ширины даёт начало записи', async () => {
		const { slider, times } = setup()
		slider.getBoundingClientRect = () => ({ left: 0, width: 0 }) as DOMRect
		await fireEvent.pointerDown(slider, { button: 0, pointerId: 1, clientX: 50 })
		await fireEvent.pointerUp(slider, { pointerId: 1, clientX: 50 })
		expect(times()).toEqual([0])
	})
})
