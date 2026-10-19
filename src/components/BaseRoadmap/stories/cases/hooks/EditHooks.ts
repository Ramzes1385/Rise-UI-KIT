import { visible } from '../edit/editShared'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { expect, waitFor, within } from 'storybook/test'
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

export const EditHooks: StoryObj<typeof meta> = {
	parameters: {
		controls: hooksControls,
		docs: {
			description: {
				story: [
					'Вкладка «Хуки N» в панели свойств темы (мокап RoadmapEditor) — подписки на события пути; N — число включённых. Подписаться можно',
					'пропсами `before-change`, `before-delete`, `before-status-change` или методом `ref.on(...)`: здесь первые два — пропсами,',
					'`beforeStatusChange` — через `ref.on`. Карточка подписки: событие → имя обработчика, бейдж «отменяемый», переключатель,',
					'описание, «вызван N» и «Последний итог» после вызова. Выключенный обработчик пропускается, карточка приглушена.',
					'Подписки с именем на `Internal` (служебные) в списке скрыты.',
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
	play: async ({ canvas, userEvent }) => {
		const { inspector, tab } = await openHooksTab(canvas, userEvent, /^Реактивность/)
		await expect(tab).toHaveTextContent('Хуки 3')
		await visible(() => within(inspector).getByText('События пути → обработчики приложения'))
		for (const handler of ['guardChange', 'keepTopics', 'recordStatus']) {
			await visible(() => within(hookCard(inspector, handler)).getByText('отменяемый'))
			await visible(() => within(hookCard(inspector, handler)).getByText('вызван 0'))
		}
		await visible(() => within(hookCard(inspector, 'keepTopics')).getByText(/До удаления этапа или темы/))
		await expect(within(inspector).queryByText(/Последний итог/)).toBeNull()

		await userEvent.click(within(inspector).getByRole('tab', { name: 'Тема' }))
		await userEvent.type(within(inspector).getByRole('textbox', { name: 'Название' }), '!')
		await userEvent.click(within(inspector).getByRole('tab', { name: /^Хуки/ }))
		await waitFor(() => expect(within(hookCard(inspector, 'guardChange')).getByText('вызван 1')).toBeVisible())
		await visible(() => within(hookCard(inspector, 'guardChange')).getByText('Последний итог: разрешено'))

		const toggle = within(inspector).getByRole('switch', { name: 'Включить обработчик «beforeDelete → keepTopics»' })
		await expect(toggle).toBeChecked()
		await userEvent.click(toggle)
		await expect(toggle).not.toBeChecked()
		await expect(within(inspector).getByRole('tab', { name: /^Хуки/ })).toHaveTextContent('Хуки 2')
		await expect(hookCard(inspector, 'keepTopics')).toHaveClass('is-off')
		await userEvent.click(toggle)
		await expect(toggle).toBeChecked()
		await expect(within(inspector).getByRole('tab', { name: /^Хуки/ })).toHaveTextContent('Хуки 3')
	},
}
