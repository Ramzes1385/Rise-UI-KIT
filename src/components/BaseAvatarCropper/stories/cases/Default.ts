import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseAvatarCropper.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAvatarCropper from '../../ui/BaseAvatarCropper.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { crop: 'crop' }

const template = `
	<BaseAvatarCropper v-bind="args" v-model:crop="crop" />
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: кадр `v-model:crop` виден в Controls. Проверка сдвигает фото стрелкой и увеличивает клавишей «+».',
			},
			source: storySource({ template, imports: ['BaseAvatarCropper'], models }),
		},
	},
	render: args => ({
		components: { BaseAvatarCropper },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const slider = canvas.getByRole('slider', { name: 'Масштаб' })
		await waitFor(() => expect(slider).not.toHaveAttribute('aria-disabled', 'true'))
		const area = canvas.getByRole('group', { name: 'Кадрирование фото' })
		await tabTo(area, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await userEvent.keyboard('+')
		await expect(Number(slider.getAttribute('aria-valuenow'))).toBeGreaterThan(1)
		await userEvent.keyboard('0')
		await expect(slider).toHaveAttribute('aria-valuenow', '1')
	},
}
