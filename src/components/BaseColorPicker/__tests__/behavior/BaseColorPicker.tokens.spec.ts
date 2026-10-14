import '@testing-library/jest-dom/vitest'
import BaseColorPicker from '../../ui/BaseColorPicker.vue'
import { getKitTokenPalette } from '../../model/colorPresets'
import { fireEvent, render, screen } from '@testing-library/vue'

function mockTokenColor(color: string): void {
	const original = window.getComputedStyle
	vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
		const style = original(element)
		const isToken = (element as HTMLElement).style.color.includes('var(')
		return new Proxy(style, {
			get(target, key) {
				if (key === 'color' && isToken) return color
				const value = Reflect.get(target, key, target)
				return typeof value === 'function' ? value.bind(target) : value
			},
		})
	})
}

async function openPanel(container: ParentNode): Promise<void> {
	await fireEvent.click(container.querySelector('.base-color-picker__swatch') as Element)
}

describe('BaseColorPicker: токены var(--rise-*)', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		document.body.querySelectorAll('.base-dropdown__panel').forEach(element => element.remove())
	})

	it('палитра токенов кита: подпись и восемь токенов', () => {
		const palette = getKitTokenPalette()

		expect(palette.label).toBe('Токены кита')
		expect(palette.colors).toHaveLength(8)
		expect(palette.colors.every(color => color.startsWith('var(--rise-'))).toBe(true)
	})

	it('значение-токен: образец красится самим токеном, имя кнопки называет токен, панель показывает цвет токена', async () => {
		mockTokenColor('rgb(59, 130, 246)')
		const { container } = render(BaseColorPicker, { props: { modelValue: 'var(--rise-primary)', ariaLabel: 'Цвет заливки' } })
		const swatch = container.querySelector<HTMLElement>('.base-color-picker__swatch') as HTMLElement

		expect(swatch.style.backgroundColor).toBe('var(--rise-primary)')
		expect(swatch).toHaveAccessibleName('Цвет заливки, выбран var(--rise-primary)')
		await openPanel(container)
		expect(document.body.querySelector('.base-color-picker__token')).toHaveTextContent('Токен var(--rise-primary): #3b82f6')
	})

	it('цвет токена в oklch() приводится к hex для полей панели', async () => {
		mockTokenColor('oklch(0.62 0.19 259)')
		const context = {
			clearRect: vi.fn(),
			fillRect: vi.fn(),
			getImageData: () => ({ data: Uint8ClampedArray.from([1, 2, 3, 255]) }),
			fillStyle: '',
		}
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
		const { container } = render(BaseColorPicker, { props: { modelValue: 'var(--rise-primary)' } })
		await openPanel(container)

		expect(document.body.querySelector('.base-color-picker__token')).toHaveTextContent('#010203')
	})

	it('выбор токена из палитры отдаёт строку var(--…) как есть и отмечает образец выбранным', async () => {
		const { container, emitted, rerender } = render(BaseColorPicker, {
			props: { modelValue: '#ff0000', palettes: [getKitTokenPalette()] },
		})
		await openPanel(container)
		await fireEvent.click(screen.getByRole('button', { name: 'Пресет var(--rise-success)' }))

		expect(emitted('update:modelValue')).toEqual([['var(--rise-success)']])
		expect(emitted('change')).toEqual([['var(--rise-success)']])
		await rerender({ modelValue: 'var(--rise-success)' })
		await openPanel(container)
		expect(screen.getByRole('button', { name: 'Пресет var(--rise-success)' })).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByRole('button', { name: 'Пресет var(--rise-error)' })).toHaveAttribute('aria-pressed', 'false')
		expect(screen.getByRole('button', { name: 'Пресет #f97316' })).toHaveAttribute('aria-pressed', 'false')
	})

	it('правка HEX при токене заменяет его обычным цветом', async () => {
		mockTokenColor('rgb(59, 130, 246)')
		const { container, emitted } = render(BaseColorPicker, { props: { modelValue: 'var(--rise-primary)' } })
		await openPanel(container)
		const hex = screen.getByRole('textbox', { name: 'HEX-значение' })
		await fireEvent.update(hex, '#00ff00')
		await fireEvent.change(hex)

		expect(emitted('update:modelValue')).toEqual([['#00ff00']])
	})

	it('без токена строки о токене нет', async () => {
		const { container } = render(BaseColorPicker, { props: { modelValue: '#ff0000' } })
		await openPanel(container)

		expect(document.body.querySelector('.base-color-picker__token')).toBeNull()
	})
})
