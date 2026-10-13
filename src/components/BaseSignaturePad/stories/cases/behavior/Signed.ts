import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseSignaturePad.stories'
import { SAMPLE_SIGNATURE } from '../../sampleSignature'

export const Signed: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Сохранённая подпись: штрихи из `v-model` рисуются в поле, подсказка скрыта, кнопки доступны.' },
		},
	},
	args: { modelValue: SAMPLE_SIGNATURE },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('group', { name: 'Подпись клиента' })).toBeVisible()
		await expect(canvas.getByRole('img', { name: 'Подпись: 3 штриха' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Очистить' })).toBeEnabled()
	},
}
