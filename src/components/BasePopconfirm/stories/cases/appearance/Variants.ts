import { BaseButton } from '@components/BaseButton'
import type meta from '../../BasePopconfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopconfirm from '../../../ui/BasePopconfirm.vue'
import { POPCONFIRM_VARIANTS } from '../../../types/BasePopconfirm.types'
import { docsFrame, literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = POPCONFIRM_VARIANTS

const OWN_ARGS = ['isOpen', 'variant', 'description', 'position']

const template = `
	<div class="story-grid" style="--story-grid-min: 320px; padding-top: 110px;">
		<div v-for="variant in variants" :key="variant" style="height: 150px;">
			<BasePopconfirm v-bind="args" :is-open="true" :variant="variant" position="top" :title="'Вариант ' + variant">
				<BaseButton variant="outline">{{ variant }}</BaseButton>
			</BasePopconfirm>
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		layout: 'padded',
		controls: { include: ['sizeScale'] },
		docs: {
			...docsFrame(260),
			description: { story: 'Варианты панели — те же, что у BaseDropdown и BasePopover.' },
			source: storySource({
				template,
				imports: ['BasePopconfirm', 'BaseButton'],
				script: `const variants = ${literal(variants)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BasePopconfirm, BaseButton },
		setup: useStorySetup(args, { data: { variants }, slots: OWN_ARGS }),
		template,
	}),
}
