import { expect } from 'storybook/test'
import type meta from '../../BaseAlert.stories'
import BaseAlert from '../../../ui/BaseAlert.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	args: { isClosable: true, description: '' },
	parameters: {
		controls: { include: ['type', 'variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: отступы, текст, иконка и кнопка закрытия масштабируются вместе.' },
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseAlert :size-scale="${preset.sizeScale}" title="${preset.name}" is-closable />`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseAlert },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-stack story-medium">
				<BaseAlert v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :title="sizeLabel(preset)" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const closeButtons = canvas.getAllByRole('button', { name: 'Закрыть' })
		for (const button of closeButtons) {
			const { width, height } = button.getBoundingClientRect()
			await expect(Math.round(width)).toBe(Math.round(height))
		}
		await expect(closeButtons[2].getBoundingClientRect().height).toBe(24)
	},
}
