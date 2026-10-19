import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { expect, screen, waitFor, within } from 'storybook/test'
import type { RoadmapTemplate } from '../../../types/roadmapEdit.types'
import { literal, storySource, useStorySetup, STORY_WAIT_TIMEOUT } from '@/stories/helpers'
import { editArgs, editControls, editImports, editModels, editTypes, expectStatus } from './editShared'

const templates: RoadmapTemplate[] = [
	{
		id: 'testing',
		title: 'Тестирование',
		subtitle: 'этап · 2 темы',
		stage: {
			title: 'Тестирование',
			topics: [
				{ id: 'component-tests', title: 'Компонентные тесты', hours: 5 },
				{ id: 'e2e-tests', title: 'E2E-тесты', hours: 6, kind: 'optional' },
			],
		},
	},
	{
		id: 'backend',
		title: 'Backend на Go',
		subtitle: '2 этапа',
		data: {
			version: 1,
			title: 'Backend на Go',
			stages: [
				{ id: 'go', title: 'Язык', topics: [{ id: 'syntax', title: 'Синтаксис', hours: 6 }] },
				{ id: 'http', title: 'Сервис', topics: [{ id: 'handlers', title: 'Обработчики', hours: 8 }] },
			],
		},
	},
]

const template = `
	<BaseRoadmap
		v-bind="args"
		v-model:data="data"
		v-model:mode="mode"
		:templates="templates" />
`

const script = `
const templates: RoadmapTemplate[] = ${literal(templates)}
`

export const Templates: StoryObj<typeof meta> = {
	parameters: {
		controls: editControls,
		docs: {
			description: {
				story: [
					'Меню «Шаблоны» («Начать с шаблона») вставляет готовые куски: встроенные — «Пустой путь», «Этап», «Тема», «Тема с подтемами»,',
					'«Развилка «или»»; свои приходят пропом `templates` (`stage`, `topic` или `data`) и идут после встроенных. Id в шаблоне',
					'необязательны — компонент выдаёт уникальные сам.',
					'Вставка шаблона — **один шаг истории**: «Отменить» убирает этап целиком. Шаблон с `data` заменяет весь путь, поэтому',
					'при непустом пути сначала спрашивает подтверждение (BaseConfirm); отмена подтверждения ничего не меняет.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [...editImports, 'type RoadmapTemplate'],
				models: editModels,
				types: editTypes,
				script,
			}),
		},
	},
	args: editArgs,
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { models: editModels, slots: [], data: { templates } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const toolbar = await canvas.findByRole('toolbar', { name: 'Инструменты правки' })
		const pick = async (name: RegExp): Promise<void> => {
			await userEvent.click(within(toolbar).getByRole('button', { name: 'Шаблоны' }))
			await userEvent.click(await screen.findByRole('menuitem', { name }))
		}
		await expectStatus(canvasElement, /Этапов 2 Тем 5 Изменений 0/)

		await pick(/^Развилка/)
		await expectStatus(canvasElement, /Этапов 3 Тем 7 Изменений 1/)
		await waitFor(() => expect(canvas.getByText('Вариант А')).toBeVisible())
		await waitFor(() => expect(canvas.getByText('Вариант Б')).toBeVisible())

		await pick(/^Тестирование/)
		await expectStatus(canvasElement, /Этапов 4 Тем 9 Изменений 2/)
		await waitFor(() => expect(canvas.getByText('Компонентные тесты')).toBeVisible())

		await userEvent.click(canvas.getByRole('button', { name: 'Отменить' }))
		await expectStatus(canvasElement, /Этапов 3 Тем 7 Изменений 1/)
		await expect(canvas.queryByText('Компонентные тесты')).toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await expectStatus(canvasElement, /Этапов 4 Тем 9 Изменений 2/)

		await pick(/^Backend на Go/)
		const dialog = await screen.findByRole('alertdialog', { name: 'Заменить путь шаблоном «Backend на Go»?' })
		await userEvent.click(within(dialog).getByRole('button', { name: 'Отмена' }))
		await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull(), { timeout: STORY_WAIT_TIMEOUT })
		await expectStatus(canvasElement, /Этапов 4 Тем 9 Изменений 2/)

		await pick(/^Backend на Go/)
		await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Заменить' }))
		await expectStatus(canvasElement, /Этапов 2 Тем 2 Изменений 3/)
		await waitFor(async () => expect(await canvas.findByText('Обработчики')).toBeVisible())
		await userEvent.click(canvas.getByRole('button', { name: 'Отменить' }))
		await expectStatus(canvasElement, /Этапов 4 Тем 9 Изменений 2/)
	},
}
