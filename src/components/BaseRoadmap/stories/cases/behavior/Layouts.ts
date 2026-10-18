import { docsFrame } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Layouts: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(820),
			description: {
				story: [
					'Одни и те же данные в четырёх раскладках. Переключатель «Путь / Змейка / Список / Лента» (`hasLayoutSwitch`) меняет вид,',
					'раскрытые этапы, выбранная тема и прогресс сохраняются. Проп `layout` задаёт раскладку по умолчанию, а выбор пользователя',
					'действует, пока `layout` не изменится.',
				].join('\n'),
			},
		},
	},
	args: { selected: null, expanded: ['s3', 's4'] },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const kinds = [
			['Змейка', '.base-roadmap__canvas--snake'],
			['Список', '.base-roadmap__list'],
			['Лента', '.base-roadmap__canvas--horizontal'],
			['Путь', '.base-roadmap__canvas--path'],
		] as const
		for (const [name, selector] of kinds) {
			await userEvent.click(canvas.getByRole('radio', { name }))
			await waitFor(() => expect(canvasElement.querySelector(selector)).not.toBeNull())
			await expect(canvas.getByRole('radio', { name })).toBeChecked()
			await expect(await canvas.findByRole('button', { name: /^Vue Router/ })).toBeVisible()
		}
		await expect(canvas.getByText('14 из 26 тем')).toBeVisible()
	},
}
