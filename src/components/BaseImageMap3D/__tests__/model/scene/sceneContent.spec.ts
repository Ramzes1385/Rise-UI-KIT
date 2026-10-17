import type { MeshStandardMaterial } from 'three'
import type { ImageMap3DData } from '../../../types/imageMap3dData.types'
import { buildSceneContent, objectColors, paintFloor } from '../../../model/scene/buildScene'
import { Color, Group, Mesh, BoxGeometry, MeshBasicMaterial, Texture, TextureLoader } from 'three'
import type { SceneObjectState, SceneStateColor } from '../../../types/internal/imageMap3dInternal.types'
import { createColorResolver, parseCssColor, stateColors } from '../../../model/scene/materials/sceneColors'
import { addSvgObjects, applyLayerMode, INACTIVE_LAYER_OPACITY, recolorScene } from '../../../model/scene/sceneState'
import { loadLayerSvg, loadSvgTexture, loadTexture, svgTextureMarkup } from '../../../model/scene/materials/layerTexture'
import { adoptModelNode, createShapeEntry, paintObject, setObjectState } from '../../../model/scene/materials/sceneObjects'

const resolveFake = (css: string): Color => new Color(css.startsWith('var(') ? '#123456' : css)

const COLORS: Record<SceneObjectState, SceneStateColor> = {
	base: { color: new Color('#ff0000'), opacity: 0.5 },
	hover: { color: new Color('#00ff00'), opacity: 0.8 },
	active: { color: new Color('#0000ff'), opacity: 1 },
}

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><rect id="room" x="10" y="10" width="20" height="20"/></svg>'

const DATA: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: '1', width: 100, height: 50 },
		{ id: 'f2', title: '2', width: 100, height: 50, svg: SVG, elevation: 60 },
		{ id: 'f3', title: '3', width: 100, height: 50, model: { url: 'f3.glb' } },
	],
	objects: [
		{ id: 'a', title: 'A', type: 'rect', x: 0, y: 0, width: 0.5, height: 0.5, group: 'shops' },
		{ id: 'b', title: 'B', type: 'ellipse', x: 0.5, y: 0.5, rx: 0.1, ry: 0.1, layer: 'f1', style: { hover: { fill: '#ffffff' } } },
		{ id: 'c', title: 'C', type: 'point', x: 0.5, y: 0.5 },
		{ id: 'room', title: 'Room', type: 'svg', elementId: 'room', layer: 'f2' },
		{ id: 'ghost', title: 'Ghost', type: 'svg', elementId: 'missing', layer: 'f2' },
		{ id: 'm', title: 'M', type: 'rect', x: 0, y: 0, width: 0.5, height: 0.5, layer: 'f3' },
		{ id: 'lost', title: 'Lost', type: 'rect', x: 0, y: 0, width: 0.5, height: 0.5, layer: 'nowhere' },
	],
	groups: [{ id: 'shops', title: 'Магазины', color: '#ff8800' }],
}

