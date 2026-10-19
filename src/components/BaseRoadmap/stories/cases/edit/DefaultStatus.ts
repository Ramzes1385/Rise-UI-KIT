import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { expect, screen, waitFor, within } from 'storybook/test'
import type { RoadmapData } from '../../../types/roadmapData.types'
import { storySource, useStorySetup, STORY_WAIT_TIMEOUT } from '@/stories/helpers'
import { editControls, editImports, editModels, editModes, editTemplate, editTypes, expectStatus } from './editShared'

const statusRoadmap: RoadmapData = {
	version: 1,
	id: 'start',
	title: 'Старт разработчика',
	goal: 'Первая задача в команде',
	stages: [
		{
			id: 'tools',
			title: 'Инструменты',
			topics: [
				{ id: 'git', title: 'Git', description: 'Коммиты, ветки, слияния.', hours: 4, defaultStatus: 'done' },
				{
					id: 'editor',
					title: 'Редактор кода',
					description: 'Горячие клавиши и отладчик.',
					hours: 3,
					defaultStatus: 'in-progress',
				},
				{ id: 'terminal', title: 'Терминал', description: 'Оболочка и скрипты.', hours: 3, defaultStatus: 'skipped' },
				{ id: 'review', title: 'Код-ревью', description: 'Как читать чужие правки.', hours: 2, requires: ['git'] },
			],
		},
	],
}

export const DefaultStatus: StoryObj<typeof meta> = {
	parameters: {
		controls: editControls,
		docs: {
			description: {
				story: [
					'Поле темы `defaultStatus` — статус, с которого начинает ученик, пока у него нет своего в прогрессе. В «Правке» оно в панели',
					'свойств рядом с «Этап»: «Доступна» (поля нет), «В процессе», «Изучена», «Пропущена». Изменение — один шаг истории,',
					'«Отменить» возвращает прежнее значение.',
					'В просмотре статус работает как отметка ученика: «Git» уже изучена и открывает «Код-ревью», «Редактор кода» в процессе,',
					'«Терминал» пропущен. Свой статус ученика сильнее, а «закрыта» (не пройдены `requires`) сильнее всех.',
				].join('\n'),
			},
			source: storySource({ template: editTemplate, imports: editImports, models: editModels, types: editTypes }),
		},
	},
	args: { data: statusRoadmap, mode: 'view', modes: editModes, progress: undefined, expanded: ['tools'], selected: undefined },
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { models: editModels, slots: [] }),
		template: editTemplate,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(await canvas.findByRole('button', { name: /^Git/ })).toHaveAccessibleName(/изучена/)
		await expect(canvas.getByRole('button', { name: /^Редактор кода/ })).toHaveAccessibleName(/в процессе/)
		await expect(canvas.getByRole('button', { name: /^Терминал/ })).toHaveAccessibleName(/пропущена/)
		await expect(canvas.getByRole('button', { name: /^Код-ревью/ })).not.toHaveAccessibleName(/закрыта/)

		const modes = canvas.getByRole('radiogroup', { name: 'Режим' })
		await userEvent.click(within(modes).getByRole('radio', { name: 'Правка' }))
		await userEvent.click(await canvas.findByRole('button', { name: /^Терминал/ }))
		const select = await canvas.findByRole('combobox', { name: 'Статус по умолчанию' })
		await expect(select).toHaveTextContent('Пропущена')

		await userEvent.click(select)
		await userEvent.click(await screen.findByRole('option', { name: 'Изучена' }))
		await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Статус по умолчанию' })).toHaveTextContent('Изучена'), {
			timeout: STORY_WAIT_TIMEOUT,
		})
		await expectStatus(canvasElement, /Изменений 1/)

		await userEvent.click(canvas.getByRole('button', { name: 'Отменить' }))
		await expectStatus(canvasElement, /Изменений 0/)
		await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Статус по умолчанию' })).toHaveTextContent('Пропущена'))

		await userEvent.click(canvas.getByRole('combobox', { name: 'Статус по умолчанию' }))
		await userEvent.click(await screen.findByRole('option', { name: 'Доступна' }))
		await expectStatus(canvasElement, /Изменений 1/)
		await userEvent.click(canvas.getByRole('button', { name: 'Готово' }))
		await userEvent.click(within(canvas.getByRole('radiogroup', { name: 'Режим' })).getByRole('radio', { name: 'Просмотр' }))
		const terminal = await canvas.findByRole('button', { name: /^Терминал/ })
		await expect(terminal).toHaveAccessibleName(/доступна/)
		await expect(terminal).not.toHaveAccessibleName(/пропущена/)
	},
}
