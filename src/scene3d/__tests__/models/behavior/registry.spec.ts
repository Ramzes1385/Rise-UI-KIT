import type { MeshStandardMaterial } from 'three'
import { describe, expect, it, vi } from 'vitest'
import type { BufferGeometry, Material } from 'three'
import { boxModel, meshOf } from '../modelsTestHelpers'
import { MODEL3D_LIBRARY } from '../../../models/library'
import { INSTANCE_THRESHOLD } from '../../../models/registry'
import { resolveScenePalette } from '../../../theme/scenePalette'
import { BoxGeometry, Color, Group, InstancedMesh, Matrix4, Mesh, Vector3 } from 'three'
import { createTestContext, createTestRegistry, node, runFrames } from '../modelsTestKit'
import type { Model3DRegistryOptions, Model3DSelection } from '../../../types/internal/model3dInternal.types'

const sel = (id: string, extra: Partial<Model3DSelection> = {}): Model3DSelection => ({
	node: node(id, 'x'),
	kindModel: 'server',
	...extra,
})

function fill(registry: ReturnType<typeof createTestRegistry>['registry'], count: number, prefix = 'n') {
	for (let index = 0; index < count; index += 1) registry.add(`${prefix}${index}`, sel(`${prefix}${index}`))
}

const instanced = (registry: ReturnType<typeof createTestRegistry>['registry']) =>
	registry.object.children.filter((child): child is InstancedMesh => child instanceof InstancedMesh)

const translationOf = (mesh: InstancedMesh, index: number) => {
	const matrix = new Matrix4()
	mesh.getMatrixAt(index, matrix)
	return new Vector3().setFromMatrixPosition(matrix)
}

const bodyHolds = (registry: ReturnType<typeof createTestRegistry>['registry'], id: string) =>
	registry.getHandle(id)!.object.children[0].children.length > 0

describe('выбор модели через реестр', () => {
	it('resolve: порядок по умолчанию — слова службы, запасная server', () => {
		const { registry } = createTestRegistry()
		expect(registry.resolve({ node: node('a', 'Redis'), kindModel: 'auto' }).key).toBe('ram')
		expect(registry.resolve({ node: node('a', 'что-то'), kindModel: 'auto' }).key).toBe('server')
		expect(registry.resolve({ node: node('a', 'Deploy'), kindModel: 'auto' }).key).toBe('server')
	})

	it('wordSets, fallback, models компонента и appModels, modelResolver передаются в выбор', () => {
		const { registry } = createTestRegistry({
			wordSets: ['learning'],
			fallback: 'book',
			getModels: () => ({ mine: { preset: 'db', words: ['zed'] } }),
			appModels: { theirs: { preset: 'bank', words: ['yak'] } },
			modelResolver: current => (current.title === 'resolver' ? 'cart' : null),
		})
		expect(registry.resolve({ node: node('a', 'Deploy'), kindModel: 'auto' }).key).toBe('rocket')
		expect(registry.resolve({ node: node('a', 'zed'), kindModel: 'auto' }).key).toBe('mine')
		expect(registry.resolve({ node: node('a', 'yak'), kindModel: 'auto' }).key).toBe('theirs')
		expect(registry.resolve({ node: node('a', 'resolver') }).key).toBe('cart')
		expect(registry.resolve({ node: node('a', 'пусто'), kindModel: 'auto' }).key).toBe('book')
	})

	it('неизвестный ключ — warn из опций, выбор продолжается', () => {
		const warn = vi.fn()
		const { registry } = createTestRegistry({ warn })
		expect(registry.resolve({ node: node('a', 'x'), model3d: { model: 'ghost' } }).key).toBe('shape')
		expect(warn).toHaveBeenCalledTimes(1)
	})

	it('без warn в опциях неизвестный ключ тоже не падает', () => {
		const { registry } = createTestRegistry()
		expect(() => registry.resolve({ node: node('a', 'x'), model3d: { model: 'ghost' } })).not.toThrow()
	})
})

