import type meta from '../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { docsFrame, STORY_WAIT_TIMEOUT, tabTo } from '@/stories/helpers'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(700),
			description: {
				story: [
					'Песочница: путь «Frontend-разработчик на Vue» — шесть этапов на острове, машинка стоит на текущем этапе «Vue 3».',
					'Нажмите этап на острове или в полосе внизу — камера наедет на него, справа откроется панель с темами (play открывает',
					'«Vue 3» и закрывает панель — остаётся обзор острова). `v-model` для `view`,',
					'`camera`, `focused`, `isTourPlaying`, `progress` и `selected` связаны с Controls. Props — в панели Controls.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		const island = await canvas.findByRole('group', { name: 'Frontend-разработчик на Vue' })
		await expect(island).toHaveAttribute('aria-roledescription', '3D-дорожная карта')
		await waitFor(() => expect(canvasElement.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true'))
		await tabTo(island, userEvent, 20)
		await expect(island).toHaveFocus()

		const steps = within(await canvas.findByRole('list', { name: 'Этапы' })).getAllByRole('button')
		await expect(steps).toHaveLength(6)
		await userEvent.click(canvas.getByRole('button', { name: /^Этап 4 из 6: Vue 3/ }))
		const panel = await canvas.findByRole('region', { name: 'Подробности темы' })
		await expect(within(panel).getByRole('heading', { level: 2, name: 'Vue 3' })).toBeVisible()
		await userEvent.click(within(panel).getByRole('button', { name: 'Закрыть панель' }))
		await waitFor(() => expect(canvas.queryByRole('region', { name: 'Подробности темы' })).toBeNull(), { timeout: STORY_WAIT_TIMEOUT })
	},
}
