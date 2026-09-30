import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import BaseImageCompare from '../ui/BaseImageCompare.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const PROPS = { before: 'before.png', after: 'after.png', beforeAlt: 'До обработки', afterAlt: 'После обработки' }

const slider = () => screen.getByRole('slider')

describe('BaseImageCompare', () => {
	afterEach(() => {
		setLocale('ru')
		vi.restoreAllMocks()
	})

	it('две картинки с описаниями, подписи и ручка-ползунок', () => {
		const { container } = render(BaseImageCompare, { props: { ...PROPS, position: 30 } })

		expect(screen.getByRole('img', { name: 'До обработки' })).toHaveAttribute('src', 'before.png')
		expect(screen.getByRole('img', { name: 'После обработки' })).toHaveAttribute('src', 'after.png')
		expect(slider()).toHaveAccessibleName('Граница между «До» и «После»')
		expect(slider()).toHaveAttribute('aria-valuenow', '30')
		expect(slider()).toHaveAttribute('aria-valuetext', '30%')
		expect((container.querySelector('.base-image-compare') as HTMLElement).style.getPropertyValue('--compare-position')).toBe('30%')
	})

	it('клавиши: стрелки, Shift, PageUp/PageDown, Home/End; прочие клавиши не трогает', async () => {
		const { emitted } = render(BaseImageCompare, { props: PROPS })

		await fireEvent.keyDown(slider(), { key: 'ArrowRight' })
		await fireEvent.keyDown(slider(), { key: 'ArrowUp', shiftKey: true })
		await fireEvent.keyDown(slider(), { key: 'ArrowLeft' })
		await fireEvent.keyDown(slider(), { key: 'ArrowDown', shiftKey: true })
		await fireEvent.keyDown(slider(), { key: 'PageUp' })
		await fireEvent.keyDown(slider(), { key: 'PageDown' })
		await fireEvent.keyDown(slider(), { key: 'End' })
		await fireEvent.keyDown(slider(), { key: 'End' })
		await fireEvent.keyDown(slider(), { key: 'Home' })
		await fireEvent.keyDown(slider(), { key: 'a' })
		expect(emitted('update:position')).toEqual([[51], [61], [60], [50], [60], [50], [100], [0]])
	})

	it('мышь: нажатие переносит границу, перетаскивание двигает до отпускания', async () => {
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 100, width: 200 } as DOMRect)
		const { emitted, container } = render(BaseImageCompare, { props: PROPS })
		const root = container.querySelector('.base-image-compare') as HTMLElement

		await fireEvent.pointerDown(root, { button: 2, clientX: 150 })
		expect(emitted('update:position')).toBeUndefined()
		await fireEvent.pointerDown(root, { button: 0, clientX: 150 })
		expect(root).toHaveClass('base-image-compare--dragging')
		await fireEvent.pointerMove(window, { clientX: 290 })
		await fireEvent.pointerMove(window, { clientX: 500 })
		await fireEvent.pointerUp(window)
		await fireEvent.pointerMove(window, { clientX: 100 })
		expect(emitted('update:position')).toEqual([[25], [95], [100]])
		expect(root).not.toHaveClass('base-image-compare--dragging')
	})

	it('v-model снаружи, пустая ширина, свои подписи, язык и оформление', async () => {
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 0 } as DOMRect)
		setLocale('en')
		const { rerender, emitted, container } = render(BaseImageCompare, {
			props: { ...PROPS, variant: 'ghost', customClass: { root: 'r', handle: 'h' } },
		})

		expect(slider()).toHaveAccessibleName('Divider between “Before” and “After”')
		await rerender({ position: 140 })
		expect(slider()).toHaveAttribute('aria-valuenow', '100')
		await rerender({ position: undefined, beforeLabel: 'Эскиз', afterLabel: 'Макет' })
		expect(slider()).toHaveAttribute('aria-valuenow', '50')
		expect(slider()).toHaveAccessibleName('Divider between “Эскиз” and “Макет”')
		expect(container.querySelector('.base-image-compare__label--before')).toHaveTextContent('Эскиз')
		await fireEvent.pointerDown(container.querySelector('.base-image-compare') as HTMLElement, { button: 0, clientX: 10 })
		expect(emitted('update:position')).toBeUndefined()
		expect(container.querySelector('.base-image-compare')).toHaveClass('base-image-compare--ghost', 'r')
		expect(slider()).toHaveClass('h')
	})
})
