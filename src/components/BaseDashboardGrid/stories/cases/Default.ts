import { expect } from 'storybook/test'
import type meta from '../BaseDashboardGrid.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDashboardGrid from '../../ui/BaseDashboardGrid.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { layout: 'layout' }

const template = `
	<BaseDashboardGrid v-bind="args" v-model:layout="layout">
		<template #item="{ item }">
			<strong>{{ item.label }}</strong>
			<p>{{ item.w }} × {{ item.h }}</p>
		</template>
	</BaseDashboardGrid>
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: меняйте раскладку, размер клетки, уплотнение и режим редактирования в панели Controls. Раскладка связана с `v-model:layout`.',
			},
			source: storySource({ template, imports: ['BaseDashboardGrid'], models }),
		},
	},
	render: args => ({
		components: { BaseDashboardGrid },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('group', { name: 'Сетка виджетов' })).toBeVisible()
		await expect(canvas.getByRole('group', { name: 'Выручка' })).toHaveTextContent('4 × 2')
		await expect(canvas.getByRole('group', { name: 'Динамика продаж' })).toHaveTextContent('8 × 3')
	},
}
