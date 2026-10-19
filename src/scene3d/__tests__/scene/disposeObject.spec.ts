import { disposeMaterial, disposeObject } from '../../scene/disposeObject'
import { BatchedMesh, BoxGeometry, Group, InstancedMesh, Mesh, MeshBasicMaterial, Object3D, Texture } from 'three'

describe('disposeMaterial', () => {
	it('освобождает материал и его текстуры, чужие поля не трогает', () => {
		const map = new Texture()
		const material = new MeshBasicMaterial({ map })
		const mapDispose = vi.spyOn(map, 'dispose')
		const materialDispose = vi.spyOn(material, 'dispose')
		disposeMaterial(material)
		expect(mapDispose).toHaveBeenCalled()
		expect(materialDispose).toHaveBeenCalled()
	})
})

describe('disposeObject', () => {
	it('геометрии и материалы всего дерева (один общий материал — один раз), потом дерево очищено', () => {
		const shared = new MeshBasicMaterial()
		const [a, b] = [new Mesh(new BoxGeometry(), shared), new Mesh(new BoxGeometry(), shared)]
		const arrayed = new Mesh(new BoxGeometry(), [new MeshBasicMaterial(), new MeshBasicMaterial()])
		const root = new Group()
		root.add(a, new Group().add(b), arrayed, new Object3D())
		const sharedDispose = vi.spyOn(shared, 'dispose')
		const geometryDispose = vi.spyOn(a.geometry, 'dispose')
		const arrayDispose = (arrayed.material as MeshBasicMaterial[]).map(material => vi.spyOn(material, 'dispose'))
		disposeObject(root)
		expect(sharedDispose).toHaveBeenCalledTimes(1)
		expect(geometryDispose).toHaveBeenCalled()
		arrayDispose.forEach(spy => expect(spy).toHaveBeenCalled())
		expect(root.children).toHaveLength(0)
	})

	it('InstancedMesh освобождает буферы экземпляров', () => {
		const mesh = new InstancedMesh(new BoxGeometry(), new MeshBasicMaterial(), 3)
		const dispose = vi.spyOn(mesh, 'dispose')
		disposeObject(new Group().add(mesh))
		expect(dispose).toHaveBeenCalled()
	})

	it('BatchedMesh освобождает буферы частей', () => {
		const mesh = new BatchedMesh(2, 8, 8, new MeshBasicMaterial())
		const dispose = vi.spyOn(mesh, 'dispose')
		disposeObject(new Group().add(mesh))
		expect(dispose).toHaveBeenCalled()
	})

	it('обычный меш dispose самого меша не вызывает; пустой корень не падает', () => {
		expect(() => disposeObject(new Object3D())).not.toThrow()
		const plain = new Mesh(new BoxGeometry(), new MeshBasicMaterial())
		expect(() => disposeObject(plain)).not.toThrow()
	})
})
