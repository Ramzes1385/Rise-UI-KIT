import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'
import { editArgs, editControls, editImports, editModels, editTemplate, editTypes, expectStatus } from './editShared'

export const Edit: StoryObj<typeof meta> = {
	parameters: {
		controls: editControls,
		docs: {
			description: {
				story: [
					'Режим «Правка» (мокап RoadmapEditor): `mode: "edit"` превращает путь в редактор. Сверху — инструменты: «Выбор» и «Связь»,',
					'«Этап», «Тема», «Развернуть все», «Свернуть», меню «Шаблоны», «Отменить», «Повторить» и «Опубликовать путь»;',
					'в середине — этапы столбцом карточек, темы строками под этапом; справа (на узком экране — снизу) панель свойств; внизу — подвал',
					'«Этапов · Тем · Изменений · Проверка».',
					'Каждое действие — один шаг истории (Ctrl+Z и Ctrl+Shift+Z), изменённый путь возвращает `v-model:data`, «Опубликовать путь» —',
					'событие `publish`. Переключатель «Просмотр | Правка | Правки» появляется, когда заданы `modes`; режим — `v-model:mode`.',
					'Столбец вместо серпантина мокапа — осознанное отступление (docs/design/VISUAL_CHANGES.md): порядок читается скринридером',
					'и одинаков в любой раскладке.',
				].join('\n'),
			},
			source: storySource({ template: editTemplate, imports: editImports, models: editModels, types: editTypes }),
		},
	},
	args: editArgs,
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { models: editModels, slots: [] }),
		template: editTemplate,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(await canvas.findByRole('toolbar', { name: 'Инструменты правки' })).toBeVisible()
		await expect(canvas.getByRole('region', { name: 'Путь обучения в режиме правки' })).toBeVisible()
		await expectStatus(canvasElement, /Этапов 2 Тем 5 Изменений 0/)
		await expect(canvas.getByText('Выберите этап или тему, чтобы изменить свойства')).toBeVisible()

		await userEvent.click(canvas.getByRole('button', { name: /^Реактивность/ }))
		const inspector = canvas.getByRole('complementary', { name: 'Свойства' })
		for (const tab of [/^Тема$/, /^Материалы/, /^Хуки/]) {
			await expect(await within(inspector).findByRole('tab', { name: tab })).toBeVisible()
		}
		const title = within(inspector).getByRole('textbox', { name: 'Название' })
		await expect(title).toHaveValue('Реактивность')

		await userEvent.type(title, ' 3')
		await expect(canvas.getByRole('button', { name: /^Реактивность 3/ })).toBeVisible()
		await expectStatus(canvasElement, /Изменений 1/)

		await userEvent.click(canvas.getByRole('button', { name: 'Отменить' }))
		await expectStatus(canvasElement, /Изменений 0/)
		await expect(canvas.getByRole('button', { name: /^Реактивность/ })).not.toHaveTextContent('Реактивность 3')

		const toolbar = canvas.getByRole('toolbar', { name: 'Инструменты правки' })
		await userEvent.click(within(toolbar).getByRole('button', { name: 'Тема' }))
		await expectStatus(canvasElement, /Тем 6 Изменений 1/)

		await userEvent.click(canvas.getByRole('button', { name: 'Готово' }))
		const modes = canvas.getByRole('radiogroup', { name: 'Режим' })
		await userEvent.click(within(modes).getByRole('radio', { name: 'Просмотр' }))
		await waitFor(() => expect(canvas.queryByRole('toolbar', { name: 'Инструменты правки' })).toBeNull())
		await expect(await canvas.findByText(/0 из 6 тем/)).toBeVisible()
		await userEvent.click(within(modes).getByRole('radio', { name: 'Правка' }))
		await expect(await canvas.findByRole('toolbar', { name: 'Инструменты правки' })).toBeVisible()
	},
}
