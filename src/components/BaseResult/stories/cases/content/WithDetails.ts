import { MESSAGES } from '../../shared'
import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../../BaseResult.stories'
import BaseResult from '../../../ui/BaseResult.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { isCopied: false }

const template = `
	<div class="story-medium">
		<BaseResult v-bind="args">
			<div class="story-row">
				<code>ERR_REPORT_TIMEOUT · 2026-03-12 09:41</code>
				<BaseButton variant="outline" :size-scale="87.5" @click="isCopied = true">
					<template #left><BaseIcon :name="isCopied ? 'check' : 'copy'" /></template>
					{{ isCopied ? 'Скопировано' : 'Скопировать код' }}
				</BaseButton>
			</div>
		</BaseResult>
	</div>
`

export const WithDetails: StoryObj<typeof meta> = {
	args: { status: 'error', title: MESSAGES.error.title, description: MESSAGES.error.description },
	parameters: {
		controls: { include: ['status', 'variant', 'sizeScale'] },
		docs: {
			description: {
				story: 'Слот по умолчанию: подробности под описанием — здесь код ошибки с кнопкой копирования. Кнопка после нажатия показывает «Скопировано».',
			},
			source: storySource({ template, imports: ['BaseResult', 'BaseButton', 'BaseIcon'], state }),
		},
	},
	render: args => ({
		components: { BaseResult, BaseButton, BaseIcon },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByText('ERR_REPORT_TIMEOUT · 2026-03-12 09:41')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Скопировать код' }))
		await expect(canvas.getByRole('button', { name: 'Скопировано' })).toBeVisible()
	},
}
