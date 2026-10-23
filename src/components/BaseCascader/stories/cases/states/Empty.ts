import { docsFrame } from '../../shared'
import type meta from '../../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCascader from '../../../ui/BaseCascader.vue'
import { expect, screen, waitFor } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow">
		<BaseCascader v-bind="args">
			<template #empty>Зон доставки пока нет — добавьте первую в настройках</template>
		</BaseCascader>
	</div>
`

export const Empty: StoryObj<typeof meta> = {
	args: { items: [] },
	parameters: {
		docs: {
			...docsFrame(240),
			description: { story: 'Нет узлов: в колонке — текст из слота `empty` (по умолчанию «Нет данных»).' },
			source: storySource({ template, imports: ['BaseCascader'], omit: ['onUpdate:modelValue'] }),
		},
	},
	render: args => ({
		components: { BaseCascader },
		setup: useStorySetup(args, { slots: ['onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('combobox', { name: 'Район доставки' }))
		const empty = await screen.findByText('Зон доставки пока нет — добавьте первую в настройках')
		await waitFor(() => expect(empty).toBeVisible())
		await expect(screen.queryAllByRole('option')).toHaveLength(0)
	},
}
