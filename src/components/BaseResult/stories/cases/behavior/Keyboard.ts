import { expect } from 'storybook/test'
import type meta from '../../BaseResult.stories'
import BaseResult from '../../../ui/BaseResult.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { attempts: 0 }

const template = `
	<div class="story-col story-medium">
		<BaseResult v-bind="args">
			<template #extra>
				<BaseButton>На главную</BaseButton>
				<BaseButton variant="outline" @click="attempts += 1">Повторить</BaseButton>
			</template>
		</BaseResult>
		<span class="story-label">Попыток: {{ attempts }}</span>
	</div>
`

export const Keyboard: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	args: { status: '500', titleTag: 'h1' },
	parameters: {
		controls: { include: ['status', 'variant'] },
		docs: {
			description: {
				story: 'Клавиатура: Tab по порядку проходит кнопки слота `extra`, Enter нажимает «Повторить». Сам экран итога в порядок фокуса не входит.',
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
		const home = canvas.getByRole('button', { name: 'На главную' })
		const retry = canvas.getByRole('button', { name: 'Повторить' })
		await tabTo(home, userEvent)
		await expect(getComputedStyle(home).outlineStyle).toBe('solid')
		await userEvent.tab()
		await expect(retry).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByText('Попыток: 1')).toBeVisible()
	},
}
