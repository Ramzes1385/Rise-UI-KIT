import type { Material } from 'three'
import { boxModel } from '../modelsTestHelpers'
import { describe, expect, it, vi } from 'vitest'
import { MODEL3D_LIBRARY } from '../../../models/library'
import { pulseDecor } from '../../../models/behavior/modelRestyle'
import { createTestRegistry, node, runFrames } from '../modelsTestKit'
import type { Model3DInstance, Model3DPart } from '../../../types/model3d.types'
import type { Model3DRegistryOptions } from '../../../types/internal/model3dInternal.types'
import { BoxGeometry, Color, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three'

const resolveColor = (css: string) => new Color(css.startsWith('#') ? css : '#3366aa')

function setup(extra: Partial<Model3DRegistryOptions> = {}) {
	const made = createTestRegistry({ resolveColor, library: { ...MODEL3D_LIBRARY, laptop: boxModel() }, ...extra })
	made.registry.add('a', { node: node('a', 'x'), kindModel: 'laptop' })
	made.registry.commit()
	const handle = made.registry.getHandle('a')!
	const meshes = () => {
		const found: Mesh[] = []
		handle.object.traverse(item => (item as Mesh).isMesh && item.parent?.name !== 'model-decor' && found.push(item as Mesh))
		return found
	}
	const decor = () => handle.object.getObjectByName('model-decor')
	return { ...made, handle, meshes, decor, body: () => meshes()[0], lamp: () => meshes()[1] }
}

const std = (material: Material | Material[]) => material as MeshStandardMaterial

describe('состояния → материалы', () => {
	it('покой: исходные общие материалы кита', () => {
		const { body, lamp } = setup()
		expect(std(body().material).userData.part).toBe('body')
		expect(std(lamp().material).userData.part).toBe('light')
	})

	it('наведение: собственные клоны со свечением 0,08; возврат в покой — исходные и клоны освобождены', () => {
		const { handle, body, lamp } = setup()
		const base = body().material
		const lampBase = std(lamp().material)
		handle.setState({ isHovered: true })
		const own = std(body().material)
		expect(own).not.toBe(base)
		expect(own.emissiveIntensity).toBeCloseTo(std(base).emissiveIntensity + 0.08)
		expect(own.emissive.getHexString()).toBe(own.color.getHexString())
		const dispose = vi.spyOn(own, 'dispose')
		const ownLamp = std(lamp().material)
		expect(ownLamp.emissiveIntensity).toBeCloseTo(lampBase.emissiveIntensity + 0.08)
		handle.clearState()
		expect(body().material).toBe(base)
		expect(lamp().material).toBe(lampBase)
		expect(dispose).toHaveBeenCalledTimes(1)
	})

	it('приглушён: прозрачность 0,35, depthWrite выключен', () => {
		const { handle, body } = setup()
		handle.setState({ isDimmed: true })
		expect(std(body().material)).toMatchObject({ opacity: 0.35, transparent: true, depthWrite: false })
		handle.setState({ isDimmed: false })
		expect(std(body().material).userData.part).toBe('body')
	})

	it('перетаскивание: призрак 0,5', () => {
		const { handle, body } = setup()
		handle.setState({ isDragging: true })
		expect(std(body().material).opacity).toBe(0.5)
	})

	it('muted: цвет сдвигается к серому', () => {
		const { handle, body } = setup()
		const base = std(body().material).color.clone()
		handle.setState({ tone: 'muted' })
		const own = std(body().material).color
		expect(own.getHex()).not.toBe(base.getHex())
		const gray = new Color('#8a8f98')
		const distance = (color: Color) => Math.abs(color.r - gray.r) + Math.abs(color.g - gray.g) + Math.abs(color.b - gray.b)
		expect(distance(own)).toBeLessThan(distance(base))
	})

	it('тот же клон переиспользуется между обновлениями вида', () => {
		const { handle, body } = setup()
		handle.setState({ isHovered: true })
		const first = body().material
		handle.setState({ isDimmed: true })
		expect(body().material).toBe(first)
	})
})

describe('setColor и setMaterial', () => {
	it('setColor по роли красит только эту роль, setColor(null, роль) снимает', () => {
		const { handle, body, lamp } = setup()
		handle.setColor('#ff0000', 'body')
		expect(std(body().material).color.getHexString()).toBe('ff0000')
		expect(std(lamp().material).userData.part).toBe('light')
		handle.setColor(null, 'body')
		expect(std(body().material).userData.part).toBe('body')
	})

	it('setColor целиком красит все меши, свечение светящихся следует за цветом', () => {
		const { handle, body, lamp } = setup()
		handle.setColor('#00ff00')
		expect(std(body().material).color.getHexString()).toBe('00ff00')
		expect(std(lamp().material).color.getHexString()).toBe('00ff00')
		expect(std(lamp().material).emissive.getHexString()).toBe('00ff00')
		expect(std(body().material).emissive.getHex()).toBe(0)
		handle.setColor('#0000ff', 'body')
		expect(std(body().material).color.getHexString()).toBe('0000ff')
		handle.setColor(null)
		expect(std(body().material).userData.part).toBe('body')
	})

	it('свечение при наведении у несветящегося материала включает emissive цветом материала', () => {
		const { handle, body } = setup()
		handle.setState({ isHovered: true })
		const own = std(body().material)
		expect(own.emissive.getHexString()).toBe(own.color.getHexString())
	})

	it('setMaterial подставляет чужой материал; кит его не освобождает, null возвращает свой', () => {
		const { registry, handle, body } = setup()
		const own = new MeshStandardMaterial()
		const dispose = vi.spyOn(own, 'dispose')
		const base = body().material
		handle.setMaterial('body', own)
		expect(body().material).toBe(own)
		handle.setMaterial('body', null)
		expect(body().material).toBe(base)
		handle.setMaterial('body', own)
		registry.dispose()
		expect(dispose).not.toHaveBeenCalled()
	})

	it('setMaterial побеждает состояние', () => {
		const { handle, body } = setup()
		const own = new MeshStandardMaterial()
		handle.setMaterial('body', own)
		handle.setState({ isDimmed: true })
		expect(body().material).toBe(own)
	})
})

describe('особые материалы', () => {
	function viaFactory(make: () => Model3DInstance) {
		const made = createTestRegistry({ resolveColor, getModels: () => ({ f: { create: make } }) })
		made.registry.add('a', { node: node('a', 'x'), model3d: { model: 'f' } })
		made.registry.commit()
		return { ...made, handle: made.registry.getHandle('a')! }
	}

	it('материал без свечения (MeshBasicMaterial) окрашивается и затемняется без сбоев', () => {
		const mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial({ color: '#ffffff' }))
		const object = new Group()
		object.add(mesh)
		const { handle } = viaFactory(() => ({ object }))
		handle.setState({ isHovered: true })
		const own = mesh.material as MeshBasicMaterial
		expect(own).toBeInstanceOf(MeshBasicMaterial)
		handle.setColor('#ff0000')
		expect(own.color.getHexString()).toBe('ff0000')
	})

	it('свой цвет работает для меша вне частей (part null): целиком', () => {
		const inPart = new Mesh(new BoxGeometry(), new MeshStandardMaterial())
		const stray = new Mesh(new BoxGeometry(), new MeshStandardMaterial())
		const object = new Group()
		object.add(inPart, stray)
		const { handle } = viaFactory(() => ({ object, parts: { body: [inPart] } }))
		handle.setColor('#123456')
		expect((stray.material as MeshStandardMaterial).color.getHexString()).toBe('123456')
		const custom = new MeshStandardMaterial()
		handle.setMaterial('body', custom)
		expect(inPart.material).toBe(custom)
		expect(stray.material).not.toBe(custom)
	})

	it('меш с массивом материалов не перекрашивается и не ломается', () => {
		const list = [new MeshStandardMaterial(), new MeshStandardMaterial()]
		const mesh = new Mesh(new BoxGeometry(), list)
		const object = new Group()
		object.add(mesh)
		const { handle } = viaFactory(() => ({ object }))
		handle.setState({ isHovered: true })
		handle.setColor('#ff0000')
		expect(mesh.material).toBe(list)
	})

	it('светящийся материал фабрики: emissive следует за цветом, свечение складывается', () => {
		const glowing = new MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.5 })
		const dark = new MeshStandardMaterial({ color: '#ffffff' })
		const a = new Mesh(new BoxGeometry(), glowing)
		const b = new Mesh(new BoxGeometry(), dark)
		const object = new Group()
		object.add(a, b)
		const { handle } = viaFactory(() => ({ object }))
		handle.setState({ isHovered: true })
		handle.setColor('#ff0000')
		expect((a.material as MeshStandardMaterial).emissive.getHexString()).toBe('ff0000')
		expect((a.material as MeshStandardMaterial).emissiveIntensity).toBeCloseTo(0.58)
		expect((b.material as MeshStandardMaterial).emissiveIntensity).toBeCloseTo(1.08)
	})
})

