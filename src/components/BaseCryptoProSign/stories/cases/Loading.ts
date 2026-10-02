import { emulate } from '../shared'
import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseCryptoProSign.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Пока плагин подписывает (у пользователя открыто окно ПИН-кода), «Подписать» в состоянии загрузки,',
					'у корня `aria-busy="true"`. Здесь эмуляция отвечает на подпись через минуту.',
				].join('\n'),
			},
		},
	},
	beforeEach: emulate({ delay: 60000 }),
	play: async ({ canvas, userEvent }) => {
		const button = await canvas.findByRole('button', { name: 'Подписать' })
		await waitFor(() => expect(button).toBeEnabled())
		await tabTo(button, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByRole('region', { name: 'Электронная подпись' })).toHaveAttribute('aria-busy', 'true'))
		await expect(canvas.getByRole('button', { name: /Подписать/ })).toHaveAttribute('aria-busy', 'true')
	},
}
