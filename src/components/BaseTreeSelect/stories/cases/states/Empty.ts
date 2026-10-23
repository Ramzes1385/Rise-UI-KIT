import { docsFrame } from '../../shared'
import type meta from '../../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import BaseTreeSelect from '../../../ui/BaseTreeSelect.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow">
		<BaseTreeSelect v-bind="args">
			<template #empty>Регионов пока нет — добавьте первый в настройках доставки</template>
		</BaseTreeSelect>
	</div>
`

export const Empty: StoryObj<typeof meta> = {
	args: { items: [], label: 'Регион', placeholder: 'Выберите регион' },
	parameters: {
		docs: {
			...docsFrame(200),
			description: { story: 'Нет узлов: вместо дерева — текст из слота `empty` (по умолчанию «Нет данных»).' },
			source: storySource({ template, imports: ['BaseTreeSelect'], omit: ['onUpdate:modelValue'] }),
		},
	},
	render: args => ({
		components: { BaseTreeSelect },
		setup: useStorySetup(args, { slots: ['onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('combobox', { name: 'Регион' }))
		const empty = await screen.findByText('Регионов пока нет — добавьте первый в настройках доставки')
		await waitFor(() => expect(empty).toBeVisible())
		await expect(screen.queryAllByRole('treeitem')).toHaveLength(0)
	},
}
