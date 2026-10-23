import { miniRoadmap } from '../../demo/mini'
import { expect, waitFor } from 'storybook/test'
import type { RoadmapMode } from '../../../types/BaseRoadmap.types'

export const editModels = { data: 'data', mode: 'mode' }

export const editTypes = { data: 'RoadmapData', mode: 'RoadmapMode' }

export const editImports = ['BaseRoadmap', 'type RoadmapData', 'type RoadmapMode']

export const editModes: RoadmapMode[] = ['view', 'edit', 'review']

export const editTemplate = `
	<BaseRoadmap
		v-bind="args"
		v-model:data="data"
		v-model:mode="mode" />
`

export const editArgs = {
	data: miniRoadmap,
	mode: 'edit' as RoadmapMode,
	modes: editModes,
	progress: undefined,
	expanded: undefined,
	selected: undefined,
}

export const editControls = { include: ['mode', 'modes', 'isDisabled', 'sizeScale'] }

const editStatus = (canvasElement: HTMLElement): HTMLElement => {
	const footer = canvasElement.querySelector<HTMLElement>('.base-roadmap__edit-status')
	if (!footer) throw new Error('Подвал правки не найден')
	return footer
}

export const visible = (find: () => HTMLElement): Promise<void> => waitFor(() => expect(find()).toBeVisible(), { timeout: 3000 })

export const expectStatus = (canvasElement: HTMLElement, text: RegExp): Promise<void> =>
	waitFor(() => expect((editStatus(canvasElement).textContent ?? '').replace(/(\d)(?=\p{Lu})/gu, '$1 ')).toMatch(text))

export const topicOrder = (canvasElement: HTMLElement): string[] =>
	[...canvasElement.querySelectorAll<HTMLElement>('[data-roadmap-topic]')].map(item => item.dataset.roadmapTopic as string)

export const stageOrder = (canvasElement: HTMLElement): string[] =>
	[...canvasElement.querySelectorAll<HTMLElement>('[data-roadmap-stage]')].map(item => item.dataset.roadmapStage as string)

export const editAnnouncement = (canvasElement: HTMLElement): string =>
	canvasElement.querySelector('.base-roadmap__edit > .base-roadmap__sr')?.textContent ?? ''
