import { expect } from 'storybook/test'
import BaseTag from '../../../ui/BaseTag.vue'
import type meta from '../../BaseTag.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { TAG_VARIANTS } from '../../../types/BaseTag.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row">
		<template v-for="variant in TAG_VARIANTS" :key="variant">
			<BaseTag v-bind="args" :variant="variant" :label="variant" />
			<BaseTag v-bind="args" :variant="variant" :label="variant + ', выбрана'" is-selectable is-selected />
		</template>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	args: { isSelectable: false, tone: 'primary' },
	parameters: {
		controls: { include: ['tone', 'sizeScale'] },
		docs: {
			description: {
				story: '`default` — мягкий фон роли, `outline` — фон страницы и рамка роли. Выбранная метка в обоих вариантах залита цветом роли и показывает галочку.',
			},
			source: storySource({
				template,
				imports: ['BaseTag', 'TAG_VARIANTS'],
				omit: ['variant', 'label', 'isSelectable', 'isSelected'],
			}),
		},
	},
	render: args => ({
		components: { BaseTag },
		setup: useStorySetup(args, { data: { TAG_VARIANTS }, slots: ['default'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const selected = canvas.getByRole('button', { name: 'outline, выбрана' })
		await expect(selected).toHaveAttribute('aria-pressed', 'true')
		await expect(selected.querySelector('.base-tag__icon')).not.toBeNull()
	},
}
