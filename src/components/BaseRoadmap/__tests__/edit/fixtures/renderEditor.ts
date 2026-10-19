import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { editData } from './editFixtures'
import { screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { mockWidth } from '../../fixtures/shellFixtures'
import { renderRoadmap } from '../../fixtures/renderRoadmap'
import { UI_ROADMAP_EDIT, UI_ROADMAP_REVIEW } from '@/locales/messages'
import type { BaseRoadmapExpose, BaseRoadmapProps } from '../../../types/BaseRoadmap.types'

export const LOAD_TIMEOUT = 20_000

export async function renderEditor(props: Partial<BaseRoadmapProps> = {}, width = 1200) {
	const result = await renderRoadmap({ width, props: { data: editData(), mode: 'edit', ...props } })
	await screen.findByLabelText(UI_ROADMAP_EDIT.AREA_LABEL, {}, { timeout: LOAD_TIMEOUT })
	return result
}

export function liveText(): string {
	return screen
		.getAllByRole('status')
		.map(node => node.textContent ?? '')
		.join('|')
}

export async function mountEditor(props: Partial<BaseRoadmapProps> = {}, width = 1200) {
	mockWidth(width)
	const user = userEvent.setup()
	const wrapper = mount(BaseRoadmap, {
		props: { data: editData(), mode: 'edit', layout: 'list', ...props } as never,
		attachTo: document.body,
	})
	await screen.findByLabelText(UI_ROADMAP_EDIT.AREA_LABEL, {}, { timeout: LOAD_TIMEOUT })
	const api = wrapper.vm as unknown as BaseRoadmapExpose
	return { wrapper, user, api }
}

export async function mountReview(props: Partial<BaseRoadmapProps> = {}, width = 1200) {
	mockWidth(width)
	const user = userEvent.setup()
	const onData = vi.fn()
	const wrapper = mount(BaseRoadmap, {
		props: {
			data: editData(),
			mode: 'review',
			layout: 'list',
			expanded: ['s1', 's2', 's3'],
			'onUpdate:review': (value: BaseRoadmapProps['review']) => wrapper.setProps({ review: value }),
			'onUpdate:data': (value: BaseRoadmapProps['data']) => {
				onData(value)
				void wrapper.setProps({ data: value })
			},
			...props,
		} as never,
		attachTo: document.body,
	})
	await screen.findByRole('region', { name: UI_ROADMAP_REVIEW.PANEL }, { timeout: LOAD_TIMEOUT })
	return { wrapper, user, onData }
}
