import { miniRoadmap } from '../../demo/mini'
import { expect, waitFor } from 'storybook/test'
import { reviewData, reviewProgress } from '../../demo/review'
import type { RoadmapMode } from '../../../types/BaseRoadmap.types'

export const reviewModels = { data: 'data', mode: 'mode', review: 'review' }

export const reviewTypes = { data: 'RoadmapData', mode: 'RoadmapMode', review: 'RoadmapReviewData' }

export const reviewImports = ['BaseRoadmap', 'type RoadmapData', 'type RoadmapMode', 'type RoadmapReviewData']

export const reviewModes: RoadmapMode[] = ['view', 'edit', 'review']

export const reviewTemplate = `
	<BaseRoadmap
		v-bind="args"
		v-model:data="data"
		v-model:mode="mode"
		v-model:review="review" />
`

export const narrowReviewTemplate = `
	<div style="width: 375px; max-width: 100%">
		<BaseRoadmap
			v-bind="args"
			v-model:data="data"
			v-model:mode="mode"
			v-model:review="review" />
	</div>
`

export const reviewArgs = {
	data: miniRoadmap,
	mode: 'review' as RoadmapMode,
	modes: reviewModes,
	review: reviewData,
	progress: reviewProgress,
	expanded: ['basics', 'app'],
	selected: undefined,
}

export const reviewControls = { include: ['mode', 'modes', 'isDisabled', 'sizeScale'] }

export function proposalCard(canvasElement: HTMLElement, title: string): HTMLElement {
	const item = [...canvasElement.querySelectorAll<HTMLElement>('.base-roadmap__review-card')].find(card =>
		card.querySelector('.base-roadmap__review-card-title')?.textContent?.trim().startsWith(title),
	)
	if (!item) throw new Error(`Карточка «${title}» не найдена`)
	return item
}

export const expectTab = (tab: HTMLElement, text: string | RegExp): Promise<void> => waitFor(() => expect(tab).toHaveTextContent(text))
