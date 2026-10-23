import { docsFrame } from '../../shared'
import type meta from '../../BaseSelect.stories'
import BaseSelect from '../../../ui/BaseSelect.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow">
		<BaseSelect v-bind="args">
			<template #empty>Складов пока нет — добавьте первый в настройках</template>
		</BaseSelect>
	</div>
`

export const Empty: StoryObj<typeof meta> = {
	args: { options: [], label: 'Склад', placeholder: 'Выберите склад' },
	parameters: {
		docs: {
			...docsFrame(200),
			description: { story: 'Пустой список: вместо опций — текст из слота `empty` (по умолчанию «Ничего не найдено»).' },
			source: storySource({ template, imports: ['BaseSelect'], omit: ['onUpdate:modelValue'] }),
		},
	},
	render: args => ({
		components: { BaseSelect },
		setup: useStorySetup(args, { slots: ['onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('combobox', { name: 'Склад' }))
		const empty = await screen.findByText('Складов пока нет — добавьте первый в настройках')
		await waitFor(() => expect(empty).toBeVisible())
		await expect(screen.queryAllByRole('option')).toHaveLength(0)
	},
}
