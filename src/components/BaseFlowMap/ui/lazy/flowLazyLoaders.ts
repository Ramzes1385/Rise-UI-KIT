export const loadEditPalette = () => import('../edit/FlowEditPalette.vue')
export const loadEditToolbar = () => import('../edit/FlowEditToolbar.vue')
export const loadEditStatus = () => import('../edit/FlowEditStatus.vue')
export const loadEditOverlay = () => import('../edit/FlowEditOverlay.vue')
export const loadEditInspector = () => import('../edit/FlowEditInspector.vue')
export const loadEditLayer = () => import('../edit/FlowEditLayer.vue')
export const loadReviewPanel = () => import('../review/FlowReviewPanel.vue')
export const loadReviewOverlay = () => import('../review/FlowReviewOverlay.vue')
export const loadReviewLayer = () => import('../review/FlowReviewLayer.vue')
export const loadScenarioPanel = () => import('../scenario/FlowScenarioPanel.vue')
export const loadScenarioLayer = () => import('../scenario/FlowScenarioLayer.vue')
export const loadSearch = () => import('../chrome/FlowSearch.vue')
export const loadDetails = () => import('../panels/FlowDetails.vue')

export const loadEditUi = () =>
	Promise.all([loadEditPalette, loadEditToolbar, loadEditStatus, loadEditOverlay, loadEditInspector, loadEditLayer].map(load => load()))

export const loadReviewUi = () => Promise.all([loadReviewPanel, loadReviewOverlay, loadReviewLayer].map(load => load()))

export const loadScenarioUi = () => Promise.all([loadScenarioPanel, loadScenarioLayer].map(load => load()))
