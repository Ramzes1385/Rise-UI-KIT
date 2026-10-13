import { expect } from 'storybook/test'
import { storySource } from '@/stories/helpers'
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

export const Selection: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Выбор записей (`v-model:selected`). Клик выбирает одну запись, Ctrl+клик добавляет или убирает, Shift+клик берёт диапазон от опорной записи.',
					'С клавиатуры: Shift+стрелка расширяет выбор, Ctrl+стрелка двигает только фокус, Пробел переключает запись, Ctrl+A выбирает всё, Escape снимает выбор.',
					'Число выбранных видно в строке состояния; выбор ограничен текущей папкой и сбрасывается при переходе в другую.',
				].join('\n'),
			},
			source,
		},
	},
	render: managerRender(options),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const status = canvasElement.querySelector('.base-file-manager__status')
		const option = (name: RegExp) => canvas.getByRole('option', { name })

		await userEvent.click(option(/^Архив/))
		await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}')
		await expect(option(/^Архив/)).toHaveAttribute('aria-selected', 'true')
		await expect(option(/^Документы/)).toHaveAttribute('aria-selected', 'true')
		await expect(option(/^Проекты/)).toHaveAttribute('aria-selected', 'true')
		await expect(option(/^Фото/)).toHaveAttribute('aria-selected', 'false')
		await expect(status).toHaveTextContent('выбрано 3')

		await userEvent.keyboard('{Control>}')
		await userEvent.click(option(/^Фото/))
		await userEvent.keyboard('{/Control}')
		await expect(status).toHaveTextContent('выбрано 4')

		await userEvent.keyboard('{Escape}')
		await expect(status).not.toHaveTextContent('выбрано')

		await userEvent.keyboard('{Control>}a{/Control}')
		await expect(status).toHaveTextContent('выбрано 7')
		await expect(canvas.getByRole('button', { name: 'Удалить' })).toBeVisible()
	},
}
