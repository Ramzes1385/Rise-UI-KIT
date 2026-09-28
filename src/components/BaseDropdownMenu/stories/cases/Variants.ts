import { docsFrame } from '../shared'
import type meta from '../BaseDropdownMenu.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseDropdownMenu from '../../ui/BaseDropdownMenu.vue'
import { DROPDOWN_MENU_VARIANTS } from '../../types/BaseDropdownMenu.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			...docsFrame(260),
			description: { story: 'Варианты панели — те же, что у BaseDropdown: default, ghost, outline, shadow, soft.' },
		},
	},
	render: args => ({
		components: { BaseDropdownMenu, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['isOpen', 'variant', 'items']),
			variants: DROPDOWN_MENU_VARIANTS,
			items: [[{ label: 'Переименовать' }, { label: 'Дублировать' }], [{ label: 'Удалить', isDanger: true }]],
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 160px;">
				<div v-for="variant in variants" :key="variant" style="height: 190px;">
					<BaseDropdownMenu v-bind="props" :items="items" :is-open="true" :variant="variant" :aria-label="variant">
						<BaseButton variant="outline">{{ variant }}</BaseButton>
					</BaseDropdownMenu>
				</div>
			</div>
		`,
	}),
}
