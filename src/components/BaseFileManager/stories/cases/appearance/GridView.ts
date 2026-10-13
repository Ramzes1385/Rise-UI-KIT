import { storySource } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFileManager.stories'
import { type ManagerCaseOptions, managerRender, managerSource, managerTag } from '../../shared'

const options: ManagerCaseOptions = {
	template: `
${managerTag({ isModel: true })}
`,
	isModel: true,
}

const source = storySource(managerSource(options))

export const GridView: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Плитки вместо списка: `v-model:view` со значением `grid` (в Controls — `view`). Ряды строятся по ширине области, стрелки вправо и влево идут по записи, вверх и вниз — по ряду,',
					'длинное имя обрезается на двух строках. Переключатель «Вид» в панели возвращает список.',
				].join('\n'),
			},
			source,
		},
	},
	args: { view: 'grid' },
	render: managerRender(options),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvasElement.querySelector('.base-file-manager--grid')).not.toBeNull()
		await expect(canvas.getByRole('listbox')).toHaveClass('base-file-manager__list--grid')

		await userEvent.click(canvas.getByRole('option', { name: /^Архив/ }))
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('option', { name: /^Документы/ })).toHaveFocus()

		await userEvent.click(canvas.getByRole('radio', { name: 'Список' }))
		await waitFor(() => expect(canvasElement.querySelector('.base-file-manager--list')).not.toBeNull())
	},
}
