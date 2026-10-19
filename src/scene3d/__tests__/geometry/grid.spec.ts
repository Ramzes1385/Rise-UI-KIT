import { Color, Mesh, ShaderMaterial } from 'three'
import { createGridMaterial, createGridMesh } from '../../geometry/grid'

describe('сетка земли', () => {
	it('материал: копия цвета, затухание по умолчанию и своё', () => {
		const color = new Color('#336699')
		const material = createGridMaterial(color)
		expect(material.uniforms.uColor.value).not.toBe(color)
		expect(material.uniforms.uColor.value.getHex()).toBe(color.getHex())
		expect(material.uniforms.uFade.value.toArray()).toEqual([12, 30])
		expect(material.uniforms.uOpacity.value).toBe(1)
		expect([material.transparent, material.depthWrite]).toEqual([true, false])
		expect(createGridMaterial(color, [1, 2]).uniforms.uFade.value.toArray()).toEqual([1, 2])
	})

	it('меш: плоскость лежит на земле чуть ниже нуля, размер по умолчанию и свой', () => {
		const material = new ShaderMaterial()
		const mesh = createGridMesh(material)
		expect(mesh).toBeInstanceOf(Mesh)
		expect(mesh.material).toBe(material)
		expect(mesh.position.y).toBeLessThan(0)
		mesh.geometry.computeBoundingBox()
		const box = mesh.geometry.boundingBox
		expect(box?.max.x).toBe(40)
		expect(box?.max.y).toBeCloseTo(0)
		expect(box?.max.z).toBe(40)
		const small = createGridMesh(material, 10)
		small.geometry.computeBoundingBox()
		expect(small.geometry.boundingBox?.max.x).toBe(5)
	})
})