function fakeContext(rgba: [number, number, number, number]) {
	return {
		clearRect: vi.fn(),
		fillRect: vi.fn(),
		fillStyle: '',
		getImageData: vi.fn(() => ({ data: Uint8ClampedArray.from(rgba) })),
	} as unknown as CanvasRenderingContext2D
}

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe('цвета сцены', () => {
	it('parseCssColor: через холст — любой цвет браузера; без холста — простые цвета, иначе серый', () => {
		expect(parseCssColor('oklch(0.6 0.2 250)', fakeContext([255, 0, 0, 255])).getHexString()).toBe('ff0000')
		expect(parseCssColor('rgb(0, 128, 255)', null).getHexString()).toBe('0080ff')
		expect(parseCssColor('#abcdef', null).getHexString()).toBe('abcdef')
		expect(parseCssColor('color(srgb 1 0 0)', null).getHexString()).toBe('808080')
		expect(parseCssColor('  ', fakeContext([1, 2, 3, 255])).getHexString()).toBe('808080')
		expect(parseCssColor('transparent', fakeContext([0, 0, 0, 0])).getHexString()).toBe('808080')
		expect(parseCssColor('transparent', null).getHexString()).toBe('808080')
	})

	it('createColorResolver: недопустимый цвет — серый, а не цвет текста или прошлое значение', () => {
		const host = document.createElement('div')
		host.style.color = 'rgb(1, 2, 3)'
		document.body.append(host)
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
		const resolve = createColorResolver(host)
		expect(resolve('rgb(10, 20, 30)').getHexString()).toBe('0a141e')
		expect(resolve('not-a-color').getHexString()).toBe('808080')
		host.remove()
	})

	it('createColorResolver: вычисленный цвет в области карты, кэш на значение', () => {
		const host = document.createElement('div')
		document.body.append(host)
		const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
		const resolve = createColorResolver(host)
		const color = resolve('rgb(10, 20, 30)')
		expect(color.getHexString()).toBe('0a141e')
		expect(resolve('rgb(10, 20, 30)')).toBe(color)
		expect(resolve('var(--rise-unknown)').getHexString()).toBe('808080')
		expect(host.childElementCount).toBe(0)
		expect(getContext).toHaveBeenCalledWith('2d', { willReadFrequently: true })
		host.remove()
	})

	it('createColorResolver: переменная без значения — запасной цвет по явному правилу, а не цвет текста', () => {
		const host = document.createElement('div')
		document.body.append(host)
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
		vi.spyOn(window, 'getComputedStyle').mockImplementation(
			element =>
				({
					color: (element as HTMLElement).style.color || 'rgb(1, 2, 3)',
					getPropertyValue: () => '  ',
				}) as unknown as CSSStyleDeclaration,
		)
		const resolve = createColorResolver(host)
		expect(resolve('var(--rise-missing)').getHexString()).toBe('808080')
		expect(resolve('var( --rise-missing )').getHexString()).toBe('808080')
		expect(resolve('var(--rise-missing, #00ff00)').getHexString()).toBe('00ff00')
		expect(resolve('var(--rise-missing, var(--rise-also-missing))').getHexString()).toBe('808080')
		host.remove()
	})

	it('createColorResolver берёт исходную строку, если вычисленного цвета нет', () => {
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
		vi.spyOn(window, 'getComputedStyle').mockReturnValue({ color: '' } as CSSStyleDeclaration)
		expect(createColorResolver(document.body)('#00ff00').getHexString()).toBe('00ff00')
	})

	it('stateColors: заливка состояния или общая, непрозрачность своя или 3D-умолчание', () => {
		const colors = stateColors(
			{ '--im-fill': '#ff0000', '--im-fill-active': '#0000ff', '--im-fill-opacity-hover': '2', '--im-fill-opacity': 'x' },
			resolveFake,
		)
		expect(colors.base).toEqual({ color: new Color('#ff0000'), opacity: 0.7 })
		expect(colors.hover).toEqual({ color: new Color('#ff0000'), opacity: 1 })
		expect(colors.active.color.getHexString()).toBe('0000ff')
		expect(stateColors({ '--im-fill-opacity': '0.3' }, resolveFake).base).toEqual({ color: new Color('#123456'), opacity: 0.3 })
	})

	it('objectColors: цвет группы и свой стиль объекта, как в 2D', () => {
		const colors = objectColors(DATA.objects[0], DATA, resolveFake)
		expect(colors.base.color.getHexString()).toBe('ff8800')
		expect(objectColors(DATA.objects[1], DATA, resolveFake).hover.color.getHexString()).toBe('ffffff')
	})
})

