import { downloadText, fileTitle, imageSize, isSvgFile, parseMap, readDataUrl, svgCandidates, svgSize } from '../../model/io/editorFiles'

class FakeImage {
	static mode: 'load' | 'zero' | 'error' = 'load'
	naturalWidth = 0
	naturalHeight = 0
	onload: (() => void) | null = null
	onerror: (() => void) | null = null

	set src(value: string) {
		if (FakeImage.mode === 'error') {
			queueMicrotask(() => this.onerror?.())
			return
		}
		if (FakeImage.mode === 'load') {
			this.naturalWidth = 640
			this.naturalHeight = value.length
		}
		queueMicrotask(() => this.onload?.())
	}
}

class FailingReader {
	error = new Error('read')
	onload: (() => void) | null = null
	onerror: (() => void) | null = null

	readAsDataURL(): void {
		queueMicrotask(() => this.onerror?.())
	}
}

afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
	document.body.innerHTML = ''
})

describe('editorFiles: файлы', () => {
	it('isSvgFile по типу и по расширению', () => {
		expect(isSvgFile(new File([''], 'plan', { type: 'image/svg+xml' }))).toBe(true)
		expect(isSvgFile(new File([''], 'PLAN.SVG'))).toBe(true)
		expect(isSvgFile(new File([''], 'plan.png', { type: 'image/png' }))).toBe(false)
	})

	it('fileTitle срезает последнее расширение', () => {
		expect(fileTitle(new File([''], 'plan.floor.png'))).toBe('plan.floor')
		expect(fileTitle(new File([''], 'plan'))).toBe('plan')
	})

	it('readDataUrl читает файл в data: URL', async () => {
		const url = await readDataUrl(new File(['hi'], 'a.txt', { type: 'text/plain' }))
		expect(url).toBe('data:text/plain;base64,aGk=')
	})

	it('readDataUrl отклоняется при ошибке чтения', async () => {
		vi.stubGlobal('FileReader', FailingReader)
		await expect(readDataUrl(new File(['hi'], 'a.txt'))).rejects.toThrow('read')
	})
})

describe('editorFiles: размеры', () => {
	it('imageSize берёт natural-размеры', async () => {
		FakeImage.mode = 'load'
		vi.stubGlobal('Image', FakeImage)
		await expect(imageSize('abc')).resolves.toEqual({ width: 640, height: 3 })
	})

	it('imageSize без размеров — 1000', async () => {
		FakeImage.mode = 'zero'
		vi.stubGlobal('Image', FakeImage)
		await expect(imageSize('abc')).resolves.toEqual({ width: 1000, height: 1000 })
	})

	it('imageSize отклоняется при ошибке загрузки', async () => {
		FakeImage.mode = 'error'
		vi.stubGlobal('Image', FakeImage)
		await expect(imageSize('abc')).rejects.toThrow('image')
	})

	it('svgSize по viewBox', () => {
		expect(svgSize('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="10" height="10"/>')).toEqual({
			width: 300,
			height: 200,
		})
		expect(svgSize('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0,0,30,20"/>')).toEqual({ width: 30, height: 20 })
	})

	it('svgSize без viewBox — по width и height', () => {
		expect(svgSize('<svg xmlns="http://www.w3.org/2000/svg" width="120px" height="80"/>')).toEqual({ width: 120, height: 80 })
	})

	it('svgSize без размеров — 1000', () => {
		expect(svgSize('<svg xmlns="http://www.w3.org/2000/svg"/>')).toEqual({ width: 1000, height: 1000 })
	})

	it('svgSize: корень не svg — undefined', () => {
		expect(svgSize('<html/>')).toBeUndefined()
		expect(svgSize('не разметка')).toBeUndefined()
	})
})

