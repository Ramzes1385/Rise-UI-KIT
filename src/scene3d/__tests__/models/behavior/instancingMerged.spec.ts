import { describe, expect, it, vi } from 'vitest'
import { createGroup, disposeGroup } from '../../../models/behavior/instancing'
import type { Model3DEntry } from '../../../types/internal/model3dInternal.types'
import type { Model3DBuildScope } from '../../../types/internal/model3dRuntime.types'
import { BoxGeometry, BufferGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'

const built = vi.hoisted(() => ({ instance: null as unknown }))

vi.mock('../../../models/runtime/modelBuild', async importOriginal => ({
	...(await importOriginal<typeof import('../../../models/runtime/modelBuild')>()),
	buildPreset: () => built.instance,
}))

const wall = new MeshBasicMaterial()
const glass = new MeshBasicMaterial()

function box(material: MeshBasicMaterial, size: number, x = 0): Mesh {
	const mesh = new Mesh(new BoxGeometry(size, size, size), material)
	mesh.position.x = x
	return mesh
}

function groupOf(isMerged: boolean, object: Group, parts?: Record<string, Group[]>) {
	built.instance = { object, parts, dispose: vi.fn() }
	const members = ['a', 'b'].map(id => ({ id, selection: { node: { id } } }) as unknown as Model3DEntry)
	const scope = { options: { isMergedInstancing: isMerged } } as unknown as Model3DBuildScope
	return { group: createGroup(scope, 'tower', members), members }
}

describe('createGroup: инстансинг моделей', () => {
	it('без слияния — по InstancedMesh на каждую часть, деталь определяется по имени предка', () => {
		const object = new Group()
		const detail = new Group()
		detail.name = 'lod-detail'
		detail.add(box(wall, 0.1))
		object.add(box(wall, 1), detail)
		const { group, members } = groupOf(false, object)
		expect(group.meshes).toHaveLength(2)
		expect(group.meshes.map(mesh => mesh.userData.isDetail)).toEqual([false, true])
		expect(group.ownedGeometries).toEqual([])
		expect(members.map(member => member.groupIndex)).toEqual([0, 1])
	})

	it('со слиянием — один InstancedMesh на материал и видимость детали, роли берутся у первой части', () => {
		const object = new Group()
		const base = new Group()
		const side = new Group()
		const tiny = box(wall, 0.05)
		const lone = new Mesh(new PlaneGeometry(1, 1).toNonIndexed(), glass)
		const first = box(wall, 1)
		const second = box(wall, 1, 2)
		base.add(first)
		side.add(second)
		object.add(base, side, tiny, lone)
		const { group } = groupOf(true, object, { frame: [base], body: [side] })
		expect(group.meshes).toHaveLength(3)
		expect(group.roles).toEqual(['frame', 'body', 'body'])
		expect(group.ownedGeometries).toHaveLength(3)
		expect(group.meshes.map(mesh => mesh.userData.isDetail)).toEqual([false, true, false])
		expect(group.locals).toHaveLength(3)
	})

	it('меш вне перечисленных частей получает роль body', () => {
		const object = new Group()
		const listed = box(wall, 1)
		const other = box(glass, 1)
		const holder = new Group()
		holder.add(listed)
		object.add(holder, other)
		const { group } = groupOf(true, object, { frame: [holder] })
		expect(group.roles).toEqual(['frame', 'body'])
	})

	it('геометрии не склеиваются — части остаются отдельными InstancedMesh', () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
		const object = new Group()
		const withUv = box(wall, 1)
		const withoutUv = new Mesh(new BufferGeometry().setAttribute('position', withUv.geometry.getAttribute('position')), wall)
		withoutUv.position.x = 2
		object.add(withUv, withoutUv)
		const { group } = groupOf(true, object)
		expect(group.meshes).toHaveLength(2)
		expect(group.ownedGeometries).toEqual([])
	})

	it('освобождение слитой группы удаляет и собственные геометрии', () => {
		const object = new Group()
		object.add(box(wall, 1), box(wall, 1, 2))
		const { group } = groupOf(true, object)
		const dispose = vi.spyOn(group.ownedGeometries[0], 'dispose')
		const release = vi.fn()
		disposeGroup(group, { bank: { release } } as never)
		expect(dispose).toHaveBeenCalledOnce()
		expect(release).toHaveBeenCalledWith(group)
	})
})
