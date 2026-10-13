import { expect } from 'storybook/test'
import type meta from '../../BaseResult.stories'
import BaseResult from '../../../ui/BaseResult.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow">
		<BaseResult v-bind="args">
			<code>ERR_CALENDAR_ACCESS_DENIED · рабочее пространство «Ребрендинг» · запрос 8f3a-21c9-77d0</code>
			<template #extra>
				<BaseButton>Запросить доступ у администратора рабочего пространства</BaseButton>
				<BaseButton variant="outline">Повторить синхронизацию</BaseButton>
			</template>
		</BaseResult>
	</div>
`

export const LongContent: StoryObj<typeof meta> = {
	args: {
		status: 'error',
		variant: 'outline',
		title: 'Не удалось синхронизировать 128 задач проекта «Ребрендинг» с календарём команды',
		description:
			'Календарь вернул ошибку доступа. Попросите администратора рабочего пространства выдать приложению право на запись, затем запустите синхронизацию ещё раз — уже перенесённые задачи не продублируются.',
	},
	parameters: {
		docs: {
			description: {
				story: 'Длинные заголовок, описание, подробности и подписи кнопок переносятся по словам и не выходят за карточку.',
			},
			source: storySource({ template, imports: ['BaseResult', 'BaseButton'] }),
		},
	},
	render: args => ({
		components: { BaseResult, BaseButton },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('.base-result') as HTMLElement
		await expect(root.getBoundingClientRect().width).toBeLessThanOrEqual(360)
		await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
	},
}
