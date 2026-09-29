import '@testing-library/jest-dom/vitest'
import MediaSlider from '../ui/MediaSlider.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { MediaSliderProps } from '../types/MediaSlider.types'

const PROPS: MediaSliderProps = {
	modelValue: 15,
	max: 60,
	step: 5,
	largeStep: 10,
	label: 'Перемотка',
	valueText: '0:15 из 1:00',
	buffered: [[0, 30]],
}

function setup(props: Partial<MediaSliderProps> = {}) {
	const result = render(MediaSlider, { props: { ...PROPS, ...props } })
	const slider = screen.getByRole('slider', { name: 'Перемотка' })
	const root = result.container.querySelector('.base-media-player__slider') as HTMLElement
	const values = () => (result.emitted<[number]>('update:modelValue') ?? []).map(([value]) => value)
	return { ...result, slider, root, values }
}

describe('MediaSlider', () => {
	it('значение, максимум, текст для скринридера и заполнение дорожки', () => {
		const { slider, container } = setup()

		expect(slider).toHaveAttribute('aria-valuenow', '15')
		expect(slider).toHaveAttribute('aria-valuemax', '60')
		expect(slider).toHaveAttribute('aria-valuetext', '0:15 из 1:00')
		expect(slider).not.toHaveAttribute('aria-disabled')
		expect(slider.style.left).toBe('25%')
		expect((container.querySelector('.base-media-player__slider-fill') as HTMLElement).style.width).toBe('25%')
		const buffered = container.querySelector('.base-media-player__slider-buffered') as HTMLElement
		expect([buffered.style.left, buffered.style.width]).toEqual(['0%', '50%'])
	})

	it.each([
		['ArrowRight', 20],
		['ArrowUp', 20],
		['ArrowLeft', 10],
		['ArrowDown', 10],
		['PageUp', 25],
		['PageDown', 5],
		['Home', 0],
		['End', 60],
	])('%s → %d', async (key, expected) => {
		const { slider, values } = setup()

		await fireEvent.keyDown(slider, { key })
		expect(values()).toEqual([expected])
	})

	it('клавиши вне шкалы не выходят за границы; прочие клавиши не обрабатываются', async () => {
		const { slider, values } = setup({ modelValue: 58 })

		await fireEvent.keyDown(slider, { key: 'PageUp' })
		await fireEvent.keyDown(slider, { key: 'Tab' })
		expect(values()).toEqual([60])
	})

	it('перетаскивание: значение под указателем, фокус на ползунке, после отпускания — снова modelValue', async () => {
		const { root, slider, values } = setup()

		await fireEvent.pointerDown(root, { button: 0, pointerId: 1, clientX: 50 })
		expect(slider).toHaveFocus()
		expect(root).toHaveClass('base-media-player__slider--dragging')
		await fireEvent.pointerMove(root, { pointerId: 1, clientX: 75 })
		expect(slider).toHaveAttribute('aria-valuenow', '45')

		await fireEvent.pointerUp(root, { pointerId: 1 })
		await fireEvent.pointerMove(root, { pointerId: 1, clientX: 10 })
		expect(slider).toHaveAttribute('aria-valuenow', '15')
		expect(values()).toEqual([30, 45])
	})

	it('правая кнопка и дорожка нулевой ширины', async () => {
		const { root, values } = setup()

		await fireEvent.pointerDown(root, { button: 2, clientX: 50 })
		root.getBoundingClientRect = () => ({ left: 0, width: 0 }) as DOMRect
		await fireEvent.pointerDown(root, { button: 0, clientX: 50 })
		await fireEvent.pointerCancel(root)
		expect(values()).toEqual([0])
	})

	it('пока максимум неизвестен, ползунок отключён', async () => {
		const { root, slider, values, container } = setup({ max: Number.NaN })

		expect(slider).toHaveAttribute('aria-disabled', 'true')
		expect(slider).toHaveAttribute('aria-valuemax', '0')
		expect(slider).toHaveAttribute('aria-valuenow', '0')
		expect(container.querySelector('.base-media-player__slider-buffered')).toBeNull()
		await fireEvent.keyDown(slider, { key: 'End' })
		await fireEvent.pointerDown(root, { button: 0, clientX: 50 })
		expect(values()).toEqual([])
	})

	it('отрезки глав: цвет, заполнение до текущей позиции, отрезок под указателем растёт; у отключённого отрезков нет', async () => {
		const segments = [
			{ start: 0, end: 10, color: 'red' },
			{ start: 10, end: 40 },
			{ start: 40, end: 40 },
		]
		const { root, container, rerender } = setup({ segments })
		root.getBoundingClientRect = () => ({ left: 0, width: 120 }) as DOMRect
		const items = () => [...container.querySelectorAll<HTMLElement>('.base-media-player__slider-segment')]

		expect(container.querySelector('.base-media-player__slider-track--segmented')).not.toBeNull()
		expect(container.querySelector('.base-media-player__slider-fill')).toBeNull()
		expect(items().map(item => [item.style.left, item.style.width, item.style.getPropertyValue('--segment-color')])).toEqual([
			['0%', '16.666666666666664%', 'red'],
			['16.666666666666664%', '49.99999999999999%', ''],
			['66.66666666666666%', '0%', ''],
		])
		expect(items().map(item => (item.querySelector('.base-media-player__slider-segment-fill') as HTMLElement).style.width)).toEqual([
			'100%',
			'16.666666666666664%',
			'0%',
		])
		await fireEvent.pointerMove(root, { clientX: 30 })
		expect(items().map(item => item.classList.contains('base-media-player__slider-segment--hovered'))).toEqual([false, true, false])

		await rerender({ max: Number.NaN })
		expect(items()).toHaveLength(0)
	})

	it('подсказка при наведении: текст для значения под указателем, уходит вместе с указателем', async () => {
		const hoverText = vi.fn((value: number) => `${value} с`)
		const { root, container } = setup({ hoverText })
		root.getBoundingClientRect = () => ({ left: 0, width: 120 }) as DOMRect
		const tooltip = () => container.querySelector('.base-media-player__slider-tooltip') as HTMLElement | null

		await fireEvent.pointerMove(root, { clientX: 30 })
		expect(tooltip()).toHaveTextContent('15 с')
		expect(tooltip()?.style.left).toBe('30px')
		await fireEvent.pointerLeave(root)
		expect(tooltip()).toBeNull()

		root.getBoundingClientRect = () => ({ left: 0, width: 0 }) as DOMRect
		await fireEvent.pointerMove(root, { clientX: 30 })
		expect(tooltip()).toBeNull()
	})

	it('подсказка из слота не выходит за края дорожки: её ширина учитывается', async () => {
		const width = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(40)
		const result = render(MediaSlider, {
			props: PROPS,
			slots: { tooltip: '<template #tooltip="{ value }"><b>{{ value }}</b></template>' },
		})
		const root = result.container.querySelector('.base-media-player__slider') as HTMLElement
		root.getBoundingClientRect = () => ({ left: 0, width: 120 }) as DOMRect
		const tooltip = () => result.container.querySelector('.base-media-player__slider-tooltip') as HTMLElement

		await fireEvent.pointerMove(root, { clientX: 2 })
		await fireEvent.pointerMove(root, { clientX: 3 })
		expect(tooltip()).toHaveTextContent('1.5')
		expect(tooltip().style.left).toBe('20px')
		await fireEvent.pointerMove(root, { clientX: 119 })
		await fireEvent.pointerMove(root, { clientX: 118 })
		expect(tooltip().style.left).toBe('100px')
		width.mockRestore()
	})

	it('без hoverText и слота подсказки нет', async () => {
		const { root, container } = setup()
		root.getBoundingClientRect = () => ({ left: 0, width: 120 }) as DOMRect

		await fireEvent.pointerMove(root, { clientX: 30 })
		expect(container.querySelector('.base-media-player__slider-tooltip')).toBeNull()
	})

	it('метки рекламных пауз и отрезки интеграций на дорожке; у отключённого ползунка их нет', async () => {
		const { container, rerender } = setup({ markers: [30], highlights: [[6, 12]] })

		expect((container.querySelector('.base-media-player__slider-marker') as HTMLElement).style.left).toBe('50%')
		expect((container.querySelector('.base-media-player__slider-highlight') as HTMLElement).style.width).toBe('10%')
		await rerender({ max: Number.NaN })
		expect(container.querySelector('.base-media-player__slider-marker')).toBeNull()
		expect(container.querySelector('.base-media-player__slider-highlight')).toBeNull()
	})
})