describe('editorFiles: parseMap', () => {
	const layer = { id: 'l', title: 'Этаж', width: 100, height: 50 }
	const object = { id: 'p', title: 'Вход', type: 'point', x: 0, y: 0 }

	it('валидный JSON — данные', () => {
		const data = { layers: [layer], objects: [object], groups: [] }
		expect(parseMap(JSON.stringify(data))).toEqual(data)
	})

	it('не JSON, не объект и массив — undefined', () => {
		expect(parseMap('{')).toBeUndefined()
		expect(parseMap('null')).toBeUndefined()
		expect(parseMap('42')).toBeUndefined()
		expect(parseMap('[]')).toBeUndefined()
	})

	it('без layers или objects — undefined', () => {
		expect(parseMap(JSON.stringify({ objects: [] }))).toBeUndefined()
		expect(parseMap(JSON.stringify({ layers: [] }))).toBeUndefined()
		expect(parseMap(JSON.stringify({ layers: {}, objects: [] }))).toBeUndefined()
	})

	it('слой без id, ширины или высоты — undefined', () => {
		expect(parseMap(JSON.stringify({ layers: [{ ...layer, width: undefined }], objects: [] }))).toBeUndefined()
		expect(parseMap(JSON.stringify({ layers: [{ ...layer, height: 0 }], objects: [] }))).toBeUndefined()
		expect(parseMap(JSON.stringify({ layers: [{ ...layer, id: 1 }], objects: [] }))).toBeUndefined()
		expect(parseMap(JSON.stringify({ layers: ['x'], objects: [] }))).toBeUndefined()
	})

	it('объект с неизвестным type или без id — undefined', () => {
		expect(parseMap(JSON.stringify({ layers: [layer], objects: [{ ...object, type: 'star' }] }))).toBeUndefined()
		expect(parseMap(JSON.stringify({ layers: [layer], objects: [{ ...object, id: 5 }] }))).toBeUndefined()
		expect(parseMap(JSON.stringify({ layers: [layer], objects: [null] }))).toBeUndefined()
	})

	it('геометрия по типу: без координат, rx, ry, вершин или elementId — undefined', () => {
		const bad = [
			{ id: 'a', type: 'polygon' },
			{
				id: 'a',
				type: 'polygon',
				points: [
					[0, 0],
					[1, 1],
				],
			},
			{ id: 'a', type: 'polygon', points: [[0, 0], [1, 1], [1]] },
			{
				id: 'a',
				type: 'polygon',
				points: [
					[0, 0],
					[1, 1],
					['1', 0],
				],
			},
			{ id: 'a', type: 'polygon', points: 'x' },
			{ id: 'a', type: 'point', x: 0 },
			{ id: 'a', type: 'point', x: Number.NaN, y: 0 },
			{ id: 'a', type: 'rect', x: 0, y: 0, width: 1 },
			{ id: 'a', type: 'ellipse', x: 0, y: 0, rx: 1 },
			{ id: 'a', type: 'svg' },
			{ id: 'a', type: 'svg', elementId: '' },
		]
		for (const item of bad) expect(parseMap(JSON.stringify({ layers: [layer], objects: [item] }))).toBeUndefined()
	})

	it('геометрия по типу: верные фигуры принимаются', () => {
		const objects = [
			{ id: 'r', type: 'rect', x: 0, y: 0, width: 1, height: 1 },
			{ id: 'e', type: 'ellipse', x: 0, y: 0, rx: 1, ry: 1 },
			{
				id: 'g',
				type: 'polygon',
				points: [
					[0, 0],
					[1, 0],
					[1, 1],
				],
			},
			{ id: 's', type: 'svg', elementId: 'shop' },
		]
		expect(parseMap(JSON.stringify({ layers: [layer], objects }))?.objects).toHaveLength(4)
	})

	it('повтор id слоя или объекта — undefined', () => {
		expect(parseMap(JSON.stringify({ layers: [layer], objects: [object, object] }))).toBeUndefined()
		expect(parseMap(JSON.stringify({ layers: [layer, layer], objects: [] }))).toBeUndefined()
	})

	it('routes: верные принимаются, неверные — undefined', () => {
		const map = (routes: unknown) => parseMap(JSON.stringify({ layers: [layer], objects: [object], routes }))
		const node = { id: 'n', x: 0, y: 0 }
		expect(map({ nodes: [node], edges: [['n', 'n']], transitions: [{ id: 't', nodes: ['n'] }] })).toBeDefined()
		expect(map({ nodes: [], edges: [] })).toBeDefined()
		for (const routes of [
			null,
			{ nodes: [] },
			{ edges: [] },
			{ nodes: [{ id: 'n' }], edges: [] },
			{ nodes: [node, node], edges: [] },
			{ nodes: [], edges: [['n']] },
			{ nodes: [], edges: [[1, 2]] },
			{ nodes: [], edges: [], transitions: {} },
			{ nodes: [], edges: [], transitions: [{ id: 't' }] },
			{ nodes: [], edges: [], transitions: [{ id: 't', nodes: [1] }] },
		])
			expect(map(routes)).toBeUndefined()
	})
})

describe('editorFiles: downloadText', () => {
	it('создаёт ссылку на Blob, кликает и освобождает URL после клика', async () => {
		const createObjectURL = vi.fn(() => 'blob:map')
		const revokeObjectURL = vi.fn()
		vi.stubGlobal(
			'URL',
			class extends URL {
				static createObjectURL = createObjectURL
				static revokeObjectURL = revokeObjectURL
			},
		)
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
		downloadText('{"a":1}', 'map.json')
		expect(createObjectURL).toHaveBeenCalledTimes(1)
		const blob = createObjectURL.mock.calls[0] as unknown as [Blob]
		expect(blob[0]).toBeInstanceOf(Blob)
		expect(blob[0].type).toBe('application/json')
		expect(click).toHaveBeenCalledTimes(1)
		const link = click.mock.contexts[0] as HTMLAnchorElement
		expect(link.download).toBe('map.json')
		expect(link.href).toBe('blob:map')
		expect(revokeObjectURL).not.toHaveBeenCalled()
		await new Promise(resolve => setTimeout(resolve))
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:map')
	})
})

describe('editorFiles: svgCandidates', () => {
	function mount(markup: string): HTMLElement {
		const container = document.createElement('div')
		container.innerHTML = markup
		document.body.append(container)
		return container
	}

	it('без контейнера — пусто', () => {
		expect(svgCandidates(null, 'p-', new Set())).toEqual([])
	})

	it('берёт фигуры с приставкой, пропускает служебные и занятые', () => {
		const container = mount(`
			<svg xmlns="http://www.w3.org/2000/svg">
				<defs><path id="p-defs"/></defs>
				<mask><g><circle id="p-masked"/></g></mask>
				<path id="p-hall"><title> Холл </title></path>
				<rect id="p-shop"><g><title>Вложенный</title></g></rect>
				<g id="p-group"><title>   </title></g>
				<ellipse id="p-taken"/>
				<text id="p-text">Текст</text>
				<polygon id="other"/>
				<line id="p-line"/>
			</svg>
		`)
		expect(svgCandidates(container, 'p-', new Set(['taken']))).toEqual([
			{ elementId: 'hall', title: 'Холл' },
			{ elementId: 'shop', title: 'shop' },
			{ elementId: 'group', title: 'group' },
			{ elementId: 'line', title: 'line' },
		])
	})

	it('элементы без родителя внутри контейнера', () => {
		const container = document.createElement('div')
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		path.id = 'p-solo'
		container.append(path)
		expect(svgCandidates(container, 'p-', new Set())).toEqual([{ elementId: 'solo', title: 'solo' }])
	})
})
