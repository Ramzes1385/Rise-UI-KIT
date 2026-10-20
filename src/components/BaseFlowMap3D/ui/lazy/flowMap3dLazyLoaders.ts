export const loadEditToolbar = () => import('../parts/FlowMap3DToolbar.vue')
export const loadEditPalette = () => import('../parts/FlowModelPalette.vue')
export const loadEditInspector = () => import('../parts/FlowInspector3D.vue')
export const loadEditInspectorSlot = () => import('../parts/FlowInspector3DSlot.vue')

export const loadEditUi = () =>
	Promise.all([loadEditToolbar, loadEditPalette, loadEditInspector, loadEditInspectorSlot].map(load => load()))
