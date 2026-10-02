import { expect } from 'storybook/test'
import BaseTag from '../../../ui/BaseTag.vue'
import type meta from '../../BaseTag.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row">
		<BaseTag v-bind="args" label="Архив" is-selectable />
		<BaseTag v-bind="args" label="Черновик" is-removable :is-selectable="false" />
	</div>
`

export const Disabled: StoryObj<typeof meta> = {
	args: { isDisabled: true },
	parameters: {
		controls: { include: ['variant', 'tone', 'isDisabled', 'sizeScale'] },
		docs: {
			description: {
				story: 'Выключенные метки (`isDisabled`): кнопки `disabled`, не получают фокус, не выбираются и не удаляются.',
			},
			source: storySource({ template, imports: ['BaseTag'], omit: ['label', 'isSelectable', 'isRemovable'] }),
		},
	},
	render: args => ({
		components: { BaseTag },
		setup: useStorySetup(args, { slots: ['default'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Архив' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Удалить метку Черновик' })).toBeDisabled()
	},
}
