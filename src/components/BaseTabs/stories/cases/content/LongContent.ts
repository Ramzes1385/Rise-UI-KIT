import { expect } from 'storybook/test'
import type meta from '../../BaseTabs.stories'
import BaseTabs from '../../../ui/BaseTabs.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TabItem } from '../../../types/BaseTabs.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const LONG_TABS: TabItem[] = [
	{ id: 'contract', label: 'Условия договора поставки оборудования' },
	{ id: 'schedule', label: 'График отгрузок по регионам' },
	{ id: 'documents', label: 'Сопроводительные документы' },
]

const models = { tab: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseTabs v-bind="args" v-model="tab" /></div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинные названия не переносятся: список прокручивается по горизонтали и не растягивает контейнер (здесь — 360px).',
			},
			source: storySource({ template, imports: ['BaseTabs'], models }),
		},
	},
	args: { items: LONG_TABS, modelValue: 'contract' },
	render: args => ({
		components: { BaseTabs },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas }) => {
		const list = canvas.getByRole('tablist')
		await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth)
		await expect(list.getBoundingClientRect().width).toBeLessThanOrEqual(360)
	},
}
