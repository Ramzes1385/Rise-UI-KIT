import { describe, expect, it, vi } from 'vitest'
import { MODEL3D_LIBRARY } from '../../../models/library'
import { countTriangles } from '../../../models/library/parts'
import { boxModel, makeScope, makeTarget } from '../modelsTestHelpers'
import { createModelContext } from '../../../models/runtime/modelContext'
import type { Model3DEntry } from '../../../types/internal/model3dInternal.types'
import { BoxGeometry, Color, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import {
	attachInstance,
	buildFactory,
	buildPreset,
	collectMeshes,
	findDetail,
	isSyncDefinition,
	toInstance,
} from '../../../models/runtime/modelBuild'

const mesh = () => new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial())

describe('buildPreset', () => {
	it('встроенная модель из библиотеки', () => {
		const warn = vi.fn()
		const scope = makeScope({ warn })
		const shape = buildPreset(scope, makeTarget('a'), 'shape')
		expect(shape.anchor?.y).toBeCloseTo(0.48)
		expect(warn).not.toHaveBeenCalled()
	})

	it('id таблицы, которого нет в библиотеке, — запасной server без warn', () => {
		const warn = vi.fn()
		// после волны 3а в библиотеке есть все id таблицы, поэтому её неполный вариант задаём явно
		const scope = { ...makeScope({ warn }), library: { server: MODEL3D_LIBRARY.server } }
		const instance = buildPreset(scope, makeTarget('a'), 'laptop')
		expect(instance.anchor).toEqual(new Vector3(0, 0.99, 0))
		expect(warn).not.toHaveBeenCalled()
	})

	it('неизвестный id — warn и server', () => {
		const warn = vi.fn()
		const instance = buildPreset(makeScope({ warn }), makeTarget('a'), 'ghost')
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('ghost')
		expect(countTriangles(instance.object)).toBeGreaterThan(0)
	})

	it('id из прототипа объекта — warn и server', () => {
		const warn = vi.fn()
		;['constructor', 'toString'].forEach(id => {
			const instance = buildPreset(makeScope({ warn }), makeTarget('a'), id)
			expect(instance.anchor).toEqual(new Vector3(0, 0.99, 0))
		})
		expect(warn).toHaveBeenCalledTimes(2)
		expect(warn.mock.calls[1][0]).toContain('toString')
	})

	it('без warn в опциях неизвестный id не падает', () => {
		expect(() => buildPreset(makeScope(), makeTarget('a'), 'ghost')).not.toThrow()
	})

	it('фабрика библиотеки получает узел и контекст', () => {
		const builder = vi.fn(boxModel())
		const scope = { ...makeScope(), library: { laptop: builder } }
		const target = makeTarget('a')
		buildPreset(scope, target, 'laptop')
		expect(builder).toHaveBeenCalledWith(target.node, expect.objectContaining({ size: scope.options.cell }))
	})
})

describe('buildFactory', () => {
	it('фабрика возвращает Model3DInstance', () => {
		const instance = { object: new Group(), anchor: new Vector3(0, 2, 0) }
		const create = vi.fn(() => instance)
		const result = buildFactory(makeScope(), makeTarget('a'), { create })
		expect(result).toBe(instance)
		expect(create).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }), expect.objectContaining({ seed: expect.any(Number) }))
	})

	it('«голый» Object3D красится целиком как body', () => {
		const object = new Group()
		object.add(mesh(), mesh())
		const result = buildFactory(makeScope(), makeTarget('a'), { create: () => object })
		expect(result).toEqual({ object })
		expect(collectMeshes(result).map(ref => ref.part)).toEqual(['body', 'body'])
	})

	it('исключение фабрики — warn и server', () => {
		const warn = vi.fn()
		const result = buildFactory(makeScope({ warn }), makeTarget('a', { modelId: 'boom' }), {
			create: () => {
				throw new Error('сломалась')
			},
		})
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('boom')
		expect(warn.mock.calls[0][0]).toContain('сломалась')
		expect(result.anchor).toEqual(new Vector3(0, 0.99, 0))
	})

	it('исключение без warn в опциях тоже не ломает сцену', () => {
		const result = buildFactory(makeScope(), makeTarget('a'), {
			create: () => {
				throw new Error('x')
			},
		})
		expect(result.object).toBeInstanceOf(Group)
	})
})

