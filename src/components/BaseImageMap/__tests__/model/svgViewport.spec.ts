import {
	ensureViewBox,
	isValidLayerSize,
	mappingTransform,
	parseAspectRatio,
	parseSvgLength,
	parseViewBox,
	svgLayerMapping,
	svgViewBox,
} from '../../model/svg/svgViewport'

const NS = 'xmlns="http://www.w3.org/2000/svg"'
const WIDE = { width: 800, height: 400 }

function root(attributes = ''): Element {
	return new DOMParser().parseFromString(`<svg ${NS} ${attributes}/>`, 'image/svg+xml').documentElement
}

describe('parseViewBox', () => {
	it('разбирает четыре числа через пробелы и запятые', () => {
		expect(parseViewBox('0 0 100 50')).toEqual({ x: 0, y: 0, width: 100, height: 50 })
		expect(parseViewBox('  -10, 5 ,200\t100 ')).toEqual({ x: -10, y: 5, width: 200, height: 100 })
	})

	it.each([undefined, null, '', 'a b c d', '0 0 100', '0 0 100 50 7', '0 0 0 50', '0 0 100 -1', '0 0 1e999 5'])(
		'%j — не viewBox',
		value => {
			expect(parseViewBox(value)).toBeNull()
		},
	)
})

describe('parseSvgLength', () => {
	it.each([
		['100', 100],
		['100px', 100],
		[' 10 PX ', 10],
		['.5', 0.5],
		['1e2', 100],
		['1in', 96],
		['2.54cm', 96],
		['25.4mm', 96],
		['72pt', 96],
		['6pc', 96],
	])('%j → %d px', (value, expected) => {
		expect(parseSvgLength(value)).toBeCloseTo(expected, 6)
	})

	it.each([undefined, null, '', '50%', '10em', '3ex', '0', '-5', 'abc'])('%j — не длина в пикселях', value => {
		expect(parseSvgLength(value)).toBeNull()
	})
})

describe('parseAspectRatio', () => {
	it('без значения и с мусором — xMidYMid meet', () => {
		const expected = { alignX: 0.5, alignY: 0.5, isNone: false, isSlice: false }
		expect(parseAspectRatio(undefined)).toEqual(expected)
		expect(parseAspectRatio('')).toEqual(expected)
		expect(parseAspectRatio('foo bar')).toEqual(expected)
		expect(parseAspectRatio('defer')).toEqual(expected)
		expect(parseAspectRatio('xMidYMid meet')).toEqual(expected)
	})

	it('none отключает сохранение пропорций', () => {
		expect(parseAspectRatio('none')).toEqual({ alignX: 0, alignY: 0, isNone: true, isSlice: false })
		expect(parseAspectRatio('defer none')).toEqual({ alignX: 0, alignY: 0, isNone: true, isSlice: false })
	})

	it('читает выравнивание по осям, slice и defer в любом регистре букв выравнивания', () => {
		expect(parseAspectRatio('xMinYMax')).toEqual({ alignX: 0, alignY: 1, isNone: false, isSlice: false })
		expect(parseAspectRatio('xMaxYMid slice')).toEqual({ alignX: 1, alignY: 0.5, isNone: false, isSlice: true })
		expect(parseAspectRatio('defer xMinYMin slice')).toEqual({ alignX: 0, alignY: 0, isNone: false, isSlice: true })
		expect(parseAspectRatio('XMINYMAX')).toEqual({ alignX: 0, alignY: 1, isNone: false, isSlice: false })
	})
})

describe('isValidLayerSize', () => {
	it('принимает только конечные положительные размеры', () => {
		expect(isValidLayerSize({ width: 100, height: 50 })).toBe(true)
		expect(isValidLayerSize({ width: 0, height: 50 })).toBe(false)
		expect(isValidLayerSize({ width: 100, height: -1 })).toBe(false)
		expect(isValidLayerSize({ width: Number.NaN, height: 5 })).toBe(false)
		expect(isValidLayerSize({ width: 5, height: Number.POSITIVE_INFINITY })).toBe(false)
	})
})

describe('svgViewBox', () => {
	it('viewBox важнее width и height', () => {
		expect(svgViewBox(root('viewBox="10 20 300 150" width="5" height="5"'), WIDE)).toEqual({ x: 10, y: 20, width: 300, height: 150 })
	})

	it('без viewBox берёт width и height корня с единицами', () => {
		expect(svgViewBox(root('width="400" height="200"'), WIDE)).toEqual({ x: 0, y: 0, width: 400, height: 200 })
		expect(svgViewBox(root('width="2in" height="1in"'), WIDE)).toEqual({ x: 0, y: 0, width: 192, height: 96 })
		expect(svgViewBox(root('viewBox="0 0 0 0" width="400" height="200"'), WIDE)).toEqual({ x: 0, y: 0, width: 400, height: 200 })
	})

	it('без viewBox и с неполными размерами берёт размер слоя', () => {
		expect(svgViewBox(root(), WIDE)).toEqual({ x: 0, y: 0, width: 800, height: 400 })
		expect(svgViewBox(root('width="400"'), WIDE)).toEqual({ x: 0, y: 0, width: 800, height: 400 })
		expect(svgViewBox(root('width="50%" height="100%"'), WIDE)).toEqual({ x: 0, y: 0, width: 800, height: 400 })
	})
})

