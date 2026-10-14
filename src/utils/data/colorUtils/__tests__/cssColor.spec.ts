import { isCssVarColor, isModernCssColor, normalizeCssColor, resolveCssColor } from '../cssColor'

function mockCanvas(pixel: number[]) {
	const context = {
		clearRect: vi.fn(),
		fillRect: vi.fn(),
		getImageData: vi.fn(() => ({ data: Uint8ClampedArray.from(pixel) })),
		fillStyle: '',
	}
	const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
	return { context, getContext }
}

describe('cssColor', () => {
	afterEach(() => vi.restoreAllMocks())

	it('isModernCssColor узнаёт oklch, color(), color-mix и lab, остальные записи нет', () => {
		for (const color of [
			'oklch(0.7 0.1 250)',
			'color(srgb 0.1 0.2 0.3)',
			'color-mix(in srgb, red 50%, blue)',
			'LAB(50% 10 10)',
			'hwb(10 0% 0%)',
		]) {
			expect(isModernCssColor(color)).toBe(true)
		}
		for (const color of ['#3b82f6', 'rgb(1, 2, 3)', 'hsl(10 10% 10%)', 'var(--rise-primary)', 'red']) {
			expect(isModernCssColor(color)).toBe(false)
		}
	})

	it('normalizeCssColor: непрозрачный цвет — hex, цвет передаётся canvas', () => {
		const { context } = mockCanvas([59, 130, 246, 255])

		expect(normalizeCssColor('oklch(0.62 0.19 259)')).toBe('#3b82f6')
		expect(context.fillStyle).toBe('oklch(0.62 0.19 259)')
		expect(context.fillRect).toHaveBeenCalledWith(0, 0, 1, 1)
	})

	it('normalizeCssColor: прозрачный цвет — rgba с округлённой прозрачностью', () => {
		mockCanvas([10, 20, 30, 128])

		expect(normalizeCssColor('color(srgb 0.04 0.08 0.12 / 0.5)')).toBe('rgba(10, 20, 30, 0.5)')
	})

	it('normalizeCssColor: без canvas — null', () => {
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

		expect(normalizeCssColor('oklch(0 0 0)')).toBeNull()
	})

	it('normalizeCssColor: вне браузера — null', () => {
		vi.stubGlobal('document', undefined)

		expect(normalizeCssColor('oklch(0 0 0)')).toBeNull()
		vi.unstubAllGlobals()
	})
})

describe('cssColor: токены', () => {
	afterEach(() => vi.restoreAllMocks())

	it('isCssVarColor узнаёт var(--имя) с пробелами и не путает с обычными цветами', () => {
		expect(isCssVarColor('var(--rise-primary)')).toBe(true)
		expect(isCssVarColor('  var( --x, #fff)')).toBe(true)
		expect(isCssVarColor('#fff')).toBe(false)
		expect(isCssVarColor('color-mix(in srgb, var(--a) 50%, red)')).toBe(false)
	})

	it('resolveCssColor вычисляет токен в области и приводит современную запись к hex', () => {
		const scope = document.createElement('div')
		document.body.append(scope)
		const original = window.getComputedStyle
		vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
			const style = original(element)
			return {
				...style,
				color: (element as HTMLElement).style.color.includes('var(') ? 'oklch(0.6 0.2 250)' : style.color,
			} as CSSStyleDeclaration
		})
		mockCanvas([5, 6, 7, 255])

		expect(resolveCssColor('var(--rise-primary)', scope)).toBe('#050607')
		expect(scope.children).toHaveLength(0)
		scope.remove()
	})

	it('resolveCssColor: без области токен остаётся как есть, пустой результат браузера — тоже', () => {
		expect(resolveCssColor('var(--x)', null)).toBe('var(--x)')
		expect(resolveCssColor('#abc', document.body)).toBe('#abc')
		vi.spyOn(window, 'getComputedStyle').mockReturnValue({ color: '' } as CSSStyleDeclaration)
		expect(resolveCssColor('var(--missing)', document.body)).toBe('var(--missing)')
	})
})
