import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { expect, waitFor, within } from 'storybook/test'
import { expectStatus, visible } from '../edit/editShared'
import { storySource, useStorySetup } from '@/stories/helpers'
import {
	hookCard,
	hooksArgs,
	hooksControls,
	hooksImports,
	hooksModels,
	hooksScript,
	hooksSetup,
	hooksTemplate,
	hooksTypes,
	hooksVue,
	openHooksTab,
} from './hooksShared'

export const EditHooksDenied: StoryObj<typeof meta> = {
	parameters: {
		controls: hooksControls,
		docs: {
			description: {
				story: [
					'«Последний итог» появляется сразу после вызова хука. Здесь `beforeDelete` всегда отвечает `false`: «Удалить» у темы',
					'ничего не меняет, над путём появляется плашка «Правка отменена обработчиком приложения», а в карточке подписки —',
					'«Последний итог: отказ — удаление отменено». `beforeChange` при этом разрешает правки и показывает «разрешено».',
					'После отказа выбор темы снимается: чтобы увидеть итог, откройте тему снова. Выключите переключатель подписки — и удаление пройдёт (его можно отменить Ctrl+Z).',
				].join('\n'),
			},
			source: storySource({
				template: hooksTemplate,
				imports: hooksImports,
				models: hooksModels,
				types: hooksTypes,
				script: hooksScript,
				vue: hooksVue,
			}),
		},
	},
	args: hooksArgs,
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { models: hooksModels, slots: [], setup: hooksSetup }),
		template: hooksTemplate,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const { inspector } = await openHooksTab(canvas, userEvent, /^Шаблоны/)
		await visible(() => within(hookCard(inspector, 'keepTopics')).getByText('вызван 0'))

		await userEvent.click(within(inspector).getByRole('button', { name: 'Удалить' }))
		await waitFor(() =>
			expect(canvasElement.querySelector('.base-roadmap__edit-reject')).toHaveTextContent('Правка отменена обработчиком приложения'),
		)
		await expectStatus(canvasElement, /Тем 5 Изменений 0/)
		await visible(() => canvasElement.querySelector('[data-roadmap-topic="template"] .base-roadmap__edit-pick') as HTMLElement)

		const again = await openHooksTab(canvas, userEvent, /^Шаблоны/)
		await visible(() => within(hookCard(again.inspector, 'keepTopics')).getByText('вызван 1'))
		await visible(() => within(hookCard(again.inspector, 'keepTopics')).getByText('Последний итог: отказ — удаление отменено'))
		await expect(within(hookCard(again.inspector, 'guardChange')).queryByText(/Последний итог/)).toBeNull()

		await userEvent.click(within(again.inspector).getByRole('switch', { name: 'Включить обработчик «beforeDelete → keepTopics»' }))
		await userEvent.click(within(again.inspector).getByRole('button', { name: 'Удалить' }))
		await expectStatus(canvasElement, /Тем 4 Изменений 1/)
	},
}
