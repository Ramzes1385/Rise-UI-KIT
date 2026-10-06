import type { Shape } from 'three'
import { parseSvgPaths, svgElementShapes } from '../../../model/scene/geometry/svgShapes'

const LAYER = { width: 400, height: 200 }
const NS = 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 400 200"'

const svg = (body: string): string => `<svg ${NS}>${body}</svg>`

function boundsOf(shapes: Shape[]): number[] {
	const points = shapes.flatMap(shape => shape.getPoints())
	const xs = points.map(point => point.x)
	const ys = points.map(point => point.y)
	return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]
}

function shapesOf(body: string, id: string): Shape[] {
	return svgElementShapes(parseSvgPaths(svg(body), LAYER), id)
}

describe('use: ссылки на элементы разворачиваются в копии на месте', () => {
	const seat = '<defs><rect id="seat" width="10" height="10"/></defs>'

	it('href и xlink:href; x и y сдвигают копию; id остаётся у обёртки, у копии id нет', () => {
		expect(boundsOf(shapesOf(`${seat}<use id="a" href="#seat" x="100" y="50"/>`, 'a'))).toEqual([100, 50, 110, 60])
		expect(boundsOf(shapesOf(`${seat}<use id="b" xlink:href="#seat" x="20"/>`, 'b'))).toEqual([20, 0, 30, 10])
		const paths = parseSvgPaths(svg(`${seat}<use id="a" href="#seat" x="100" y="50"/>`), LAYER)
		expect(paths).toHaveLength(1)
		expect(svgElementShapes(paths, 'seat')).toEqual([])
	})

	it('собственный transform применяется после сдвига x и y; стиль use наследуется копией', () => {
		expect(boundsOf(shapesOf(`${seat}<use id="a" href="#seat" x="10" transform="scale(2)"/>`, 'a'))).toEqual([20, 0, 40, 20])
		const [path] = parseSvgPaths(svg(`${seat}<use id="a" href="#seat" fill-rule="evenodd"/>`), LAYER)
		expect((path.userData as { style: { fillRule: string } }).style.fillRule).toBe('evenodd')
	})

	it('symbol: рисуется только через use, его содержимое подставляется без обёртки symbol', () => {
		const body = '<symbol id="sym"><rect x="1" y="2" width="5" height="5"/></symbol><use id="u" href="#sym" x="7" y="7"/>'
		const paths = parseSvgPaths(svg(body), LAYER)
		expect(paths).toHaveLength(1)
		expect(boundsOf(svgElementShapes(paths, 'u'))).toEqual([8, 9, 13, 14])
	})

	it('use внутри группы с transform и вложенные use', () => {
		const body = `${seat}<g id="row" transform="translate(100 100)"><use href="#seat"/><use href="#seat" x="20"/></g>`
		expect(boundsOf(shapesOf(body, 'row'))).toEqual([100, 100, 130, 110])
		const nested = `${seat}<g id="pair"><use href="#seat"/><use href="#seat" x="20"/></g><use id="two" href="#pair" y="40"/>`
		expect(boundsOf(shapesOf(nested, 'two'))).toEqual([0, 40, 30, 50])
	})

	it('битые ссылки, внешние адреса и циклы не рисуются и не зависают', () => {
		const body = [
			'<use id="missing" href="#nope"/>',
			'<use id="external" href="https://example.com/a.svg#x"/>',
			'<use id="empty"/>',
			'<g id="self"><rect width="5" height="5"/><use href="#self"/></g>',
			'<g id="a"><use href="#b"/></g>',
			'<g id="b"><rect width="5" height="5"/><use href="#a"/></g>',
		].join('')
		const paths = parseSvgPaths(svg(body), LAYER)
		expect(svgElementShapes(paths, 'missing')).toEqual([])
		expect(svgElementShapes(paths, 'external')).toEqual([])
		expect(svgElementShapes(paths, 'empty')).toEqual([])
		expect(svgElementShapes(paths, 'self')).toHaveLength(1)
		expect(paths.length).toBeLessThan(20)
	})

	it('цепочка ссылок: неглубокая разворачивается до фигуры, слишком глубокая обрезается', () => {
		const chain = (depth: number) => {
			const groups = ['<g id="l0"><rect width="4" height="4"/></g>']
			for (let level = 1; level < depth; level += 1) groups.push(`<g id="l${level}"><use href="#l${level - 1}"/></g>`)
			return `<defs>${groups.join('')}</defs><use id="top" href="#l${depth - 1}" x="10"/>`
		}
		expect(boundsOf(shapesOf(chain(3), 'top'))).toEqual([10, 0, 14, 4])
		expect(shapesOf(chain(12), 'top')).toEqual([])
	})

	it('лавина вложенных use ограничена: разбор заканчивается с конечным числом фигур', () => {
		const fan = (level: number) => Array.from({ length: 10 }, () => `<use href="#l${level}"/>`).join('')
		const levels = ['<g id="l0"><rect width="1" height="1"/></g>']
		for (let level = 1; level < 8; level += 1) levels.push(`<g id="l${level}">${fan(level - 1)}</g>`)
		const paths = parseSvgPaths(svg(`<defs>${levels.join('')}</defs><use id="boom" href="#l7"/>`), LAYER)
		expect(paths.length).toBeLessThanOrEqual(500)
	})

	it('цепочка a1…a8 по 10 use вне defs: объём копий ограничен, раскрытие останавливается с предупреждением', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const fan = (level: number) => Array.from({ length: 10 }, () => `<use href="#a${level}"/>`).join('')
		const levels = ['<g id="a0"><rect width="1" height="1"/></g>']
		for (let level = 1; level <= 8; level += 1) levels.push(`<g id="a${level}">${fan(level - 1)}</g>`)
		const started = performance.now()
		const paths = parseSvgPaths(svg(levels.join('')), LAYER)
		expect(performance.now() - started).toBeLessThan(5000)
		expect(paths.length).toBeLessThanOrEqual(20_000)
		expect(svgElementShapes(paths, 'a1')).toHaveLength(10)
		expect(svgElementShapes(paths, 'a8')).toEqual([])
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('слишком много ссылок use')
		warn.mockRestore()
	})

	it('в пределе объёма копий раскрываются все use и предупреждения нет', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const fan = (level: number) => Array.from({ length: 10 }, () => `<use href="#a${level}"/>`).join('')
		const levels = ['<g id="a0"><rect width="1" height="1"/></g>']
		for (let level = 1; level <= 3; level += 1) levels.push(`<g id="a${level}">${fan(level - 1)}</g>`)
		const paths = parseSvgPaths(svg(levels.join('')), LAYER)
		expect(svgElementShapes(paths, 'a3')).toHaveLength(1000)
		expect(warn).not.toHaveBeenCalled()
		warn.mockRestore()
	})
})

