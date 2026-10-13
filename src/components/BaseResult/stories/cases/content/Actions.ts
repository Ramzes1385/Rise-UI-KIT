import { expect } from 'storybook/test'
import type meta from '../../BaseResult.stories'
import BaseResult from '../../../ui/BaseResult.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { action: '' }

const template = `
	<div class="story-col story-medium">
		<BaseResult v-bind="args">
			<template #extra>
				<BaseButton @click="action = 'home'">На главную</BaseButton>
				<BaseButton variant="outline" @click="action = 'retry'">Повторить</BaseButton>
			</template>
		</BaseResult>
		<span class="story-label">Нажато: {{ action || 'ничего' }}</span>
	</div>
`

export const Actions: StoryObj<typeof meta> = {
	args: { status: '404', titleTag: 'h1', title: undefined, description: undefined },
	parameters: {
		controls: { include: ['status', 'variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Слот `extra`: кнопки действий под описанием и подробностями, на узком экране переносятся. Страница ошибки — заголовок `h1`.',
					'Под примером показано, какая кнопка нажата.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseResult', 'BaseButton'], state }),
		},
	},
	render: args => ({
		components: { BaseResult, BaseButton },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('heading', { level: 1, name: 'Страница не найдена' })).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await expect(canvas.getByText('Нажато: retry')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'На главную' }))
		await expect(canvas.getByText('Нажато: home')).toBeVisible()
	},
}