describe('add, update, remove, commit', () => {
	it('add возвращает корень узла с sceneId; повторный add с тем же id пересобирает и возвращает тот же корень', () => {
		const { registry } = createTestRegistry()
		const root = registry.add('a', sel('a'))
		expect(root.userData.sceneId).toBe('a')
		expect(root.name).toBe('model-a')
		registry.commit()
		const first = registry.getHandle('a')!
		expect(registry.add('a', sel('a', { kindModel: 'shape' }))).toBe(root)
		registry.commit()
		const second = registry.getHandle('a')!
		expect(second).not.toBe(first)
		expect(second.preset).toBe('shape')
	})

	it('update пересобирает при commit; неизвестный id игнорируется', () => {
		const { registry } = createTestRegistry()
		registry.add('a', sel('a'))
		registry.commit()
		const before = meshOf(registry.getHandle('a')!.object)
		registry.update('a', sel('a', { kindModel: 'shape' }))
		registry.update('ghost', sel('ghost'))
		registry.commit()
		expect(meshOf(registry.getHandle('a')!.object)).not.toBe(before)
		expect(registry.getHandle('ghost')).toBeNull()
	})

	it('remove убирает узел и корень из родителя; неизвестный id игнорируется', () => {
		const { registry } = createTestRegistry()
		const parent = new Group()
		parent.add(registry.add('a', sel('a')))
		registry.commit()
		registry.remove('a')
		registry.remove('ghost')
		expect(registry.getHandle('a')).toBeNull()
		expect(registry.getHandles()).toEqual([])
		expect(parent.children).toHaveLength(0)
	})

	it('commit дважды не собирает собранное повторно', () => {
		const onModelReady = vi.fn()
		const { registry } = createTestRegistry({ onModelReady })
		registry.add('a', sel('a'))
		registry.commit()
		registry.commit()
		expect(onModelReady).toHaveBeenCalledTimes(1)
		expect(onModelReady).toHaveBeenCalledWith(registry.getHandle('a'))
	})

	it('onModelReady вызывается без обработчика молча', () => {
		const { registry } = createTestRegistry()
		registry.add('a', sel('a'))
		expect(() => registry.commit()).not.toThrow()
	})

	it('определение без preset, url и create собирается как server, preset дескриптора — ключ', () => {
		const { registry } = createTestRegistry({ getModels: () => ({ weird: {} as never }) })
		registry.add('a', { node: node('a', 'x'), model3d: { model: 'weird' } })
		registry.commit()
		const handle = registry.getHandle('a')!
		expect(handle.preset).toBe('weird')
		expect(handle.object.children[0].children).toHaveLength(1)
	})

	it('tint определения красит accent, scale определения — масштаб тела', () => {
		const { registry } = createTestRegistry({
			library: { ...MODEL3D_LIBRARY, laptop: boxModel() },
			getModels: () => ({ big: { preset: 'laptop', tint: '#ff0000', scale: 2 } }),
		})
		registry.add('a', { node: node('a', 'x'), model3d: { model: 'big' } })
		registry.commit()
		const handle = registry.getHandle('a')!
		expect(handle.object.children[0].scale.x).toBe(2)
		handle.setScale(3)
		expect(handle.object.children[0].scale.x).toBe(6)
	})

	it('getLook: вид узла, неизвестный — null', () => {
		const { registry } = createTestRegistry()
		registry.add('a', sel('a'))
		registry.commit()
		expect(registry.getLook('a')?.isNeutral).toBe(true)
		expect(registry.getLook('ghost')).toBeNull()
	})
})

