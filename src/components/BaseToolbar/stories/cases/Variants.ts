import { FORMAT_BUTTONS } from '../shared'
import type meta from '../BaseToolbar.stories'
import { BaseIcon } from '@components/BaseIcon'
import BaseToolbar from '../../ui/BaseToolbar.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { TOOLBAR_VARIANTS } from '../../types/BaseToolbar.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const format = FORMAT_BUTTONS

const hidden = ['variant', 'ariaLabel']

const template = `
	<div class="story-stack">
		<BaseToolbar v-for="variant in TOOLBAR_VARIANTS" :key="variant" v-bind="args" :variant="variant" :aria-label="variant">
			<BaseButton v-for="button in format" :key="button.icon" variant="ghost" :aria-label="button.label" :padding="{ x: 6, y: 6 }"><BaseIcon :name="button.icon" /></BaseButton>
		</BaseToolbar>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты панели: `default` — без фона, `ghost` — без отступа, `outline` — рамка, `soft` — фон.' },
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseIcon', 'BaseToolbar', 'TOOLBAR_VARIANTS'],
				script: `const format = ${literal(format)}`,
				omit: hidden,
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseToolbar, BaseButton, BaseIcon },
		setup: useStorySetup(args, { data: { TOOLBAR_VARIANTS, format }, slots: hidden }),
		template,
	}),
}
