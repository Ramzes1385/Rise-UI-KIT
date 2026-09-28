import { expect } from 'storybook/test'
import type meta from '../BaseBreadcrumbs.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithHome: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`showHome` показывает первую крошку ссылкой-иконкой «домой» (`homeIcon`). Доступное имя ссылки — метка первой крошки,',
					'она ведёт на её адрес.',
				].join('\n'),
			},
		},
	},
	args: { showHome: true },
	play: async ({ canvas, userEvent, args }) => {
		const home = canvas.getByRole('link', { name: 'Главная' })
		await expect(home).not.toHaveTextContent('Главная')
		await userEvent.click(home)
		await expect(args.onNavigate).toHaveBeenCalledWith('/')
	},
}
