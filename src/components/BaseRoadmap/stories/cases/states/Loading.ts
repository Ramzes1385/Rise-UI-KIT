import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Загрузка (`isLoading`): вместо шапки и пути — скелет, область помечена `aria-busy`, а группа скелета называется «Загрузка пути».',
					'Данные и прогресс можно передать позже: роадмап перерисуется, когда `isLoading` станет `false`.',
				].join('\n'),
			},
		},
	},
	args: { isLoading: true, selected: null },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('region', { name: 'Frontend-разработчик на Vue' })).toHaveAttribute('aria-busy', 'true')
		await expect(canvas.getByRole('group', { name: 'Загрузка пути' })).toBeVisible()
		await expect(canvas.queryByRole('button', { name: /Vue 3/ })).toBeNull()
	},
}
