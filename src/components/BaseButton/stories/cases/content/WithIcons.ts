import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../../BaseButton.stories'
import BaseButton from '../../../ui/BaseButton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const WithIcons: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Иконки в слотах `left` и `right`. Кнопке только с иконкой нужен `aria-label` и квадратные отступы',
					'`:padding="{ x: 5, y: 5 }"` — тогда она квадратная 32 × 32.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseButton>',
					'  <template #left><BaseIcon name="plus" /></template>',
					'  Добавить',
					'</BaseButton>',
					'<BaseButton variant="outline">',
					'  Далее',
					'  <template #right><BaseIcon name="arrow-right" /></template>',
					'</BaseButton>',
					'<BaseButton variant="ghost" aria-label="Удалить" :padding="{ x: 5, y: 5 }">',
					'  <BaseIcon name="trash" />',
					'</BaseButton>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div class="story-row">
				<BaseButton v-bind="props">
					<template #left><BaseIcon name="plus" /></template>
					Добавить
				</BaseButton>
				<BaseButton v-bind="props" variant="outline">
					Далее
					<template #right><BaseIcon name="arrow-right" /></template>
				</BaseButton>
				<BaseButton v-bind="props" variant="ghost" aria-label="Удалить" :padding="{ x: 5, y: 5 }">
					<BaseIcon name="trash" />
				</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const iconButton = canvas.getByRole('button', { name: 'Удалить' })
		const { width, height } = iconButton.getBoundingClientRect()
		await expect(Math.round(width)).toBe(Math.round(height))
	},
}
