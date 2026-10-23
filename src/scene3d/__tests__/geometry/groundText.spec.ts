import { Mesh } from 'three'
import { createGroundTextAtlas, groundFont, isGroundTextFlipped, orientGroundText } from '../../geometry/groundText'

function fakeCanvas() {
	const context = {
		font: '',
		textBaseline: '',
		textAlign: '',
		fillStyle: '',
		measureText: vi.fn((text: string) => ({ width: text.length * 10 })),
		fillText: vi.fn(),
		clearRect: vi.fn(),
	}
	const canvas = { width: 0, height: 0, getContext: vi.fn(() => context) } as unknown as HTMLCanvasElement
	return { canvas, context }
}

function atlas(options: { size?: number; fontPx?: number } = {}) {
	const { canvas, context } = fakeCanvas()
	return { canvas, context, atlas: createGroundTextAtlas({ color: '#111', createCanvas: () => canvas, ...options }) }
}

describe('переворот надписи', () => {
	it('читаема, пока угол надписи в полукруге камеры', () => {
		expect(isGroundTextFlipped(0, 0)).toBe(false)
		expect(isGroundTextFlipped(0, Math.PI)).toBe(true)
		expect(isGroundTextFlipped(0, Math.PI / 2 - 0.01)).toBe(false)
		expect(isGroundTextFlipped(0, Math.PI / 2 + 0.01)).toBe(true)
	})

	it('orientGroundText добавляет полуоборот только при перевороте', () => {
		const mesh = new Mesh()
		orientGroundText(mesh, 0.3, 0)
		expect(mesh.rotation.y).toBeCloseTo(0.3)
		orientGroundText(mesh, 0.3, Math.PI)
		expect(mesh.rotation.y).toBeCloseTo(0.3 + Math.PI)
	})
})

describe('groundFont', () => {
	it('вес, кегль и семейство', () => {
		expect(groundFont(700, 40)).toMatch(/^700 40px 'Rise Grotesk'/)
	})
})

describe('createGroundTextAtlas', () => {
	it('холст квадратный нужного размера, одна текстура и один материал', () => {
		const { canvas, atlas: ground } = atlas({ size: 256 })
		expect([canvas.width, canvas.height]).toEqual([256, 256])
		expect(ground.material.map).toBe(ground.texture)
		expect(ground.texture.colorSpace).toBe('srgb')
	})

	it('без createCanvas берёт холст из документа и размер 2048', () => {
		const { context } = fakeCanvas()
		const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never)
		const ground = createGroundTextAtlas({ color: '#000' })
		expect(spy).toHaveBeenCalledWith('2d')
		expect((ground.texture.image as HTMLCanvasElement).width).toBe(2048)
	})

	it('add: упаковка полками, размеры по измерению текста, UV в долях холста', () => {
		const { context, atlas: ground } = atlas({ size: 1000, fontPx: 10 })
		const first = ground.add('a', 'abcd')
		expect(first).toMatchObject({ id: 'a', text: 'abcd', weight: 600, x: 0, y: 0, width: 44, height: 14 })
		expect(first?.aspect).toBeCloseTo(44 / 14)
		expect(first?.u0).toBe(0)
		expect(first?.u1).toBeCloseTo(0.044)
		expect(first?.v1).toBe(1)
		expect(first?.v0).toBeCloseTo(1 - 0.014)
		const second = ground.add('b', 'abcd', 700)
		expect(second).toMatchObject({ x: 44, y: 0, weight: 700 })
		expect(context.fillText).toHaveBeenCalledTimes(2)
		expect(context.fillText).toHaveBeenLastCalledWith('abcd', 44 + 22, expect.closeTo(7.42, 2))
		expect(ground.has('a')).toBe(true)
		expect(ground.get('b')).toBe(second)
		expect(ground.has('zzz')).toBe(false)
		expect(ground.texture.version).toBeGreaterThan(0)
	})

	it('повторный id возвращает прежнюю запись без перерисовки', () => {
		const { context, atlas: ground } = atlas()
		const first = ground.add('a', 'text')
		context.fillText.mockClear()
		expect(ground.add('a', 'другой')).toBe(first)
		expect(context.fillText).not.toHaveBeenCalled()
	})

	it('переполнение: add возвращает null, запись не создаётся', () => {
		const { atlas: ground } = atlas({ size: 30, fontPx: 10 })
		;['a', 'b', 'c', 'd'].forEach(id => expect(ground.add(id, 'a')).not.toBeNull())
		expect(ground.add('e', 'a')).toBeNull()
		expect(ground.has('e')).toBe(false)
		expect(ground.createMesh('e', 1)).toBeNull()
		expect(ground.get('d')).toMatchObject({ x: 14, y: 14 })
	})

	it('createMesh: плоскость лежит на земле, пропорции надписи, UV из атласа', () => {
		const { atlas: ground } = atlas({ size: 1000, fontPx: 10 })
		const entry = ground.add('a', 'abcd')
		const mesh = ground.createMesh('a', 2) as Mesh
		expect(mesh.material).toBe(ground.material)
		expect(mesh.renderOrder).toBe(3)
		mesh.geometry.computeBoundingBox()
		const box = mesh.geometry.boundingBox
		expect(box?.max.x).toBeCloseTo((2 * (entry?.aspect ?? 0)) / 2)
		expect(box?.max.y).toBeCloseTo(0)
		expect(box?.max.z).toBeCloseTo(1)
		const uv = mesh.geometry.getAttribute('uv')
		const us = Array.from({ length: uv.count }, (_, index) => uv.getX(index))
		const vs = Array.from({ length: uv.count }, (_, index) => uv.getY(index))
		expect(Math.min(...us)).toBeCloseTo(entry?.u0 ?? -1, 6)
		expect(Math.max(...us)).toBeCloseTo(entry?.u1 ?? -1, 6)
		expect(Math.min(...vs)).toBeCloseTo(entry?.v0 ?? -1, 6)
		expect(Math.max(...vs)).toBeCloseTo(entry?.v1 ?? -1, 6)
	})

	it('recolor перерисовывает все надписи новым цветом', () => {
		const { context, atlas: ground } = atlas()
		ground.add('a', 'one')
		ground.add('b', 'two')
		context.fillText.mockClear()
		const version = ground.texture.version
		ground.recolor('#fff')
		expect(context.fillText).toHaveBeenCalledTimes(2)
		expect(context.fillStyle).toBe('#fff')
		expect(ground.texture.version).toBeGreaterThan(version)
	})

	it('refresh помечает текстуру, dispose освобождает ресурсы и забывает записи', () => {
		const { atlas: ground } = atlas()
		ground.add('a', 'one')
		const version = ground.texture.version
		ground.refresh()
		expect(ground.texture.version).toBeGreaterThan(version)
		const textureDispose = vi.spyOn(ground.texture, 'dispose')
		const materialDispose = vi.spyOn(ground.material, 'dispose')
		ground.dispose()
		expect(textureDispose).toHaveBeenCalled()
		expect(materialDispose).toHaveBeenCalled()
		expect(ground.has('a')).toBe(false)
	})
})
