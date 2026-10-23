import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { docsFrame, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const Locked: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			...docsFrame(700),
			description: {
				story: [
					'Закрытый этап: «Продакшн» требует пройти «Качество» (`requires`), поэтому на острове его пьедестал серый с замком,',
					'в полосе этапов — значок замка, в панели — «Закрыт», «Откроется после «Качество»» и темы с пометкой «закрыта».',
				].join('\n'),
			},
		},
	},
	args: { focused: 's6' },
	play: async ({ canvas }) => {
		const panel = await canvas.findByRole('region', { name: 'Подробности темы' })
		await waitFor(() => expect(within(panel).getByText('Откроется после «Качество»')).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
		await expect(within(panel).getByRole('button', { name: /^SSR.*закрыта/ })).toBeVisible()
	},
}