describe('инстансинг: порог 8', () => {
	it('порог — 8', () => {
		expect(INSTANCE_THRESHOLD).toBe(8)
	})

	it('7 узлов — отдельные меши; корень реестра пуст', () => {
		const { registry } = createTestRegistry()
		fill(registry, 7)
		registry.commit()
		expect(registry.object.children).toHaveLength(0)
		registry.getHandles().forEach(handle => expect(bodyHolds(registry, handle.id)).toBe(true))
	})

	it('8 узлов — по InstancedMesh на часть, id по номеру экземпляра в userData.sceneInstanceIds', () => {
		const { registry } = createTestRegistry()
		fill(registry, 8)
		registry.commit()
		const meshes = instanced(registry)
		expect(meshes).toHaveLength(15)
		meshes.forEach(mesh => {
			expect(mesh.count).toBe(8)
			expect(mesh.userData.sceneInstanceIds).toEqual(['n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7'])
		})
		registry.getHandles().forEach(handle => expect(bodyHolds(registry, handle.id)).toBe(false))
	})

	it('instanceThreshold из опций меняет порог', () => {
		const { registry } = createTestRegistry({ instanceThreshold: 2 })
		fill(registry, 2)
		registry.commit()
		expect(instanced(registry).length).toBeGreaterThan(0)
	})

	it('sync пишет матрицы по положению корней; удалённый узел — нулевой масштаб', () => {
		const { registry } = createTestRegistry()
		fill(registry, 8)
		registry.commit()
		const roots = registry.getHandles().map(handle => handle.object)
		roots[3].position.set(5, 0, 2)
		registry.sync()
		const first = instanced(registry)[0]
		expect(translationOf(first, 3).toArray()).toEqual([5, 0, 2])
		registry.remove('n5')
		const matrix = new Matrix4()
		first.getMatrixAt(5, matrix)
		expect(matrix.determinant()).toBe(0)
		expect(first.userData.sceneInstanceIds[5]).toBe('n5')
	})

	it('onModelReady — по разу на узел при сборке группы', () => {
		const onModelReady = vi.fn()
		const { registry } = createTestRegistry({ onModelReady })
		fill(registry, 8)
		registry.commit()
		expect(onModelReady).toHaveBeenCalledTimes(8)
	})

	it('группа пересобирается при добавлении узлов', () => {
		const { registry } = createTestRegistry()
		fill(registry, 8)
		registry.commit()
		const old = [...instanced(registry)]
		fill(registry, 1, 'extra')
		registry.commit()
		const fresh = instanced(registry)
		expect(fresh).toHaveLength(15)
		fresh.forEach(mesh => {
			expect(mesh.count).toBe(9)
			expect(mesh.userData.sceneInstanceIds.at(-1)).toBe('extra0')
		})
		expect(old.some(mesh => fresh.includes(mesh))).toBe(false)
	})

	it('после удаления узлов новый узел ниже порога собирается отдельно, группа остаётся', () => {
		const { registry } = createTestRegistry()
		fill(registry, 8)
		registry.commit()
		;['n0', 'n1', 'n2'].forEach(id => registry.remove(id))
		fill(registry, 1, 'late')
		registry.commit()
		expect(bodyHolds(registry, 'late0')).toBe(true)
		expect(instanced(registry)[0].count).toBe(8)
	})

	it('узел с цветом, материалом или scale определения в группу не входит', () => {
		const { registry } = createTestRegistry({ getModels: () => ({ big: { preset: 'server', scale: 2 } }) })
		fill(registry, 8)
		registry.add('own', sel('own', { model3d: { model: 'big' } }))
		registry.commit()
		expect(instanced(registry)[0].count).toBe(8)
		expect(bodyHolds(registry, 'own')).toBe(true)
	})

	it('множители цвета экземпляра: наведение, приглушён, серый, покой', () => {
		const { registry } = createTestRegistry()
		fill(registry, 8)
		registry.commit()
		const factor = () => instanced(registry)[0].instanceColor!.getX(2)
		const handle = registry.getHandle('n2')!
		handle.setState({ isHovered: true })
		expect(factor()).toBeCloseTo(1.12)
		handle.setState({ isDimmed: true })
		expect(factor()).toBeCloseTo(0.55)
		handle.setState({ tone: 'muted' })
		expect(factor()).toBeCloseTo(0.6)
		handle.clearState()
		expect(factor()).toBe(1)
	})
})

describe('состояние от компонента', () => {
	it('registry.setState меняет вид узла; то же состояние повторно вид не пересчитывает', () => {
		const { registry } = createTestRegistry()
		registry.add('a', sel('a'))
		registry.commit()
		const state = {
			isHovered: true,
			isSelected: false,
			isActive: false,
			isDimmed: false,
			isFocused: false,
			tone: 'none',
			isDragging: false,
			isInvalid: false,
		} as const
		registry.setState('a', state)
		const look = registry.getLook('a')
		expect(look?.rings[0].id).toBe('hover')
		registry.setState('a', { ...state })
		expect(registry.getLook('a')).toBe(look)
		registry.getHandle('a')!.setState({ isHovered: true })
		expect(registry.getLook('a')).toBe(look)
	})
})

