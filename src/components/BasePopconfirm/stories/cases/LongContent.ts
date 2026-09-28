import { docsFrame } from '../shared'
import { screen, expect } from 'storybook/test'
import type meta from '../BasePopconfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const LongContent: StoryObj<typeof meta> = {
	args: {
		title: 'Отозвать доступ к черновикам сезона у всех переводчиков сообщества?',
		description:
			'Переводчики перестанут видеть черновики серий 1–12 и не смогут сохранять правки субтитров. Уже опубликованные серии останутся доступны.',
		confirmLabel: 'Отозвать доступ',
		isOpen: true,
	},
	parameters: {
		docs: { ...docsFrame(320), description: { story: 'Длинный вопрос и пояснение переносятся по словам; панель не шире 300px.' } },
	},
	play: async () => {
		const dialog = await screen.findByRole('alertdialog')
		await expect(dialog.getBoundingClientRect().width).toBeLessThanOrEqual(300)
	},
}
