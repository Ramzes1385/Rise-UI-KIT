import { expect } from 'storybook/test'
import type meta from '../BaseMention.stories'
import BaseMention from '../../ui/BaseMention.vue'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomTrigger: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Свой триггер: `#` — ссылки на каналы; выбор мышью тоже вставляет упоминание.' } },
	},
	args: {
		label: 'Сообщение',
		trigger: '#',
		placeholder: '# — сослаться на канал',
		options: [
			{ value: 'design', label: 'Дизайн', description: '24 участника' },
			{ value: 'frontend', label: 'Фронтенд', description: '18 участников' },
			{ value: 'releases', label: 'Релизы', description: '52 участника' },
		],
	},
	render: args => ({
		components: { BaseMention },
		setup: () => ({ args }),
		template: '<div style="max-width: 560px; min-height: 240px"><BaseMention v-bind="args" /></div>',
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await userEvent.type(field, 'Обсудим в #фр')
		await userEvent.click(canvas.getByRole('option', { name: /Фронтенд/ }))
		await expect(field).toHaveValue('Обсудим в #frontend ')
	},
}