describe('инстансинг: особые случаи моделей', () => {
	it('модель с мешем вне частей собирается в группу', () => {
		const stray = (_node: unknown, ctx: ReturnType<typeof createTestContext>) => {
			const object = new Group()
			const inPart = new Mesh(
				ctx.geometry('t:a', () => new BoxGeometry()),
				ctx.material('body'),
			)
			const outside = new Mesh(
				ctx.geometry('t:b', () => new BoxGeometry()),
				ctx.material('body'),
			)
			object.add(inPart, outside)
			return { object, parts: { body: [inPart] } }
		}
		const { registry } = createTestRegistry({ library: { ...MODEL3D_LIBRARY, laptop: stray as never } })
		for (let index = 0; index < 8; index += 1) registry.add(`n${index}`, sel(`n${index}`, { kindModel: 'laptop' }))
		registry.commit()
		expect(instanced(registry)).toHaveLength(2)
	})

	it('без instanceColor после setColorAt цвет экземпляра не падает', () => {
		const spy = vi.spyOn(InstancedMesh.prototype, 'setColorAt').mockImplementation(function (this: InstancedMesh) {
			return this
		})
		const { registry } = createTestRegistry()
		fill(registry, 8)
		registry.commit()
		expect(() => registry.getHandle('n0')!.setState({ isHovered: true })).not.toThrow()
		spy.mockRestore()
	})
})

describe('вынос и возврат инстанса', () => {
	function eight(extra: Partial<Model3DRegistryOptions> = {}) {
		const setup = createTestRegistry({ getDuration: () => 200, ...extra })
		fill(setup.registry, 8)
		setup.registry.commit()
		return setup
	}
	const hiddenAt = (registry: ReturnType<typeof createTestRegistry>['registry'], index: number) => {
		const matrix = new Matrix4()
		instanced(registry)[0].getMatrixAt(index, matrix)
		return matrix.determinant() === 0
	}

	it('на время play() узел выносится в отдельный объект, после конца возвращается', async () => {
		const onModelReady = vi.fn()
		const { registry, loop } = eight({ onModelReady })
		const handle = registry.getHandle('n4')!
		const done = handle.play('pulse')
		expect(bodyHolds(registry, 'n4')).toBe(true)
		expect(hiddenAt(registry, 4)).toBe(true)
		runFrames(loop, 4)
		await done
		expect(bodyHolds(registry, 'n4')).toBe(false)
		expect(hiddenAt(registry, 4)).toBe(false)
		expect(onModelReady).toHaveBeenCalledTimes(8)
	})

	it('isDragging выносит узел, после сброса возвращает', () => {
		const { registry } = eight()
		const handle = registry.getHandle('n1')!
		handle.setState({ isDragging: true })
		expect(bodyHolds(registry, 'n1')).toBe(true)
		handle.setState({ isDragging: false })
		expect(bodyHolds(registry, 'n1')).toBe(false)
		expect(hiddenAt(registry, 1)).toBe(false)
	})

	it('пока идёт перетаскивание, наведение не возвращает узел', () => {
		const { registry } = eight()
		const handle = registry.getHandle('n1')!
		handle.setState({ isDragging: true })
		handle.setState({ isHovered: true })
		expect(bodyHolds(registry, 'n1')).toBe(true)
	})

	it('setColor и setMaterial выносят узел, возврат после сброса', () => {
		const { registry } = eight()
		const handle = registry.getHandle('n2')!
		handle.setColor('#ff0000')
		expect(bodyHolds(registry, 'n2')).toBe(true)
		handle.setColor(null)
		expect(bodyHolds(registry, 'n2')).toBe(false)
		const own = { dispose: vi.fn() } as unknown as Material
		handle.setMaterial('body', own)
		expect(bodyHolds(registry, 'n2')).toBe(true)
		handle.setMaterial('body', null)
		expect(bodyHolds(registry, 'n2')).toBe(false)
		expect(own.dispose).not.toHaveBeenCalled()
	})

	it('пока идёт анимация, наведение узел не возвращает', () => {
		const { registry, loop } = eight()
		const handle = registry.getHandle('n0')!
		void handle.play('pulse', { repeat: 'loop' })
		handle.setState({ isHovered: true })
		expect(bodyHolds(registry, 'n0')).toBe(true)
		handle.stop()
		handle.clearState()
		runFrames(loop, 1)
		expect(bodyHolds(registry, 'n0')).toBe(false)
	})

	it('группа пересобирается, пока узел вынесен: вынесенный остаётся отдельным до конца анимации', () => {
		const { registry } = eight()
		const handle = registry.getHandle('n0')!
		void handle.play('pulse', { repeat: 'loop' })
		fill(registry, 1, 'extra')
		registry.commit()
		expect(bodyHolds(registry, 'n0')).toBe(true)
		expect(instanced(registry)[0].count).toBe(9)
		handle.stop()
	})

	it('setState с обычными полями не выносит узел', () => {
		const { registry } = eight()
		registry.getHandle('n3')!.setState({ isSelected: true })
		expect(bodyHolds(registry, 'n3')).toBe(false)
		expect(registry.getLook('n3')?.rings[0].id).toBe('select')
	})
})