describe('объекты сцены', () => {
	it('createShapeEntry: меш с id объекта и общим материалом', () => {
		const entry = createShapeEntry({ id: 'x', layerId: 'f1' }, { geometries: [new BoxGeometry()], hasOutline: false }, COLORS)
		expect(entry).toMatchObject({ id: 'x', layerId: 'f1', source: 'shape', state: 'base' })
		expect(entry.meshes[0].userData.objectId).toBe('x')
		expect(entry.meshes[0].material).toBe(entry.material)
	})

	it('adoptModelNode: все меши узла получают материал объекта', () => {
		const node = new Group()
		const inner = new Group()
		inner.add(new Mesh(new BoxGeometry(), new MeshBasicMaterial()))
		node.add(new Mesh(new BoxGeometry(), new MeshBasicMaterial()), inner)
		const entry = adoptModelNode({ id: 'shop', layerId: 'f1' }, node, COLORS)
		expect(entry.source).toBe('model')
		expect(entry.meshes).toHaveLength(2)
		expect(entry.meshes.every(mesh => mesh.material === entry.material && mesh.userData.objectId === 'shop')).toBe(true)
	})

	it('adoptModelNode с контуром: линии по рёбрам — дети мешей, общий материал, цвет по состоянию; без флага контура нет', () => {
		const first = new Mesh(new BoxGeometry(), new MeshBasicMaterial())
		const second = new Mesh(new BoxGeometry(), new MeshBasicMaterial())
		const node = new Group()
		node.add(first, second)
		const entry = adoptModelNode({ id: 'shop', layerId: 'f1', hasOutline: true }, node, COLORS)
		expect(entry.lines).toHaveLength(2)
		expect(entry.lines.map(line => line.parent)).toEqual([first, second])
		expect(entry.outline).not.toBeNull()
		expect(entry.lines.every(line => line.material === entry.outline)).toBe(true)
		expect(entry.lines[0].raycast(null as never, [])).toBeUndefined()
		paintObject(entry, 1)
		expect(entry.outline?.opacity).toBeCloseTo(0.5)
		const plain = adoptModelNode({ id: 'shop', layerId: 'f1' }, new Group().add(new Mesh()), COLORS)
		expect([plain.lines, plain.outline]).toEqual([[], null])
		const empty = adoptModelNode({ id: 'none', layerId: 'f1', hasOutline: true }, new Group(), COLORS)
		expect([empty.lines, empty.outline]).toEqual([[], null])
	})

	it('paintObject и setObjectState: цвет и непрозрачность состояния с учётом этажа', () => {
		const content = buildSceneContent(DATA, resolveFake)
		const entry = content.objects.get('a')
		expect(entry).toBeDefined()
		if (!entry) return
		entry.colors = COLORS
		paintObject(entry, 0.5)
		expect(entry.material.opacity).toBe(0.25)
		expect(entry.material.depthWrite).toBe(false)
		setObjectState(content, 'a', 'active')
		expect(entry.material.color.getHexString()).toBe('0000ff')
		expect(entry.material.opacity).toBe(1)
		expect(entry.material.depthWrite).toBe(true)
		const material = entry.material
		setObjectState(content, 'a', 'active')
		setObjectState(content, 'nope', 'hover')
		expect(entry.material).toBe(material)
		content.layers.delete('f1')
		setObjectState(content, 'a', 'hover')
		expect(entry.material.opacity).toBe(0.8)
	})
})

