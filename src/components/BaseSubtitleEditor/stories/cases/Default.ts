import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseSubtitleEditor.stories'
import BaseSubtitleEditor from '../../ui/BaseSubtitleEditor.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { cues: 'cues', currentTime: 'currentTime' }

const template = `
	<BaseSubtitleEditor v-bind="args" v-model:cues="cues" v-model:current-time="currentTime" />
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Реплики демо-ролика: вторая — текущая (позиция 0:04). Время применяется при выходе из поля или по Enter.',
			},
			source: storySource({ template, imports: ['BaseSubtitleEditor'], models }),
		},
	},
	render: args => ({
		components: { BaseSubtitleEditor },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getAllByRole('listitem')[1]).toHaveAttribute('aria-current', 'true')
		const end = canvas.getByRole('textbox', { name: 'Конец реплики 1' })
		await userEvent.clear(end)
		await userEvent.type(end, '0:02.5{Tab}')
		await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Конец реплики 1' })).toHaveValue('0:02.500'))
		await tabTo(canvas.getByRole('button', { name: 'Перейти к реплике 3' }), userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getAllByRole('listitem')[2]).toHaveAttribute('aria-current', 'true'))
	},
}
