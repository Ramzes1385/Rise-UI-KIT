import type { BaseFlowMapProps } from '../types/BaseFlowMap.types'
import { REVIEW_AUTHORS, REVIEW_CURRENT, REVIEW_SUGGESTIONS, REVIEW_THREADS, REVIEW_VERSIONS } from './fixtures/review'

export const reviewModels = { data: 'data', suggestions: 'suggestions', comments: 'comments' }

export const reviewTemplate = `
	<BaseFlowMap v-bind="args" v-model:data="data" v-model:suggestions="suggestions" v-model:comments="comments" />
`

export const reviewArgs: Partial<BaseFlowMapProps> = {
	data: REVIEW_CURRENT,
	mode: 'review',
	modes: ['view', 'review'],
	suggestions: REVIEW_SUGGESTIONS,
	comments: REVIEW_THREADS,
	versions: REVIEW_VERSIONS,
	currentUser: REVIEW_AUTHORS.maria,
	height: '720px',
	particles: false,
}
