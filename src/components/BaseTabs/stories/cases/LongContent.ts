import { expect } from 'storybook/test'
import type meta from '../BaseTabs.stories'
import BaseTabs from '../../ui/BaseTabs.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TabItem } from '../../types/BaseTabs.types'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

const LONG_TABS: TabItem[] = [
	{ id: 'contract', label: 'Условия договора поставки оборудования' },
	{ id: 'schedule', label: 'График отгрузок по регионам' },
	{ id: 'documents', label: 'Сопроводительные документы' },
]

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинные названия не переносятся: список прокручивается по горизонтали и не растягивает контейнер (здесь — 360px).',
			},
		},
	},
	args: { items: LONG_TABS, modelValue: 'contract' },
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseTabs },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<div class="story-narrow"><BaseTabs v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvas }) => {
		const list = canvas.getByRole('tablist')
		await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth)
		await expect(list.getBoundingClientRect().width).toBeLessThanOrEqual(360)
	},
}