describe('collectMeshes, findDetail, toInstance, isSyncDefinition', () => {
	it('части задают роли, меши вне частей — part null, у первой части приоритет', () => {
		const object = new Group()
		const inner = new Group()
		const a = mesh()
		const b = mesh()
		const c = mesh()
		inner.add(a)
		object.add(inner, b, c)
		const refs = collectMeshes({ object, parts: { accent: [inner], body: [inner, b] } })
		const roleOf = (target: Mesh) => refs.find(ref => ref.mesh === target)?.part
		expect(roleOf(a)).toBe('accent')
		expect(roleOf(b)).toBe('body')
		expect(roleOf(c)).toBeNull()
		expect(refs[0].base).toBe(a.material)
	})

	it('части не заданы вовсе — всё body', () => {
		const object = new Group()
		object.add(mesh())
		expect(collectMeshes({ object })[0].part).toBe('body')
	})

	it('findDetail находит группы lod-detail на любой глубине', () => {
		const object = new Group()
		const deep = new Group()
		const detail = new Group()
		detail.name = 'lod-detail'
		deep.add(detail)
		object.add(deep)
		expect(findDetail(object)).toEqual([detail])
		expect(findDetail(new Group())).toEqual([])
	})

	it('toInstance: Object3D оборачивается, экземпляр остаётся как есть', () => {
		const object = new Group()
		const instance = { object }
		expect(toInstance(object)).toEqual({ object })
		expect(toInstance(instance)).toBe(instance)
	})

	it('isSyncDefinition: preset и create — да, url — нет', () => {
		expect(isSyncDefinition({ preset: 'db' })).toBe(true)
		expect(isSyncDefinition({ create: () => new Group() })).toBe(true)
		expect(isSyncDefinition({ url: 'a.glb' })).toBe(false)
	})

	it('attachInstance ставит корень, меши и детали в узел и применяет масштаб', () => {
		const object = new Group()
		const detail = new Group()
		detail.name = 'lod-detail'
		object.add(mesh(), detail)
		const body = new Group()
		const entry = { body, baseScale: 2, scale: 1.5, mode: 'pending' } as unknown as Model3DEntry
		attachInstance(entry, { object })
		expect(body.children).toEqual([object])
		expect(body.scale.x).toBe(3)
		expect(entry.mode).toBe('object')
		expect(entry.meshes).toHaveLength(1)
		expect(entry.detail).toEqual([detail])
	})
})

describe('createModelContext', () => {
	it('размер клетки — копия, а не ссылка', () => {
		const scope = makeScope()
		const context = createModelContext(scope, makeTarget())
		expect(context.size).toEqual(scope.options.cell)
		context.size.width = 99
		expect(scope.options.cell.width).toBe(1.6)
	})

	it('color отдаёт клон цвета', () => {
		const shared = new Color('#123456')
		const scope = makeScope({ resolveColor: () => shared })
		const context = createModelContext(scope, makeTarget())
		const color = context.color('red')
		expect(color).not.toBe(shared)
		expect(color.getHex()).toBe(shared.getHex())
	})

	it('seed детерминирован по id узла и seed опций', () => {
		const first = createModelContext(makeScope({ seed: 5 }), makeTarget('a')).seed
		expect(createModelContext(makeScope({ seed: 5 }), makeTarget('a')).seed).toBe(first)
		expect(createModelContext(makeScope({ seed: 5 }), makeTarget('b')).seed).not.toBe(first)
		expect(createModelContext(makeScope({ seed: 6 }), makeTarget('a')).seed).not.toBe(first)
		expect(createModelContext(makeScope(), makeTarget('a')).seed).toBe(createModelContext(makeScope({ seed: 0 }), makeTarget('a')).seed)
	})

	it('isReducedMotion берётся из опций, по умолчанию false', () => {
		expect(createModelContext(makeScope(), makeTarget()).isReducedMotion).toBe(false)
		expect(createModelContext(makeScope({ isReducedMotion: () => true }), makeTarget()).isReducedMotion).toBe(true)
	})

	it('material и geometry идут через банк и записывают ключи владельца', () => {
		const scope = makeScope()
		const target = makeTarget('a', { modelId: 'bell' })
		const context = createModelContext(scope, target)
		const material = context.material('accent')
		expect(context.material('accent')).toBe(material)
		expect(target.materialKeys.has('model:material:accent:bell')).toBe(true)
		const geometry = context.geometry('k', () => new BoxGeometry())
		expect(context.geometry('k', () => new BoxGeometry())).toBe(geometry)
		expect([...target.geometryKeys]).toEqual(['k'])
	})
})
