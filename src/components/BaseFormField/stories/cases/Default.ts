import { expect } from 'storybook/test'
import type meta from '../BaseFormField.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: меняйте props в Controls. Без `for` содержимое — группа с именем из подписи,',
					'а описание связано с ней через `aria-describedby`.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas }) => {
		const group = canvas.getByRole('group', { name: 'Код из СМС' })
		await expect(group).toHaveAccessibleDescription('Отправили на +7 916 ***-45-67')
	},
}
