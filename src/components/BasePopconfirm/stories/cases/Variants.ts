import { docsFrame } from '../shared'
import type meta from '../BasePopconfirm.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BasePopconfirm from '../../ui/BasePopconfirm.vue'
import { POPCONFIRM_VARIANTS } from '../../types/BasePopconfirm.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		layout: 'padded',
		controls: { include: ['sizeScale'] },
		docs: { ...docsFrame(260), description: { story: 'Варианты панели — те же, что у BaseDropdown и BasePopover.' } },
	},
	render: args => ({
		components: { BasePopconfirm, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['isOpen', 'variant', 'description', 'position']),
			variants: POPCONFIRM_VARIANTS,
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 320px; padding-top: 110px;">
				<div v-for="variant in variants" :key="variant" style="height: 150px;">
					<BasePopconfirm v-bind="props" :is-open="true" :variant="variant" position="top" :title="'Вариант ' + variant">
						<BaseButton variant="outline">{{ variant }}</BaseButton>
					</BasePopconfirm>
				</div>
			</div>
		`,
	}),
}