describe('ensureViewBox', () => {
	it('дописывает viewBox по размеру слоя', () => {
		const target = root()
		ensureViewBox(target, WIDE)
		expect(target.getAttribute('viewBox')).toBe('0 0 800 400')
	})

	it('дописывает viewBox по width и height корня', () => {
		const target = root('width="400" height="200"')
		ensureViewBox(target, WIDE)
		expect(target.getAttribute('viewBox')).toBe('0 0 400 200')
	})

	it('заменяет неверный viewBox и не трогает верный', () => {
		const broken = root('viewBox="0 0 0 0"')
		ensureViewBox(broken, WIDE)
		expect(broken.getAttribute('viewBox')).toBe('0 0 800 400')
		const valid = root('viewBox="-10 -5 100 50"')
		ensureViewBox(valid, WIDE)
		expect(valid.getAttribute('viewBox')).toBe('-10 -5 100 50')
	})

	it('без размера слоя ничего не делает', () => {
		const target = root()
		ensureViewBox(target, { width: 0, height: 0 })
		expect(target.hasAttribute('viewBox')).toBe(false)
	})
})

describe('svgLayerMapping', () => {
	it('без размера слоя — тождественное соответствие', () => {
		expect(svgLayerMapping(root('viewBox="0 0 10 10"'), { width: 0, height: 100 })).toEqual({
			scaleX: 1,
			scaleY: 1,
			offsetX: 0,
			offsetY: 0,
		})
	})

	it('viewBox совпадает со слоем и viewBox не задан — тождество', () => {
		const identity = { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 }
		expect(svgLayerMapping(root('viewBox="0 0 800 400"'), WIDE)).toEqual(identity)
		expect(svgLayerMapping(root(), WIDE)).toEqual(identity)
	})

	it.each([
		['xMidYMid meet по умолчанию', '', { scaleX: 2, scaleY: 2, offsetX: 0, offsetY: 100 }],
		['xMinYMin meet', 'preserveAspectRatio="xMinYMin meet"', { scaleX: 2, scaleY: 2, offsetX: 0, offsetY: 0 }],
		['xMaxYMax meet', 'preserveAspectRatio="xMaxYMax meet"', { scaleX: 2, scaleY: 2, offsetX: 0, offsetY: 200 }],
		['xMidYMid slice', 'preserveAspectRatio="xMidYMid slice"', { scaleX: 4, scaleY: 4, offsetX: -400, offsetY: 0 }],
		['xMaxYMid slice', 'preserveAspectRatio="xMaxYMid slice"', { scaleX: 4, scaleY: 4, offsetX: -800, offsetY: 0 }],
		['none', 'preserveAspectRatio="none"', { scaleX: 2, scaleY: 4, offsetX: 0, offsetY: 0 }],
	])('viewBox 400×100 в слое 800×400: %s', (_name, ratio, expected) => {
		expect(svgLayerMapping(root(`viewBox="0 0 400 100" ${ratio}`), WIDE)).toEqual(expected)
	})

	it('учитывает ненулевое начало viewBox', () => {
		expect(svgLayerMapping(root('viewBox="-100 -50 400 200"'), WIDE)).toEqual({ scaleX: 2, scaleY: 2, offsetX: 200, offsetY: 100 })
		expect(svgLayerMapping(root('viewBox="100 50 800 400"'), WIDE)).toEqual({ scaleX: 1, scaleY: 1, offsetX: -100, offsetY: -50 })
		expect(svgLayerMapping(root('viewBox="100 50 400 100" preserveAspectRatio="none"'), WIDE)).toEqual({
			scaleX: 2,
			scaleY: 4,
			offsetX: -200,
			offsetY: -200,
		})
	})

	it('без viewBox берёт размер из width и height корня', () => {
		expect(svgLayerMapping(root('width="400" height="200"'), WIDE)).toEqual({ scaleX: 2, scaleY: 2, offsetX: 0, offsetY: 0 })
	})
})

describe('mappingTransform', () => {
	it('для тождества возвращает null', () => {
		expect(mappingTransform({ scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 })).toBeNull()
	})

	it('записывает сдвиг и масштаб', () => {
		expect(mappingTransform({ scaleX: 2, scaleY: 2, offsetX: 10, offsetY: 20 })).toBe('translate(10 20) scale(2 2)')
		expect(mappingTransform({ scaleX: 2, scaleY: 4, offsetX: 0, offsetY: 0 })).toBe('translate(0 0) scale(2 4)')
		expect(mappingTransform({ scaleX: 1, scaleY: 1, offsetX: 5, offsetY: 0 })).toBe('translate(5 0) scale(1 1)')
	})
})