describe('скрытые и нерисуемые элементы не выдавливаются', () => {
	const rect = '<rect id="shop" x="10" y="10" width="20" height="20"/>'

	it.each([
		['атрибут display', '<rect id="hidden" display="none" width="5" height="5"/>'],
		['display в style', '<rect id="hidden" style="fill: red; display: none" width="5" height="5"/>'],
		['visibility hidden', '<rect id="hidden" visibility="hidden" width="5" height="5"/>'],
		['visibility collapse в style', '<rect id="hidden" style="visibility:collapse" width="5" height="5"/>'],
		['скрытая группа скрывает детей', '<g id="hidden" display="none"><rect id="child" width="5" height="5"/></g>'],
	])('%s', (_name, hidden) => {
		const paths = parseSvgPaths(svg(`${hidden}${rect}`), LAYER)
		expect(svgElementShapes(paths, 'hidden')).toEqual([])
		expect(svgElementShapes(paths, 'child')).toEqual([])
		expect(svgElementShapes(paths, 'shop')).toHaveLength(1)
	})

	it('видимые display и visibility не мешают', () => {
		const body = '<rect id="a" display="inline" width="5" height="5"/><rect id="b" style="visibility: visible" width="5" height="5"/>'
		expect(shapesOf(body, 'a')).toHaveLength(1)
		expect(shapesOf(body, 'b')).toHaveLength(1)
	})

	it('visibility hidden у группы не скрывает потомка с visibility visible, остальных скрывает', () => {
		const body =
			'<g id="group" visibility="hidden"><rect id="shown" visibility="visible" width="5" height="5"/><rect id="gone" width="5" height="5"/>' +
			'<g style="visibility: inherit"><rect id="inherited" width="5" height="5"/></g></g>'
		const paths = parseSvgPaths(svg(body), LAYER)
		expect(svgElementShapes(paths, 'shown')).toHaveLength(1)
		expect(svgElementShapes(paths, 'gone')).toEqual([])
		expect(svgElementShapes(paths, 'inherited')).toEqual([])
	})

	it('display none у родителя скрывает и потомка с visibility visible', () => {
		const body = '<g display="none"><rect id="shown" visibility="visible" width="5" height="5"/></g>'
		expect(shapesOf(body, 'shown')).toEqual([])
	})

	it.each(['clipPath', 'mask', 'pattern', 'symbol'])('%s вне defs не рисуется', tag => {
		const body = `<${tag} id="holder"><rect id="inner" width="50" height="50"/></${tag}>${rect}`
		const paths = parseSvgPaths(svg(body), LAYER)
		expect(svgElementShapes(paths, 'inner')).toEqual([])
		expect(paths).toHaveLength(1)
	})

	it('clip-path у элемента не отсекает фигуру: он выдавливается целиком', () => {
		const body = '<clipPath id="c"><rect width="5" height="5"/></clipPath><rect id="wide" clip-path="url(#c)" width="100" height="40"/>'
		expect(boundsOf(shapesOf(body, 'wide'))).toEqual([0, 0, 100, 40])
	})
})

