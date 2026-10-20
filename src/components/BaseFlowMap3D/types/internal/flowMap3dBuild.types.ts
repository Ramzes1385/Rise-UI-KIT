import type { ShallowRef } from 'vue'
import type { FlowMap3DBlend } from './flowMap3dMotion.types'
import type { Scene3DContext } from '@/scene3d/types/scene3d.types'
import type { Model3DDefinitions } from '@/scene3d/types/model3d.types'
import type { FlowMap3DContent, FlowMap3DEdgeItem } from './flowMap3dInternal.types'
import type { Model3DGltfLoader } from '@/scene3d/types/internal/model3dInternal.types'
import type { Scene3DResourceCache } from '@/scene3d/types/internal/scene3dInternal.types'

/** Точка на плане сцены: x и z в единицах сцены */
export interface FlowMap3DPlanPoint {
	x: number
	z: number
}

/** Путь частиц по связи: точки и накопленная длина */
export interface FlowMap3DTrack {
	points: FlowMap3DEdgeItem['points']
	lengths: number[]
	total: number
}

/** Точка, в которую выбирается положение частицы */
export interface FlowMap3DSpot {
	x: number
	y: number
	z: number
}

/** Части сцены, которыми делятся строитель и жизненный цикл */
export interface FlowMap3DSceneParts {
	content: ShallowRef<FlowMap3DContent | null>
	cache: Scene3DResourceCache
	gltf: Model3DGltfLoader
	appModels: Model3DDefinitions
	hooks: { context: () => Scene3DContext | null; start: () => void; stop: () => void }
	particles: { apply: () => void; stop: () => void }
	blend: FlowMap3DBlend
}

/** Конец связи: ярус, его высота и сдвиг назад */
export interface FlowMap3DEdgeEnd {
	tier: number
	y: number
	z: number
}

/** Основание верхней группы источника на плане, без сдвига яруса: по нему находится место, где лента сходит со стенки */
export interface FlowMap3DSlabRect {
	x0: number
	z0: number
	x1: number
	z1: number
}
