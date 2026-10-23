import { buildImageTile } from '../model/pattern/watermarkImage'
import { measureLines } from '../model/pattern/watermarkMeasure'
import { buildTextTile, escapeXml, normalizeGap, normalizeLines, rotatedSize, tileGeometry } from '../model/pattern/watermarkPattern'

const FONT = { size: 10, family: 'serif' }

function decode(url: string): string {
	return decodeURIComponent(url.slice(url.indexOf(',') + 1))
}

describe('watermarkPattern', () => {
	it('escapeXml экранирует спецсимволы', () => {
		expect(escapeXml(`<a href="x">&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;')
		expect(escapeXml('Черновик')).toBe('Черновик')
	})

	it('normalizeGap: число, пара, отрицательные значения', () => {
		expect(normalizeGap(10)).toEqual([10, 10])
		expect(normalizeGap([4, 8])).toEqual([4, 8])
		expect(normalizeGap(-5)).toEqual([0, 0])
		expect(normalizeGap([-1, 7])).toEqual([0, 7])
	})

	it('normalizeLines: строка, массив, пусто, пробелы', () => {
		expect(normalizeLines('  Имя ')).toEqual(['Имя'])
		expect(normalizeLines(['Имя', '  ', ' Дата '])).toEqual(['Имя', 'Дата'])
		expect(normalizeLines(undefined)).toEqual([])
		expect(normalizeLines('')).toEqual([])
		expect(normalizeLines('   ')).toEqual([])
	})

	it('rotatedSize: 0 и -22 градусов', () => {
		expect(rotatedSize(100, 20, 0)).toEqual([100, 20])
		expect(rotatedSize(100, 20, 90)).toEqual([20, 100])
		const radians = (22 * Math.PI) / 180
		const [width, height] = rotatedSize(100, 20, -22)
		expect(width).toBe(Math.ceil(100 * Math.cos(radians) + 20 * Math.sin(radians)))
		expect(height).toBe(Math.ceil(100 * Math.sin(radians) + 20 * Math.cos(radians)))
	})

	it('tileGeometry: плитка — две ячейки, два центра по диагонали', () => {
		const geometry = tileGeometry({ width: 100, height: 20, rotate: 0, gap: [10, 30] })
		expect(geometry.width).toBe(220)
		expect(geometry.height).toBe(100)
		expect(geometry.centers).toEqual([
			[55, 25],
			[165, 75],
		])
	})

	it('buildTextTile: SVG в data-URI с экранированным текстом и поворотом', () => {
		const tile = buildTextTile({ lines: ['A<B'], textWidth: 50, font: FONT, color: '#123456', rotate: -30, gap: 0 })
		expect(tile.url.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true)
		expect(tile.repeat).toBe('repeat')
		const svg = decode(tile.url)
		expect(svg).toContain('A&lt;B')
		expect(svg).not.toContain('A<B')
		expect(svg).toContain('rotate(-30 ')
		expect(svg).toContain('fill="#123456"')
		expect(svg).toContain('font-family="serif"')
		expect(svg).toContain(`width="${tile.width}"`)
		expect(svg).toContain(`height="${tile.height}"`)
	})

	it('buildTextTile: несколько строк — несколько text в каждом из двух блоков', () => {
		const tile = buildTextTile({ lines: ['Имя', 'Дата'], textWidth: 40, font: FONT, color: 'red', rotate: 0, gap: 0 })
		const doc = new DOMParser().parseFromString(decode(tile.url), 'image/svg+xml')
		expect(doc.querySelectorAll('text')).toHaveLength(4)
		expect(doc.querySelectorAll('g[transform]')).toHaveLength(2)
	})
})

describe('watermarkMeasure', () => {
	afterEach(() => {
		delete (SVGElement.prototype as unknown as Record<string, unknown>).getComputedTextLength
	})

	it('без host — запасная оценка 0.6 · размер · длина по самой длинной строке', () => {
		expect(measureLines(null, ['abcd', 'ab'], FONT)).toBeCloseTo(24)
	})

	it('host без getComputedTextLength — запасная оценка, временный svg убран', () => {
		const host = document.createElement('div')
		expect(measureLines(host, ['abcd'], FONT)).toBeCloseTo(24)
		expect(host.querySelector('svg')).toBeNull()
	})

	it('измеряет в DOM через getComputedTextLength и убирает временный svg', () => {
		Object.defineProperty(SVGElement.prototype, 'getComputedTextLength', {
			configurable: true,
			value(this: SVGElement) {
				return (this.textContent ?? '').length * 7
			},
		})
		const host = document.createElement('div')
		const append = vi.spyOn(host, 'append')
		expect(measureLines(host, ['abc', 'abcde'], FONT)).toBe(35)
		expect(append).toHaveBeenCalledTimes(1)
		expect(host.querySelector('svg')).toBeNull()
	})
})

class FakeImage {
	static instances: FakeImage[] = []
	crossOrigin = ''
	naturalWidth = 200
	naturalHeight = 100
	onload: (() => void) | null = null
	onerror: (() => void) | null = null
	src = ''
	constructor() {
		FakeImage.instances.push(this)
	}
}

describe('watermarkImage', () => {
	const context = {
		scale: vi.fn(),
		save: vi.fn(),
		translate: vi.fn(),
		rotate: vi.fn(),
		drawImage: vi.fn(),
		restore: vi.fn(),
	}
	const OPTIONS = { image: 'https://cdn.test/logo.png', width: 100, height: undefined, rotate: 0, gap: 0 }

	beforeEach(() => {
		FakeImage.instances = []
		vi.stubGlobal('Image', FakeImage)
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
		vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,AAA')
		Object.values(context).forEach(fn => fn.mockClear())
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
	})

	it('рисует плитку на canvas: высота по пропорциям, два знака', async () => {
		const promise = buildImageTile(OPTIONS)
		const [image] = FakeImage.instances
		expect(image.crossOrigin).toBe('anonymous')
		expect(image.src).toBe(OPTIONS.image)
		image.onload?.()
		const tile = await promise
		expect(tile).toEqual({ url: 'data:image/png;base64,AAA', width: 200, height: 100, repeat: 'repeat' })
		expect(context.drawImage).toHaveBeenCalledTimes(2)
		expect(context.drawImage).toHaveBeenCalledWith(image, -50, -25, 100, 50)
	})

	it('заданная height и нулевая naturalWidth не ломают расчёт', async () => {
		const promise = buildImageTile({ ...OPTIONS, height: 30, rotate: 45 })
		FakeImage.instances[0].naturalWidth = 0
		FakeImage.instances[0].onload?.()
		const tile = await promise
		expect(tile.repeat).toBe('repeat')
		expect(context.rotate).toHaveBeenCalledWith(Math.PI / 4)
		expect(context.drawImage).toHaveBeenCalledWith(FakeImage.instances[0], -50, -15, 100, 30)
	})

	it('ошибка загрузки — обычная плитка space с адресом картинки', async () => {
		const promise = buildImageTile({ ...OPTIONS, image: 'a"b.png', height: 40 })
		FakeImage.instances[0].onerror?.()
		expect(await promise).toEqual({ url: 'a%22b.png', width: 100, height: 40, repeat: 'space' })
	})

	it('нет контекста canvas — обычная плитка, высота auto (null)', async () => {
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
		const promise = buildImageTile(OPTIONS)
		FakeImage.instances[0].onload?.()
		expect(await promise).toEqual({ url: OPTIONS.image, width: 100, height: null, repeat: 'space' })
	})

	it('исключение toDataURL (грязный canvas) — обычная плитка', async () => {
		vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(() => {
			throw new Error('tainted')
		})
		const promise = buildImageTile(OPTIONS)
		FakeImage.instances[0].onload?.()
		expect((await promise).repeat).toBe('space')
	})
})
