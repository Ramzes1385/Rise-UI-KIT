import { sceneFrame } from '../../../model/camera/sceneFrame'
import { createViewCamera } from '@/scene3d/camera/cameraPose'
import { fitViewCamera } from '../../../model/camera/sceneFrame'
import { applyLayerMode } from '../../../model/scene/sceneState'
import { buildSceneContent } from '../../../model/scene/buildScene'
import { pickObjectId } from '../../../model/interaction/pickObject'
import type { ImageMap3DData } from '../../../types/imageMap3dData.types'
import { Box3, Color, OrthographicCamera, PerspectiveCamera, Vector2, Vector3 } from 'three'
import { boxAnchor, boxCenter, placeCard, projectPoint, toNdc } from '@/scene3d/overlay/projection'

const DATA: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: 'Этаж 1', width: 800, height: 400 },
		{ id: 'f2', title: 'Этаж 2', width: 800, height: 400, elevation: 300 },
	],
	objects: [
		{ id: 'hall', type: 'rect', title: 'Зал', x: 0.3, y: 0.3, width: 0.4, height: 0.4, layer: 'f1', height3d: 30 },
		{ id: 'roof', type: 'rect', title: 'Крыша', x: 0.3, y: 0.3, width: 0.4, height: 0.4, layer: 'f2' },
	],
}

function topDownCamera(): OrthographicCamera {
	const camera = new OrthographicCamera(-400, 400, 200, -200, 1, 5000)
	camera.position.set(400, 2000, 200)
	camera.up.set(0, 0, -1)
	camera.lookAt(400, 0, 200)
	camera.updateMatrixWorld()
	return camera
}

describe('BaseImageMap3D: выбор лучом и проекция', () => {
	it('луч из центра экрана попадает в объект активного этажа; другой этаж и пустое место — нет', () => {
		const content = buildSceneContent(DATA, () => new Color('#888888'))
		applyLayerMode(content, 'f1', 'stack')
		const camera = topDownCamera()
		expect(pickObjectId(content, { layerId: 'f1', camera, ndc: new Vector2(0, 0) })).toBe('hall')
		expect(pickObjectId(content, { layerId: 'f2', camera, ndc: new Vector2(0, 0) })).toBe('roof')
		expect(pickObjectId(content, { layerId: 'f1', camera, ndc: new Vector2(0.95, 0.95) })).toBeNull()
		expect(pickObjectId(content, { layerId: undefined, camera, ndc: new Vector2(0, 0) })).toBeNull()
		expect(pickObjectId(content, { layerId: 'nope', camera, ndc: new Vector2(0, 0) })).toBeNull()
	})

	it('скрытый меш и невидимый этаж не выбираются', () => {
		const content = buildSceneContent(DATA, () => new Color('#888888'))
		applyLayerMode(content, 'f1', 'single')
		const camera = topDownCamera()
		const hall = content.objects.get('hall')
		hall?.meshes.forEach(mesh => {
			mesh.visible = false
		})
		expect(pickObjectId(content, { layerId: 'f1', camera, ndc: new Vector2(0, 0) })).toBeNull()
		expect(pickObjectId(content, { layerId: 'f2', camera, ndc: new Vector2(0, 0) })).toBeNull()
	})

	it('изометрическая и перспективная камеры карты: центр сцены — в центре области', () => {
		;(['isometric', 'perspective'] as const).forEach(kind => {
			const camera = createViewCamera(kind)
			fitViewCamera(camera, { width: 800, height: 400 }, { frame: sceneFrame(DATA), mode: 'stack' })
			camera.position.set(400 + 600, 600, 200 + 600)
			camera.lookAt(400, 0, 200)
			const spot = projectPoint(new Vector3(400, 0, 200), camera, { width: 800, height: 400 })
			expect(spot.x).toBeCloseTo(400)
			expect(spot.y).toBeCloseTo(200)
			expect(spot.isVisible).toBe(true)
			expect(camera instanceof OrthographicCamera || camera instanceof PerspectiveCamera).toBe(true)
		})
	})

	it('точка за пределами области — не видна', () => {
		const camera = topDownCamera()
		expect(projectPoint(new Vector3(5000, 0, 200), camera, { width: 800, height: 400 }).isVisible).toBe(false)
	})

	it('якорь карточки — верх центра объекта; центр — середина', () => {
		const box = new Box3(new Vector3(0, 0, 0), new Vector3(10, 20, 30))
		expect(boxAnchor(box)).toEqual(new Vector3(5, 20, 15))
		expect(boxCenter(box)).toEqual(new Vector3(5, 10, 15))
	})

	it('экран → нормализованные координаты; пустой прямоугольник — null', () => {
		const rect = { left: 10, top: 20, width: 200, height: 100 } as DOMRect
		expect(toNdc(110, 70, rect)).toEqual(new Vector2(0, 0))
		expect(toNdc(10, 20, rect)).toEqual(new Vector2(-1, 1))
		expect(toNdc(0, 0, { left: 0, top: 0, width: 0, height: 0 } as DOMRect)).toBeNull()
	})

	it('карточка — над объектом; у верхнего края — под ним; не выходит за края', () => {
		const size = { width: 400, height: 300 }
		const card = { width: 200, height: 80 }
		expect(placeCard({ x: 200, y: 150, isVisible: true }, card, size)).toEqual({ left: 200, top: 138, isBelow: false })
		expect(placeCard({ x: 200, y: 40, isVisible: true }, card, size)).toEqual({ left: 200, top: 52, isBelow: true })
		expect(placeCard({ x: 10, y: 150, isVisible: true }, card, size).left).toBe(108)
		expect(placeCard({ x: 395, y: 150, isVisible: true }, card, size).left).toBe(292)
		expect(placeCard({ x: 50, y: 150, isVisible: true }, { width: 500, height: 80 }, size).left).toBe(258)
	})
})
