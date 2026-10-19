import { Group } from 'three'
import type { Intersection, Object3D } from 'three'
import { hitNodeId, PICK_BATCH_IDS_KEY, PICK_ID_KEY, PICK_INSTANCE_IDS_KEY, pickNodeId } from '../../input/raycast'
import { BoxGeometry, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, OrthographicCamera, Raycaster, Vector2 } from 'three'

const hit = (object: Object3D, extra: Partial<Intersection> = {}) =>
	({ object, distance: 1, point: object.position, ...extra }) as Intersection

function box(id: string | null, z = 0) {
	const mesh = new Mesh(new BoxGeometry(2, 2, 2), new MeshBasicMaterial())
	mesh.position.z = z
	if (id) mesh.userData[PICK_ID_KEY] = id
	mesh.updateMatrixWorld()
	return mesh
}

function camera() {
	const view = new OrthographicCamera(-5, 5, 5, -5, 0.1, 100)
	view.position.set(0, 0, 20)
	view.lookAt(0, 0, 0)
	view.updateMatrixWorld()
	return view
}

const CENTER = new Vector2(0, 0)

describe('hitNodeId', () => {
	it('id владельца: свой или ближайший вверх по дереву', () => {
		const group = new Group()
		group.userData[PICK_ID_KEY] = 'node'
		const mesh = new Mesh()
		const nested = new Group().add(mesh)
		group.add(nested)
		expect(hitNodeId(hit(mesh))).toBe('node')
		mesh.userData[PICK_ID_KEY] = 'own'
		expect(hitNodeId(hit(mesh))).toBe('own')
	})

	it('нет id у цепочки или id не строка — null', () => {
		expect(hitNodeId(hit(new Mesh()))).toBeNull()
		const mesh = new Mesh()
		mesh.userData[PICK_ID_KEY] = 5
		expect(hitNodeId(hit(mesh))).toBeNull()
	})

	it('instanceId берёт id по номеру экземпляра, не по владельцу', () => {
		const mesh = new Mesh()
		mesh.userData[PICK_ID_KEY] = 'owner'
		mesh.userData[PICK_INSTANCE_IDS_KEY] = ['a', 'b']
		expect(hitNodeId(hit(mesh, { instanceId: 1 }))).toBe('b')
		expect(hitNodeId(hit(mesh, { instanceId: 0 }))).toBe('a')
		expect(hitNodeId(hit(mesh, { instanceId: 7 }))).toBeNull()
		expect(hitNodeId(hit(new Mesh(), { instanceId: 0 }))).toBeNull()
	})

	it('batchId берёт id по номеру части', () => {
		const mesh = new Mesh()
		mesh.userData[PICK_BATCH_IDS_KEY] = ['x', 'y']
		expect(hitNodeId(hit(mesh, { batchId: 1 }))).toBe('y')
		expect(hitNodeId(hit(new Mesh(), { batchId: 0 }))).toBeNull()
	})
})

describe('pickNodeId', () => {
	it('ближайший объект с id под центром экрана', () => {
		const root = new Group().add(box('far', -5), box('near', 2))
		expect(pickNodeId(root, { camera: camera(), ndc: CENTER })).toBe('near')
	})

	it('мимо — null', () => {
		const root = new Group().add(box('a'))
		expect(pickNodeId(root, { camera: camera(), ndc: new Vector2(0.9, 0.9) })).toBeNull()
	})

	it('скрытые узлы и узлы без id пропускаются, луч идёт дальше', () => {
		const hidden = box('hidden', 6)
		hidden.visible = false
		const root = new Group().add(hidden, box(null, 3), box('back', -2))
		expect(pickNodeId(root, { camera: camera(), ndc: CENTER })).toBe('back')
	})

	it('InstancedMesh: id по экземпляру', () => {
		const mesh = new InstancedMesh(new BoxGeometry(2, 2, 2), new MeshBasicMaterial(), 2)
		mesh.setMatrixAt(0, new Matrix4().makeTranslation(-3, 0, 0))
		mesh.setMatrixAt(1, new Matrix4().makeTranslation(3, 0, 0))
		mesh.userData[PICK_INSTANCE_IDS_KEY] = ['left', 'right']
		mesh.updateMatrixWorld()
		const root = new Group().add(mesh)
		expect(pickNodeId(root, { camera: camera(), ndc: new Vector2(0.6, 0) })).toBe('right')
		expect(pickNodeId(root, { camera: camera(), ndc: new Vector2(-0.6, 0) })).toBe('left')
	})

	it('свой Raycaster используется', () => {
		const raycaster = new Raycaster()
		const spy = vi.spyOn(raycaster, 'setFromCamera')
		pickNodeId(new Group(), { camera: camera(), ndc: CENTER }, raycaster)
		expect(spy).toHaveBeenCalledOnce()
	})
})
