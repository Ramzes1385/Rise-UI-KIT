import { createSceneLights } from '../../scene/lights'
import { Box3, DirectionalLight, HemisphereLight, Vector3 } from 'three'

describe('createSceneLights', () => {
	it('группа: ключевой свет с тенью, его цель и заполняющий полусферический', () => {
		const lights = createSceneLights(false)
		expect(lights.group.children).toEqual(expect.arrayContaining([lights.key, lights.key.target, lights.fill]))
		expect(lights.key).toBeInstanceOf(DirectionalLight)
		expect(lights.fill).toBeInstanceOf(HemisphereLight)
		expect(lights.key.castShadow).toBe(true)
		expect(lights.key.shadow.mapSize.x).toBe(1024)
	})

	it('светлая и тёмная предустановки переключаются setDark', () => {
		const lights = createSceneLights(false)
		const light = [
			lights.key.intensity,
			lights.fill.intensity,
			lights.fill.color.getHexString(),
			lights.fill.groundColor.getHexString(),
		]
		expect(light).toEqual([1.15, 0.9, 'ffffff', 'c9d1dc'])
		lights.setDark(true)
		expect([
			lights.key.intensity,
			lights.fill.intensity,
			lights.fill.color.getHexString(),
			lights.fill.groundColor.getHexString(),
		]).toEqual([0.8, 0.55, 'aebbd6', '1b2230'])
		lights.setDark(false)
		expect(lights.key.intensity).toBe(1.15)
		expect(createSceneLights(true).key.intensity).toBe(0.8)
	})

	it('fitShadow: камера тени накрывает границы, свет стоит над центром, цель — в центре', () => {
		const lights = createSceneLights(false)
		const bounds = new Box3(new Vector3(-6, 0, -8), new Vector3(6, 0, 8))
		lights.fitShadow(bounds)
		const radius = bounds.getSize(new Vector3()).length() / 2
		const camera = lights.key.shadow.camera
		expect([camera.left, camera.right, camera.top, camera.bottom]).toEqual([-radius, radius, radius, -radius])
		expect(camera.far).toBeCloseTo(radius * 6)
		expect(lights.key.target.position.toArray()).toEqual([0, 0, 0])
		expect(lights.key.position.length()).toBeCloseTo(radius * 3)
		expect(lights.key.position.y).toBeGreaterThan(0)
	})

	it('пустые границы: радиус тени не меньше 1', () => {
		const lights = createSceneLights(false)
		lights.fitShadow(new Box3(new Vector3(2, 0, 2), new Vector3(2, 0, 2)))
		expect(lights.key.shadow.camera.right).toBe(1)
		expect(lights.key.target.position.toArray()).toEqual([2, 0, 2])
	})

	it('dispose освобождает тень', () => {
		const lights = createSceneLights(false)
		const dispose = vi.spyOn(lights.key.shadow, 'dispose')
		lights.dispose()
		expect(dispose).toHaveBeenCalled()
	})
})
