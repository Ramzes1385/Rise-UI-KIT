import { expect } from 'storybook/test'
import type meta from '../../BaseAlert.stories'
import BaseAlert from '../../../ui/BaseAlert.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow"><BaseAlert v-bind="args" /></div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Длинный заголовок и описание переносятся по словам; иконка и кнопка закрытия остаются на месте.' },
			source: storySource({ template, imports: ['BaseAlert'] }),
		},
	},
	args: {
		type: 'error',
		variant: 'soft',
		isClosable: true,
		title: 'Не удалось синхронизировать 128 задач проекта «Ребрендинг» с календарём команды',
		description:
			'Календарь вернул ошибку доступа. Попросите администратора рабочего пространства выдать приложению право на запись, затем запустите синхронизацию ещё раз — уже перенесённые задачи не продублируются.',
	},
	render: args => ({
		components: { BaseAlert },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const alert = canvas.getByRole('alert')
		const close = canvas.getByRole('button', { name: 'Закрыть' })
		await expect(alert.getBoundingClientRect().width).toBeLessThanOrEqual(360)
		await expect(close.getBoundingClientRect().right).toBeLessThanOrEqual(alert.getBoundingClientRect().right)
		await expect(alert.scrollWidth).toBeLessThanOrEqual(alert.clientWidth)
	},
}