describe('кольца и светодиод', () => {
	it('в покое декора нет', () => {
		const { decor } = setup()
		expect(decor()).toBeUndefined()
	})

	it('наведение → кольцо hover; выбор заменяет его на select; снятие убирает', () => {
		const { handle, decor } = setup()
		handle.setState({ isHovered: true })
		const group = decor()!
		expect(group.children).toHaveLength(1)
		const hover = group.children[0] as Mesh
		expect(hover.userData.css).toBe('var(--rise-border-accented)')
		expect(hover.rotation.x).toBeCloseTo(-Math.PI / 2)
		handle.setState({ isSelected: true })
		expect(group.children).toHaveLength(1)
		expect((group.children[0] as Mesh).userData.css).toBe('var(--rise-primary)')
		handle.clearState()
		expect(group.children).toHaveLength(0)
	})

	it('тон меняется с warning на danger: кольцо и светодиод пересоздаются с новым цветом', () => {
		const { handle, decor } = setup()
		handle.setState({ tone: 'warning' })
		const group = decor()!
		expect(group.children).toHaveLength(2)
		const css = () => group.children.map(child => child.userData.css).filter(Boolean)
		expect(css()).toEqual(['var(--rise-warning)'])
		const led = group.children.find(child => !child.userData.css) as Mesh
		expect(led.position.y).toBeCloseTo(1.35)
		handle.setState({ tone: 'danger' })
		expect(css()).toEqual(['var(--rise-error)'])
		expect(group.children).toHaveLength(2)
		handle.setState({ tone: 'info' })
		expect(group.children).toHaveLength(0)
	})

	it('кольцо того же вида не пересоздаётся', () => {
		const { handle, decor } = setup()
		handle.setState({ isFocused: true })
		const ring = decor()!.children[0]
		handle.setState({ isFocused: true, isHovered: true })
		expect(decor()!.children).toContain(ring)
	})

	it('размеры колец растут по виду', () => {
		const { handle, decor } = setup()
		handle.setState({ isFocused: true, isInvalid: true, isSelected: true, isActive: true, tone: 'danger' })
		const sizes = decor()!
			.children.filter(child => child.userData.css)
			.map(child => child.scale.x)
		expect(sizes).toHaveLength(5)
		expect(new Set(sizes).size).toBe(5)
	})

	it('геометрии и материалы колец общие, освобождаются вместе с узлом', () => {
		const { registry, handle, decor } = setup()
		handle.setState({ isHovered: true, isFocused: true, tone: 'danger' })
		const meshes = decor()!.children as Mesh[]
		const disposables = meshes.flatMap(item => [item.geometry, item.material as Material])
		const spies = disposables.map(item => vi.spyOn(item, 'dispose'))
		registry.remove('a')
		spies.forEach(spy => expect(spy).toHaveBeenCalled())
	})

	it('пульс кольца активного шага: масштаб и прозрачность меняются по кадрам, при уменьшенном движении — нет', () => {
		const { handle, decor, loop } = setup()
		handle.setState({ isActive: true })
		const ring = decor()!.children[0] as Mesh
		const scale0 = ring.scale.x
		runFrames(loop, 3, 0.1)
		const scale1 = ring.scale.x
		expect(scale1).not.toBe(scale0)
		expect((ring.material as Material).opacity).toBeGreaterThanOrEqual(0.55)
		expect((ring.material as Material).opacity).toBeLessThanOrEqual(1)
		handle.clearState()
		runFrames(loop, 1)
		expect(loop.tickers.size).toBe(0)
	})

	it('при уменьшенном движении кольцо не пульсирует и цикл не держится', () => {
		const { handle, decor, loop } = setup({ isReducedMotion: () => true })
		handle.setState({ isActive: true })
		const ring = decor()!.children[0] as Mesh
		const scale0 = ring.scale.x
		runFrames(loop, 3, 0.1)
		expect(ring.scale.x).toBe(scale0)
		expect(loop.tickers.size).toBe(0)
	})

	it('изменение вида без активного кольца (pulseDecor без кольца) не падает', () => {
		const { handle, loop } = setup()
		handle.setState({ isActive: true })
		handle.setState({ isActive: false, isFocused: true })
		expect(() => runFrames(loop, 2)).not.toThrow()
	})
})

describe('pulseDecor напрямую', () => {
	it('нет декора или активного кольца — ничего не делает', () => {
		expect(() => pulseDecor({ decor: null } as never, 1, 1.6)).not.toThrow()
		expect(() => pulseDecor({ decor: { rings: new Map() } } as never, 1, 1.6)).not.toThrow()
	})
})

describe('части по ролям', () => {
	it('роли модели берутся из parts', () => {
		const roles: Model3DPart[] = []
		const { body, lamp } = setup()
		roles.push(std(body().material).userData.part, std(lamp().material).userData.part)
		expect(roles).toEqual(['body', 'light'])
	})
})
