import { expect } from 'storybook/test'
import BaseTag from '../../../ui/BaseTag.vue'
import type meta from '../../BaseTag.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row">
		<BaseTag v-bind="args" icon="star" label="Избранное" />
		<BaseTag v-bind="args" icon="star" label="Избранное, выбрана" is-selected />
	</div>
`

export const WithIcon: StoryObj<typeof meta> = {
	args: { tone: 'warning' },
	parameters: {
		controls: { include: ['variant', 'tone', 'sizeScale'] },
		docs: {
			description: {
				story: 'Значок перед текстом — `icon` (имя BaseIcon) или слот `icon`. У выбранной метки вместо значка — галочка.',
			},
			source: storySource({ template, imports: ['BaseTag'], omit: ['icon', 'label', 'isSelected'] }),
		},
	},
	render: args => ({
		components: { BaseTag },
		setup: useStorySetup(args, { slots: ['default'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Избранное' }).querySelector('.base-tag__icon')).not.toBeNull()
	},
}
