import { docsFrame } from '../shared'
import type meta from '../BaseSelect.stories'
import BaseSelect from '../../ui/BaseSelect.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { screen, waitFor, expect } from 'storybook/test'

export const Empty: StoryObj<typeof meta> = {
	args: { options: [], label: 'Склад', placeholder: 'Выберите склад' },
	parameters: {
		docs: {
			...docsFrame(200),
			description: { story: 'Пустой список: вместо опций — текст из слота `empty` (по умолчанию «Ничего не найдено»).' },
		},
	},
	render: args => ({
		components: { BaseSelect },
		setup: () => ({ props: useArgsWithoutSlots(args, ['onUpdate:modelValue']) }),
		template: `
			<div class="story-narrow">
				<BaseSelect v-bind="props">
					<template #empty>Складов пока нет — добавьте первый в настройках</template>
				</BaseSelect>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('combobox', { name: 'Склад' }))
		const empty = await screen.findByText('Складов пока нет — добавьте первый в настройках')
		await waitFor(() => expect(empty).toBeVisible())
		await expect(screen.queryAllByRole('option')).toHaveLength(0)
	},
}
