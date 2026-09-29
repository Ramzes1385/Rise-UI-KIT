import { fn, within, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotification.stories'

export const Actions: StoryObj<typeof meta> = {
	args: {
		type: 'info',
		title: 'Файл перемещён в корзину',
		description: '«Интервью, дубль 4.mov» можно восстановить в течение 30 дней.',
		actions: [{ label: 'Отменить', onClick: fn() }, { label: 'Открыть корзину' }],
	},
	parameters: {
		docs: {
			description: {
				story: [
					'Кнопки действий: `actions: [{ label, onClick }]` под текстом. Нажатие выполняет действие и закрывает уведомление',
					'(событие `remove`). Подпись называет действие: «Отменить», «Повторить», «Открыть». Сценарий с нажатием —',
					'в stories BaseApp (Actions).',
				].join('\n'),
			},
		},
		controls: { include: ['actions', 'variant', 'sizeScale'] },
	},
	play: async ({ canvas }) => {
		const item = await canvas.findByRole('status')
		const buttons = within(item).getAllByRole('button')
		await expect(buttons.map(button => button.textContent?.trim() || button.getAttribute('aria-label'))).toEqual([
			'Отменить',
			'Открыть корзину',
			'Закрыть',
		])
		const description = within(item).getByText(/можно восстановить/)
		await expect(buttons[0].getBoundingClientRect().top).toBeGreaterThanOrEqual(description.getBoundingClientRect().bottom)
	},
}
