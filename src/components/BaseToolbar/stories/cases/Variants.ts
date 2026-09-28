import type meta from '../BaseToolbar.stories'
import { BaseIcon } from '@components/BaseIcon'
import BaseToolbar from '../../ui/BaseToolbar.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { FORMAT_BUTTONS, ALIGN_BUTTONS } from '../shared'
import { BaseSeparator } from '@components/BaseSeparator'
import { TOOLBAR_VARIANTS } from '../../types/BaseToolbar.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты панели: `default` — без фона, `ghost` — без отступа, `outline` — рамка, `soft` — фон.' } },
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseToolbar, BaseButton, BaseIcon, BaseSeparator },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['variant', 'ariaLabel']),
			variants: TOOLBAR_VARIANTS,
			format: FORMAT_BUTTONS,
			align: ALIGN_BUTTONS,
		}),
		template: `
			<div class="story-stack">
				<BaseToolbar v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :aria-label="variant">
					<BaseButton v-for="button in format" :key="button.icon" variant="ghost" :aria-label="button.label" :padding="{ x: 6, y: 6 }"><BaseIcon :name="button.icon" /></BaseButton>
				</BaseToolbar>
			</div>
		`,
	}),
}
