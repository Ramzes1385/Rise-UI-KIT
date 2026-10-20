import { defineAsyncComponent } from 'vue'

const loadEditPalette = () => import('../edit/FlowEditPalette.vue')
const loadEditToolbar = () => import('../edit/FlowEditToolbar.vue')
const loadEditStatus = () => import('../edit/FlowEditStatus.vue')
const loadEditOverlay = () => import('../edit/FlowEditOverlay.vue')
const loadEditInspector = () => import('../edit/FlowEditInspector.vue')
const loadEditLayer = () => import('../edit/FlowEditLayer.vue')
const loadReviewPanel = () => import('../review/FlowReviewPanel.vue')
const loadReviewOverlay = () => import('../review/FlowReviewOverlay.vue')
const loadReviewLayer = () => import('../review/FlowReviewLayer.vue')

export const loadEditUi = () =>
	Promise.all([loadEditPalette, loadEditToolbar, loadEditStatus, loadEditOverlay, loadEditInspector, loadEditLayer].map(load => load()))

export const loadReviewUi = () => Promise.all([loadReviewPanel, loadReviewOverlay, loadReviewLayer].map(load => load()))

export const FlowEditPalette = defineAsyncComponent(loadEditPalette)
export const FlowEditToolbar = defineAsyncComponent(loadEditToolbar)
export const FlowEditStatus = defineAsyncComponent(loadEditStatus)
export const FlowEditOverlay = defineAsyncComponent(loadEditOverlay)
export const FlowEditInspector = defineAsyncComponent(loadEditInspector)
export const FlowEditLayer = defineAsyncComponent(loadEditLayer)
export const FlowReviewPanel = defineAsyncComponent(loadReviewPanel)
export const FlowReviewOverlay = defineAsyncComponent(loadReviewOverlay)
export const FlowReviewLayer = defineAsyncComponent(loadReviewLayer)