describe('состояние, дескрипторы, тема, детали', () => {
	it('setState реестра неизвестному узлу — ничего', () => {
		const { registry } = createTestRegistry()
		expect(() => registry.setState('ghost', {} as never)).not.toThrow()
	})

	it('getHandle/getHandles; после пересборки — новый дескриптор', () => {
		const { registry } = createTestRegistry()
		fill(registry, 2)
		registry.commit()
		expect(registry.getHandles().map(handle => handle.id)).toEqual(['n0', 'n1'])
		const old = registry.getHandle('n0')!
		registry.update('n0', sel('n0'))
		registry.commit()
		expect(registry.getHandle('n0')).not.toBe(old)
	})

	it('onModelReady после пересборки вызывается снова', () => {
		const onModelReady = vi.fn()
		const { registry } = createTestRegistry({ onModelReady })
		registry.add('a', sel('a'))
		registry.commit()
		registry.update('a', sel('a'))
		registry.commit()
		expect(onModelReady).toHaveBeenCalledTimes(2)
	})

	it('дескриптор: id, object, preset, focus', () => {
		const onFocus = vi.fn()
		const { registry } = createTestRegistry({ onFocus, getModels: () => ({ g: { url: 'a.glb' } }) })
		registry.add('a', sel('a'))
		registry.commit()
		const handle = registry.getHandle('a')!
		expect(handle).toMatchObject({ id: 'a', preset: 'server' })
		handle.focus()
		expect(onFocus).toHaveBeenCalledWith('a')
		const none = createTestRegistry()
		none.registry.add('b', sel('b'))
		none.registry.commit()
		expect(() => none.registry.getHandle('b')!.focus()).not.toThrow()
	})

	it('setDetail скрывает lod-detail у узлов и экземпляров и возвращает', () => {
		const { registry } = createTestRegistry({ library: { ...MODEL3D_LIBRARY, laptop: boxModel() } })
		fill(registry, 8)
		registry.add('solo0', sel('solo0', { kindModel: 'laptop' }))
		registry.add('own', sel('own', { kindModel: 'shape' }))
		registry.commit()
		const detailMeshes = () => instanced(registry).filter(mesh => mesh.userData.isDetail)
		const solo = () => {
			const found: boolean[] = []
			registry.getHandle('solo0')!.object.traverse(item => item.name === 'lod-detail' && found.push(item.visible))
			return found
		}
		expect(detailMeshes()).toHaveLength(12)
		registry.setDetail(false)
		expect(detailMeshes().every(mesh => !mesh.visible)).toBe(true)
		expect(
			instanced(registry)
				.filter(mesh => !mesh.userData.isDetail)
				.every(mesh => mesh.visible),
		).toBe(true)
		registry.setDetail(true)
		expect(detailMeshes().every(mesh => mesh.visible)).toBe(true)
		expect(solo()).toEqual([true])
	})

	it('setDetail(false) до commit действует на новые сборки', () => {
		const { registry } = createTestRegistry({ library: { ...MODEL3D_LIBRARY, laptop: boxModel() } })
		fill(registry, 8)
		registry.add('solo0', sel('solo0', { kindModel: 'laptop' }))
		registry.setDetail(false)
		registry.commit()
		expect(
			instanced(registry)
				.filter(mesh => mesh.userData.isDetail)
				.every(mesh => !mesh.visible),
		).toBe(true)
		const states: boolean[] = []
		registry.getHandle('solo0')!.object.traverse(item => item.name === 'lod-detail' && states.push(item.visible))
		expect(states).toEqual([false])
	})

	it('setDetail скрывает деталь у отдельных узлов', () => {
		const { registry } = createTestRegistry({ library: { ...MODEL3D_LIBRARY, laptop: boxModel() } })
		registry.add('a', sel('a', { kindModel: 'laptop' }))
		registry.commit()
		const detail = registry.getHandle('a')!.object.getObjectByName('lod-detail')!
		registry.setDetail(false)
		expect(detail.visible).toBe(false)
	})

	it('refreshTheme перекрашивает общие материалы по теме', () => {
		let color = '#3366aa'
		const resolveColor = () => new Color(color)
		const { registry } = createTestRegistry({
			resolveColor,
			getPalette: () => resolveScenePalette(resolveColor),
			library: { ...MODEL3D_LIBRARY, laptop: boxModel() },
		})
		registry.add('a', sel('a', { kindModel: 'laptop' }))
		registry.commit()
		const material = meshOf(registry.getHandle('a')!.object).material as MeshStandardMaterial
		color = '#aa0000'
		registry.refreshTheme()
		expect(material.color.getHexString()).toBe('aa0000')
	})
})

