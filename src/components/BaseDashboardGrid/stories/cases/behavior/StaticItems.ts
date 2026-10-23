import { expect } from 'storybook/test'
import { PINNED_LAYOUT } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDashboardGrid.stories'
import BaseDashboardGrid from '../../../ui/BaseDashboardGrid.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { layout: 'layout' }

const template = `
	<BaseDashboardGrid v-bind="args" v-model:layout="layout">
		<template #item="{ item }">
			<strong>{{ item.label }}</strong>
			<p>{{ item.isStatic ? 'Закреплён' : item.w + ' × ' + item.h }}</p>
		</template>
	</BaseDashboardGrid>
`

export const StaticItems: StoryObj<typeof meta> = {
	args: { layout: PINNED_LAYOUT, isEditable: true, rowHeight: 56 },
	parameters: {
		controls: { include: ['isEditable', 'compactType', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Закреплённый виджет (`isStatic: true`) нельзя ни переносить, ни растягивать, и он не получает фокус; остальные виджеты его обходят.',
					'Попробуйте поднять «Выручку» на место сводки: она встанет под ней.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseDashboardGrid'], models }),
		},
	},
	render: args => ({
		components: { BaseDashboardGrid },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const pinned = canvas.getByRole('group', { name: 'Сводка за месяц' })
		await expect(pinned).not.toHaveAttribute('tabindex')
		await expect(pinned).toHaveTextContent('Закреплён')

		const widget = canvas.getByRole('group', { name: 'Выручка' })
		await tabTo(widget, userEvent)
		await userEvent.keyboard('{Enter}{ArrowUp}')
		await expect(canvas.getByRole('status')).toHaveTextContent('«Выручка»: колонка 1, строка 2')
		await userEvent.keyboard('{Escape}')
	},
}
