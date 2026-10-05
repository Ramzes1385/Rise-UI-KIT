import '@testing-library/jest-dom/vitest'
import BaseColorPicker from '../ui/BaseColorPicker.vue'
import { fireEvent, render } from '@testing-library/vue'

const INSTANT = 'base-color-picker__panel--instant'

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function stubAreaRect(): void {
	vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 100 }))
}

function query<T extends HTMLElement = HTMLElement>(selector: string): T {
	return document.body.querySelector<T>(selector)!
}

async function renderOpen(props: Record<string, unknown> = {}) {
	const view: ReturnType<typeof render> = render(BaseColorPicker, {
		props: {
			modelValue: '#ff0000',
			hasAlpha: true,
			'onUpdate:modelValue': (value: string): Promise<void> => view.rerender({ modelValue: value }),
			...props,
		},
	})
	await fireEvent.click(view.container.querySelector('.base-color-picker__swatch')!)
	const marker = (): HTMLElement => query('.base-color-picker__marker')
	const thumbs = (): HTMLElement[] => [...query('.base-color-picker__sliders').querySelectorAll<HTMLElement>('.base-color-picker__track')]
	return { ...view, panel: () => query('.base-color-picker__panel'), marker, thumbs }
}

function position(element: HTMLElement, name: string): string {
	return element.style.getPropertyValue(name)
}

describe('BaseColorPicker: движение маркера и бегунков', () => {
	beforeEach(() => stubReducedMotion(false))

	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
		document.body.innerHTML = ''
	})

	it('ввод HEX двигает маркер и бегунки через переменные transform — с переходом', async () => {
		const { panel, marker, thumbs } = await renderOpen()
		expect(position(marker(), '--picker-marker-x')).toBe('100')
		expect(position(marker(), '--picker-marker-y')).toBe('0')
		expect(marker().style.left).toBe('')
		expect(marker().style.backgroundColor).toBe('rgb(255, 0, 0)')

		const hex = query<HTMLInputElement>('.base-color-picker__hex')
		hex.value = '#00ff0080'
		await fireEvent.change(hex)

		expect(panel()).not.toHaveClass(INSTANT)
		expect(panel()).not.toHaveAttribute('data-rise-motion')
		const [hue, alpha] = thumbs()
		expect(Number(position(hue, '--picker-thumb-x'))).toBeCloseTo(1 / 3)
		expect(Number(position(alpha, '--picker-thumb-x'))).toBeCloseTo(0.5, 1)
	})

	it('выбор образца — программная смена с переходом', async () => {
		const { panel, marker } = await renderOpen({ hasAlpha: false })
		await fireEvent.click(document.body.querySelector('[aria-label$="#000000"]')!)
		await fireEvent.click(document.body.querySelector('.base-color-picker__swatch')!)

		expect(position(marker(), '--picker-marker-y')).toBe('100')
		expect(panel()).not.toHaveClass(INSTANT)
	})

	it('перетаскивание в области — без перехода, после отпускания переход возвращается', async () => {
		stubAreaRect()
		const { panel, marker } = await renderOpen()
		const area = query('.base-color-picker__area')

		await fireEvent.pointerDown(area, { clientX: 50, clientY: 50 })
		expect(panel()).toHaveClass(INSTANT)
		await fireEvent.pointerMove(window, { clientX: 100, clientY: 25 })
		expect(position(marker(), '--picker-marker-x')).toBe('50')
		expect(position(marker(), '--picker-marker-y')).toBe('25')

		await fireEvent.pointerUp(window)
		expect(panel()).not.toHaveClass(INSTANT)

		await fireEvent.pointerDown(area, { clientX: 10, clientY: 10 })
		await fireEvent(window, new Event('pointercancel'))
		expect(panel()).not.toHaveClass(INSTANT)
	})

	it('перетаскивание шкал тона и прозрачности — без перехода до отпускания', async () => {
		const { panel } = await renderOpen()

		await fireEvent.pointerDown(query('.base-color-picker__hue'))
		expect(panel()).toHaveClass(INSTANT)
		await fireEvent.pointerUp(window)
		expect(panel()).not.toHaveClass(INSTANT)

		await fireEvent.pointerDown(query('.base-color-picker__alpha'))
		expect(panel()).toHaveClass(INSTANT)
		await fireEvent(window, new Event('pointercancel'))
		expect(panel()).not.toHaveClass(INSTANT)
	})

	it('размонтирование во время перетаскивания снимает обработчики', async () => {
		const remove = vi.spyOn(window, 'removeEventListener')
		const { unmount } = await renderOpen()
		await fireEvent.pointerDown(query('.base-color-picker__hue'))

		unmount()
		expect(remove).toHaveBeenCalledWith('pointerup', expect.any(Function))
	})

	it('prefers-reduced-motion: reduce — маркер и бегунки сразу в конечном положении', async () => {
		stubReducedMotion(true)
		const { panel } = await renderOpen()

		expect(panel()).toHaveClass(INSTANT)
	})

	it('пресет none у области — сразу, пресет переносится на телепортированную панель', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { panel } = await renderOpen()

		expect(panel()).toHaveClass(INSTANT)
		expect(panel()).toHaveAttribute('data-rise-motion', 'none')
	})

	it('пресет expressive переносится на панель, переход остаётся', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'expressive')
		const { panel } = await renderOpen()

		expect(panel()).not.toHaveClass(INSTANT)
		expect(panel()).toHaveAttribute('data-rise-motion', 'expressive')
	})
})