describe('освобождение', () => {
	function spyAll(root: Group) {
		const geometries = new Set<BufferGeometry>()
		const materials = new Set<Material>()
		root.traverse(item => {
			const mesh = item as Mesh
			if (!mesh.isMesh) return
			geometries.add(mesh.geometry)
			;(Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(material => materials.add(material))
		})
		const spies = [...geometries, ...materials].map(item => vi.spyOn(item, 'dispose'))
		return { spies, count: geometries.size + materials.size }
	}

	it('dispose освобождает геометрии и материалы узлов и групп', () => {
		const { registry } = createTestRegistry()
		fill(registry, 8)
		fill(registry, 2, 'solo')
		registry.commit()
		const top = new Group()
		top.add(registry.object, registry.getHandle('solo0')!.object, registry.getHandle('solo1')!.object)
		const { spies, count } = spyAll(top)
		expect(count).toBeGreaterThan(0)
		registry.dispose()
		spies.forEach(spy => expect(spy).toHaveBeenCalled())
		expect(registry.getHandles()).toEqual([])
		expect(registry.object.children).toHaveLength(0)
	})

	it('dispose останавливает цикл анимаций', () => {
		const { registry, loop } = createTestRegistry()
		registry.add('a', sel('a'))
		registry.commit()
		void registry.getHandle('a')!.play('pulse', { repeat: 'loop' })
		expect(loop.tickers.size).toBe(1)
		registry.dispose()
		expect(loop.tickers.size).toBe(0)
		registry.dispose()
	})

	it('remove освобождает ресурсы узла, общие остаются, пока есть другие владельцы', () => {
		const { registry } = createTestRegistry()
		fill(registry, 2)
		registry.commit()
		const first = registry.getHandle('n0')!.object as Group
		const second = registry.getHandle('n1')!.object as Group
		const { spies } = spyAll(first)
		registry.remove('n0')
		spies.forEach(spy => expect(spy).not.toHaveBeenCalled())
		const last = spyAll(second)
		registry.remove('n1')
		last.spies.forEach(spy => expect(spy).toHaveBeenCalled())
	})

	it('dispose вызывает dispose экземпляра фабрики', () => {
		const dispose = vi.fn()
		const { registry } = createTestRegistry({
			getModels: () => ({ f: { create: () => ({ object: new Group(), dispose }) } }),
		})
		registry.add('a', { node: node('a', 'x'), model3d: { model: 'f' } })
		registry.commit()
		registry.dispose()
		expect(dispose).toHaveBeenCalledTimes(1)
	})
})
