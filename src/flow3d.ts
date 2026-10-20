/** Вход `@ramzes1385/rise-ui-kit/flow3d`: 3D-карта потоков на three.js (optional peer dependency); основной вход three не тянет. */
export * from './components/BaseFlowMap3D'
export { createScene3DModels, defineModel3D } from './scene3d/models/useModels3D'
export { MODEL3D_PRESETS } from './scene3d/models/presets'
export { MODEL3D_ANIMATIONS, MODEL3D_PARTS, MODEL3D_PRESET_IDS, MODEL3D_SETS, MODEL3D_TONES } from './scene3d/types/model3d.types'
export { SCENE_3D_CAMERA_PRESETS, SCENE_3D_FALLBACK_REASONS } from './scene3d/types/scene3d.types'
export type {
	Model3DAnimation,
	Model3DContext,
	Model3DDefinition,
	Model3DDefinitions,
	Model3DFactoryDefinition,
	Model3DGltfDefinition,
	Model3DHandle,
	Model3DInstance,
	Model3DNode,
	Model3DPart,
	Model3DPresetDefinition,
	Model3DPresetInfo,
	Model3DPresetId,
	Model3DSet,
	Model3DState,
	Model3DTone,
} from './scene3d/types/model3d.types'
export type {
	Scene3DCameraPreset,
	Scene3DContext,
	Scene3DFallbackReason,
	Scene3DHookProps,
	Scene3DRenderer,
	Scene3DRendererFactory,
} from './scene3d/types/scene3d.types'