describe('сборка сцены', () => {
	it('этажи по высоте, пол — у слоёв без модели, выдавлены только фигуры слоёв без модели', () => {
		const content = buildSceneContent(DATA, resolveFake)
		expect([...content.layers.values()].map(layer => layer.elevation)).toEqual([0, 60, 50])
		expect(content.layers.get('f1')?.floorMaterials).toHaveLength(2)
		expect(content.layers.get('f3')?.floorMaterials).toEqual([])
		expect([...content.objects.keys()]).toEqual(['a', 'b'])
		expect(content.root.getObjectByName('rise-lights')).toBeDefined()
		expect(content.root.getObjectByName('f2')?.position.y).toBe(60)
		const floor = content.layers.get('f1')?.floorMaterials ?? []
		expect(floor.map(material => material.color.getHexString())).toEqual(['123456', '123456'])
	})

	it('пол с текстурой не подкрашивается; этаж без пола пропускается', () => {
		const content = buildSceneContent(DATA, resolveFake)
		const layer = content.layers.get('f1')
		if (!layer) return
		layer.floorMaterials[1].userData.hasMap = true
		layer.floorMaterials[1].color.set(0xffffff)
		paintFloor(layer, () => new Color('#000000'))
		expect(layer.floorMaterials.map(material => material.color.getHexString())).toEqual(['000000', 'ffffff'])
		const empty = content.layers.get('f3')
		if (empty) expect(() => paintFloor(empty, resolveFake)).not.toThrow()
	})

	it('addSvgObjects выдавливает элементы SVG слоя по elementId; повторно — не дублирует', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const content = buildSceneContent(DATA, resolveFake)
		expect(addSvgObjects(content, { data: DATA, layerId: 'f2', markup: SVG }, resolveFake)).toBe(1)
		expect(content.objects.get('room')?.layerId).toBe('f2')
		expect(addSvgObjects(content, { data: DATA, layerId: 'f2', markup: SVG }, resolveFake)).toBe(0)
		expect(addSvgObjects(content, { data: DATA, layerId: 'f1', markup: SVG }, resolveFake)).toBe(0)
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('нет фигуры для элемента «missing»'))
	})

	it('addSvgObjects ставит фигуры по viewBox слоя: масштаб и сдвиг те же, что у картинки пола', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const scaled =
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 5 50 25"><rect id="room" x="15" y="10" width="10" height="10"/></svg>'
		const content = buildSceneContent(DATA, resolveFake)
		addSvgObjects(content, { data: DATA, layerId: 'f2', markup: scaled }, resolveFake)
		const geometry = content.objects.get('room')?.meshes[0].geometry
		geometry?.computeBoundingBox()
		const box = geometry?.boundingBox
		expect([box?.min.x, box?.max.x, box?.min.z, box?.max.z].map(Number)).toEqual([10, 30, 10, 30])
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('нет фигуры для элемента «missing»'))
	})

	it('applyLayerMode: stack — все этажи, неактивные полупрозрачны; single — только активный', () => {
		const content = buildSceneContent(DATA, resolveFake)
		applyLayerMode(content, 'f2', 'stack')
		const floors = [...content.layers.values()]
		expect(floors.map(layer => [layer.group.visible, layer.opacity])).toEqual([
			[true, INACTIVE_LAYER_OPACITY],
			[true, 1],
			[true, INACTIVE_LAYER_OPACITY],
		])
		expect((content.layers.get('f1')?.floorMaterials[0] as MeshStandardMaterial).depthWrite).toBe(false)
		expect(content.objects.get('a')?.material.opacity).toBeCloseTo(0.7 * INACTIVE_LAYER_OPACITY)
		applyLayerMode(content, 'f1', 'single')
		expect(floors.map(layer => [layer.group.visible, layer.group.userData.isActive])).toEqual([
			[true, true],
			[false, false],
			[false, false],
		])
		expect(content.objects.get('a')?.material.opacity).toBeCloseTo(0.7)
		content.objects.get('a')!.layerId = 'gone'
		applyLayerMode(content, 'f1', 'stack')
		expect(content.objects.get('a')?.material.opacity).toBeCloseTo(0.7)
	})

	it('recolorScene пересчитывает цвета по новой теме', () => {
		const content = buildSceneContent(DATA, resolveFake)
		content.objects.set('orphan', {
			...createShapeEntry({ id: 'orphan', layerId: 'missing' }, { geometries: [new BoxGeometry()], hasOutline: false }, COLORS),
		})
		recolorScene(content, DATA, css => new Color(css.startsWith('var(') ? '#000000' : css))
		expect(content.layers.get('f1')?.floorMaterials[0].color.getHexString()).toBe('000000')
		expect(content.objects.get('b')?.material.color.getHexString()).toBe('000000')
		expect(content.objects.get('orphan')?.material.color.getHexString()).toBe('ff0000')
	})
})

