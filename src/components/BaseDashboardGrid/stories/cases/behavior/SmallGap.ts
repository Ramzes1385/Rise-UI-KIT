import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDashboardGrid.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseDashboardGrid from '../../../ui/BaseDashboardGrid.vue'

const models = { layout: 'layout' }

const template = `
	<BaseDashboardGrid v-bind="args" v-model:layout="layout">
		<template #item="{ item }">
			<strong>{{ item.label }}</strong>
			<p>{{ item.w + ' × ' + item.h }}</p>
		</template>
	</BaseDashboardGrid>
`

export const SmallGap: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	args: { isEditable: true, gap: 2 },
	parameters: {
		controls: { include: ['gap', 'rowHeight'] },
		docs: {
			description: {
				story: [
					'Малый зазор между виджетами (`gap` < 8px): область нажатия ручки остаётся не меньше 24px, но не заходит на содержимое.',
					'Ручка становится выше на недостающую часть и остаётся отдельной полосой над телом карточки, а не накладкой поверх него.',
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
	play: async ({ canvas, args }) => {
		const lower = canvas.getByRole('group', { name: 'Динамика продаж' })
		const handle = lower.querySelector('[data-handle]') as HTMLElement
		const body = lower.querySelector('.base-dashboard-grid__body') as HTMLElement
		const area = handle.getBoundingClientRect().height + parseFloat(getComputedStyle(handle, '::before').height)
		await expect(area).toBeGreaterThanOrEqual(24)
		await expect(getComputedStyle(handle, '::after').content).toBe('none')
		await expect(handle.getBoundingClientRect().bottom).toBeLessThanOrEqual(body.getBoundingClientRect().top + 0.5)
		await expect(args.gap).toBe(2)
	},
}
