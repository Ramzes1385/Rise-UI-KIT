import { tabTo } from '@/stories/helpers'
import { IMAGE_MAP_3D_PARTS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'
import { expect, waitFor, within } from 'storybook/test'

export const EditorParts3D: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`has3dFields` у объекта типа `svg`: «Части объекта» — список `parts` (Id элемента SVG, высота и основание над полом); без частей тело объекта строится по его элементу SVG.',
					'В «Сцене» добавлены «Скос кромок» (`bevel`, не меньше 0) и переключатель «Контур по рёбрам» (`outline`): умолчание — включён, в JSON хранится только выключенный.',
					'Проверка как в `validate3d` BaseImageMap3D: пустой Id элемента и число меньше 0 — ошибка под полем, JSON не меняется. Кнопки работают с клавиатуры (Tab, Enter, Space).',
				].join('\n'),
			},
		},
	},
	args: { modelValue: IMAGE_MAP_3D_PARTS, has3dFields: true, selected: 'f1-shop-1' },
	play: async ({ canvas, userEvent }) => {
		const parts = canvas.getByRole('group', { name: 'Части объекта' })
		await expect(within(parts).getByRole('group', { name: 'Часть 1: f1-shop-1' })).toBeVisible()
		canvas.getByLabelText('Модель этажа (GLB)').focus()

		await tabTo(within(parts).getByRole('button', { name: 'Добавить часть' }), userEvent, 20)
		await userEvent.keyboard('{Enter}')
		const added = within(parts).getByRole('group', { name: 'Часть 2: f1-shop-1' })
		const element = within(added).getByLabelText('Id элемента SVG части')
		await userEvent.clear(element)
		await expect(within(added).getByText('Ожидается непустая строка')).toBeInTheDocument()
		await userEvent.type(element, 'f1-shop-2')
		await expect(within(parts).getByRole('group', { name: 'Часть 2: f1-shop-2' })).toBeVisible()

		const scene = canvas.getByRole('group', { name: 'Сцена' })
		await expect(within(scene).getByRole('spinbutton', { name: 'Скос кромок' })).toHaveAttribute('aria-valuenow', '2')
		const outline = within(scene).getByRole('switch', { name: 'Контур по рёбрам' })
		await expect(outline).toBeChecked()
		await tabTo(outline, userEvent, 20)
		await userEvent.keyboard(' ')
		await expect(outline).not.toBeChecked()

		await tabTo(within(parts).getByRole('button', { name: 'Удалить часть 2: f1-shop-2' }), userEvent, 20)
		await userEvent.keyboard('{Enter}')
		await expect(within(parts).queryByRole('group', { name: 'Часть 2: f1-shop-2' })).not.toBeInTheDocument()
		await waitFor(() => expect(within(parts).getByRole('button', { name: 'Удалить часть 1: f1-shop-1' })).toHaveFocus())
	},
}
