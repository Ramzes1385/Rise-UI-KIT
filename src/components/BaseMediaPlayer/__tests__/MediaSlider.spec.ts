import '@testing-library/jest-dom/vitest'
import MediaSlider from '../ui/MediaSlider.vue'
import { useMediaSlider } from '../model/useMediaSlider'
import { withSetup } from './BaseMediaPlayer.test-utils'
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

	it('главы — разрывы на дорожке; края и отключённый ползунок без разрывов', () => {
		const mask = (props: Partial<MediaSliderProps>) =>
			withSetup(() => useMediaSlider({ ...PROPS, ...props }, vi.fn())).result.trackStyle.value.maskImage

		expect(mask({ marks: [0, 15, 30, 60] })).toBe(
			'linear-gradient(to right, black calc(25% - 1px), transparent calc(25% - 1px), transparent calc(25% + 1px), black calc(25% + 1px), ' +
				'black calc(50% - 1px), transparent calc(50% - 1px), transparent calc(50% + 1px), black calc(50% + 1px))',
		)
		expect(mask({ marks: [0] })).toBeUndefined()
		expect(mask({ marks: [15], max: Number.NaN })).toBeUndefined()
		expect(setup({ marks: [15] }).container.querySelector('.base-media-player__slider-track')).not.toBeNull()
	})

	it('подсказка при наведении: текст для значения под указателем, уходит вместе с указателем', async () => {
		const hoverText = vi.fn((value: number) => `${value} с`)
		const { root, container } = setup({ hoverText })
		root.getBoundingClientRect = () => ({ left: 0, width: 120 }) as DOMRect
		const tooltip = () => container.querySelector('.base-media-player__slider-tooltip') as HTMLElement | null

		await fireEvent.pointerMove(root, { clientX: 30 })
		expect(tooltip()).toHaveTextContent('15 с')
		expect(tooltip()?.style.left).toBe('25%')
		await fireEvent.pointerLeave(root)
		expect(tooltip()).toBeNull()

		root.getBoundingClientRect = () => ({ left: 0, width: 0 }) as DOMRect
		await fireEvent.pointerMove(root, { clientX: 30 })
		expect(tooltip()).toBeNull()
	})

	it('без hoverText подсказки нет', async () => {
		const { root, container } = setup()
		root.getBoundingClientRect = () => ({ left: 0, width: 120 }) as DOMRect

		await fireEvent.pointerMove(root, { clientX: 30 })
		expect(container.querySelector('.base-media-player__slider-tooltip')).toBeNull()
	})
})
