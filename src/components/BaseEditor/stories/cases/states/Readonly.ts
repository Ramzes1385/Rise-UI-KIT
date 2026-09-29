import type meta from '../../BaseEditor.stories'
import { STORY_IMAGES } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, within, screen } from 'storybook/test'

export const Readonly: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Только чтение: тулбара нет, фон приглушён. Текст можно выделить и скопировать, но не изменить;',
					'меню размера медиа по правому клику не открывается (остаётся меню браузера).',
				].join('\n'),
			},
		},
	},
	args: {
		isReadonly: true,
		modelValue: [
			'<h3>Итоги спринта</h3>',
			'<p>Выпущены <strong>BaseEditor</strong> и <strong>BaseChat</strong>, закрыто 18 задач. Подробности — в <a href="#report">отчёте</a>.</p>',
			`<p><img src="${STORY_IMAGES[2].src}" alt="${STORY_IMAGES[2].alt}" width="240"></p>`,
		].join(''),
	},
	play: async ({ canvas, userEvent }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await expect(textbox).toHaveAttribute('aria-readonly', 'true')
		await expect(textbox).toHaveAttribute('contenteditable', 'false')
		await expect(canvas.queryByRole('toolbar')).toBeNull()
		await userEvent.pointer({ keys: '[MouseRight]', target: within(textbox).getByRole('img', { name: STORY_IMAGES[2].alt }) })
		await expect(screen.queryByRole('dialog', { name: 'Размер медиа' })).toBeNull()
	},
}