describe('контуры: дырки и правило заливки', () => {
	const outer = 'M0 0H100V100H0Z'

	it('evenodd: вложенный контур того же направления — дырка', () => {
		const [shape] = shapesOf(`<path id="ring" fill-rule="evenodd" d="${outer} M25 25H75V75H25Z"/>`, 'ring')
		expect(shape.holes).toHaveLength(1)
	})

	it('nonzero: вложенный контур того же направления — не дырка, обратного — дырка', () => {
		const [same] = shapesOf(`<path id="a" d="${outer} M25 25H75V75H25Z"/>`, 'a')
		expect(same.holes).toHaveLength(0)
		const [opposite] = shapesOf(`<path id="b" d="${outer} M25 25V75H75V25Z"/>`, 'b')
		expect(opposite.holes).toHaveLength(1)
	})

	it('несколько отдельных контуров и дырок в одном элементе', () => {
		const body = `<path id="two" fill-rule="evenodd" d="${outer} M20 20H40V40H20Z M60 60H80V80H60Z M200 0H300V100H200Z"/>`
		const shapes = shapesOf(body, 'two')
		expect(shapes).toHaveLength(2)
		expect(shapes.map(shape => shape.holes.length).sort()).toEqual([0, 2])
	})

	it('кривые: окружность и дуга дают гладкий контур внутри своих границ', () => {
		const [circle] = shapesOf('<circle id="c" cx="100" cy="100" r="50"/>', 'c')
		const [left, top, right, bottom] = boundsOf([circle])
		expect([left, top, right, bottom].map(Math.round)).toEqual([50, 50, 150, 150])
		const [arc] = shapesOf('<path id="p" d="M0 100A50 50 0 0 1 100 100Z"/>', 'p')
		expect(boundsOf([arc]).map(Math.round)).toEqual([0, 50, 100, 100])
	})

	it('вырожденные контуры пропускаются', () => {
		expect(shapesOf('<path id="line" d="M0 0H100"/>', 'line')).toEqual([])
		expect(shapesOf('<rect id="flat" width="100" height="0"/>', 'flat')).toEqual([])
	})
})

describe('разметка без svg-корня', () => {
	it('даёт пустой результат', () => {
		expect(parseSvgPaths('<html xmlns="http://www.w3.org/1999/xhtml"/>', LAYER)).toEqual([])
		expect(parseSvgPaths('<svg', LAYER)).toEqual([])
	})
})
