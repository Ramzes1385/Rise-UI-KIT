import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../../BaseButton.stories'
import BaseButton from '../../../ui/BaseButton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row">
		<BaseButton v-bind="args">
			<template #left><BaseIcon name="plus" /></template>
			Добавить
		</BaseButton>
		<BaseButton v-bind="args" variant="outline">
			Далее
			<template #right><BaseIcon name="arrow-right" /></template>
		</BaseButton>
		<BaseButton v-bind="args" variant="ghost" aria-label="Удалить" :padding="{ x: 5, y: 5 }">
			<BaseIcon name="trash" />
		</BaseButton>
	</div>
`

export const WithIcons: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Иконки в слотах `left` и `right`. Кнопке только с иконкой нужен `aria-label` и квадратные отступы',
					'`:padding="{ x: 5, y: 5 }"` — тогда она квадратная 32 × 32.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseButton', 'BaseIcon'] }),
		},
	},
	render: args => ({
		components: { BaseButton, BaseIcon },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const iconButton = canvas.getByRole('button', { name: 'Удалить' })
		const { width, height } = iconButton.getBoundingClientRect()
		await expect(Math.round(width)).toBe(Math.round(height))
	},
}