describe('текстуры слоя', () => {
	it('loadLayerSvg: svg строкой очищается; svgUrl загружается; без SVG — пусто', async () => {
		const signal = new AbortController().signal
		expect(
			await loadLayerSvg({ id: 'a', title: 'A', width: 1, height: 1, svg: '<svg><script>x</script><rect id="r"/></svg>' }, signal),
		).not.toContain('script')
		const fetchMock = vi.fn(async () => ({ ok: true, text: async () => SVG }))
		vi.stubGlobal('fetch', fetchMock)
		expect(await loadLayerSvg({ id: 'a', title: 'A', width: 1, height: 1, svgUrl: '/plan.svg' }, signal)).toContain('room')
		expect(fetchMock).toHaveBeenCalledWith('/plan.svg', { signal })
		fetchMock.mockResolvedValueOnce({ ok: false, text: async () => SVG })
		expect(await loadLayerSvg({ id: 'a', title: 'A', width: 1, height: 1, svgUrl: '/plan.svg' }, signal)).toBe('')
		expect(await loadLayerSvg({ id: 'a', title: 'A', width: 1, height: 1 }, signal)).toBe('')
	})

	it('svgTextureMarkup: размер картинки — вдвое больше слоя, не больше 4096; viewBox по слою', () => {
		const small = new DOMParser().parseFromString(
			svgTextureMarkup(SVG, { id: 'a', title: 'A', width: 100, height: 50 }),
			'image/svg+xml',
		)
		expect([small.documentElement.getAttribute('width'), small.documentElement.getAttribute('height')]).toEqual(['200', '100'])
		const bare = '<svg xmlns="http://www.w3.org/2000/svg"/>'
		const big = new DOMParser().parseFromString(
			svgTextureMarkup(bare, { id: 'a', title: 'A', width: 8192, height: 4096 }),
			'image/svg+xml',
		)
		expect(big.documentElement.getAttribute('width')).toBe('4096')
		expect(big.documentElement.getAttribute('viewBox')).toBe('0 0 8192 4096')
	})

	it('svgTextureMarkup: viewBox берётся из width и height самого SVG, неверный viewBox заменяется, верный остаётся', () => {
		const layer = { id: 'a', title: 'A', width: 100, height: 50 }
		const viewBoxOf = (svg: string): string | null =>
			new DOMParser().parseFromString(svgTextureMarkup(svg, layer), 'image/svg+xml').documentElement.getAttribute('viewBox')
		const ns = 'xmlns="http://www.w3.org/2000/svg"'
		expect(viewBoxOf(`<svg ${ns} width="50" height="25"/>`)).toBe('0 0 50 25')
		expect(viewBoxOf(`<svg ${ns} viewBox="0 0 0 0"/>`)).toBe('0 0 100 50')
		expect(viewBoxOf(`<svg ${ns} viewBox="-5 -5 40 20"/>`)).toBe('-5 -5 40 20')
	})

	it('loadTexture и loadSvgTexture: цветовое пространство sRGB, адрес Blob освобождается', async () => {
		const texture = new Texture<HTMLImageElement>()
		const loader = new TextureLoader()
		const loadAsync = vi.spyOn(loader, 'loadAsync').mockResolvedValue(texture)
		expect((await loadTexture('/plan.png', loader)).colorSpace).toBe('srgb')
		vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:plan'), revokeObjectURL: vi.fn() }))
		await loadSvgTexture(SVG, { id: 'a', title: 'A', width: 100, height: 50 }, loader)
		expect(loadAsync).toHaveBeenLastCalledWith('blob:plan')
		expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:plan')
		loadAsync.mockRejectedValueOnce(new Error('broken'))
		await expect(loadSvgTexture(SVG, { id: 'a', title: 'A', width: 100, height: 50 }, loader)).rejects.toThrow('broken')
		expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2)
		await expect(loadTexture('/x.png', loader)).resolves.toBe(texture)
		expect(new TextureLoader().loadAsync).toBeDefined()
	})
})
