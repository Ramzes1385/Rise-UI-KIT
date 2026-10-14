import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDropdownMenu.stories'
import BaseDropdownMenu from '../../../ui/BaseDropdownMenu.vue'
import { DROPDOWN_MENU_VARIANTS } from '../../../types/BaseDropdownMenu.types'
import { literal, storySource, useStorySetup, docsFrame } from '@/stories/helpers'

const HIDDEN_ARGS = ['isOpen', 'variant', 'items']

const items = [[{ label: 'Переименовать' }, { label: 'Дублировать' }], [{ label: 'Удалить', isDanger: true }]]

const template = `
	<div class="story-grid" style="--story-grid-min: 160px;">
		<div v-for="variant in DROPDOWN_MENU_VARIANTS" :key="variant" style="height: 190px;">
			<BaseDropdownMenu v-bind="args" :items="items" :is-open="true" :variant="variant" :aria-label="variant">
				<BaseButton variant="outline">{{ variant }}</BaseButton>
			</BaseDropdownMenu>
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			...docsFrame(260),
			description: { story: 'Варианты панели — те же, что у BaseDropdown: default, ghost, outline, shadow, soft.' },
			source: storySource({
				template,
				imports: ['BaseDropdownMenu', 'BaseButton', 'DROPDOWN_MENU_VARIANTS'],
				script: `const items = ${literal(items)}`,
				omit: HIDDEN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseDropdownMenu, BaseButton },
		setup: useStorySetup(args, { data: { DROPDOWN_MENU_VARIANTS, items }, slots: HIDDEN_ARGS }),
		template,
	}),
}
