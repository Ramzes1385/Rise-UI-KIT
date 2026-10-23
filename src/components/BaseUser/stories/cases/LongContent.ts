import { expect } from 'storybook/test'
import type meta from '../BaseUser.stories'
import BaseUser from '../../ui/BaseUser.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="width: 220px;"><BaseUser v-bind="args" style="width: 100%;" /></div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Длинные имя и подпись обрезаются многоточием по ширине контейнера.' },
			source: storySource({ template, imports: ['BaseUser'], omit: [] }),
		},
	},
	args: { name: 'Екатерина Александровна Константинопольская', description: 'Руководитель направления клиентского сервиса' },
	render: args => ({
		components: { BaseUser },
		setup: useStorySetup(args, { slots: [] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const name = canvasElement.querySelector('.base-user__name') as HTMLElement
		await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth)
	},
}
