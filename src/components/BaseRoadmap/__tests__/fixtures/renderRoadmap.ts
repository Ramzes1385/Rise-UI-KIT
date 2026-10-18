import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { render } from '@testing-library/vue'
import BaseRoadmap from '../../ui/BaseRoadmap.vue'
import userEvent from '@testing-library/user-event'
import { SHELL_DATA, mockWidth } from './shellFixtures'
import type { BaseRoadmapProps } from '../../types/BaseRoadmap.types'

interface RenderOptions {
	width?: number
	props?: Partial<BaseRoadmapProps>
	slots?: Record<string, unknown>
}

export async function renderRoadmap({ width = 1200, props = {}, slots }: RenderOptions = {}) {
	mockWidth(width)
	const user = userEvent.setup()
	const view = render(BaseRoadmap, { props: { data: SHELL_DATA, layout: 'list', ...props }, slots } as never)
	await nextTick()
	return { user, ...view }
}
