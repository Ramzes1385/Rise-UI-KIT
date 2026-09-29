import { showcaseItems } from '../../shared'
import type meta from '../../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseAccordion from '../../../ui/BaseAccordion.vue'
import { ACCORDION_VARIANTS } from '../../../types/BaseAccordion.types'

export const Variants: StoryObj<typeof meta> = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: {
			description: {
				story: 'Пять вариантов: `default` и `ghost` — для страниц и боковых панелей, `outline`, `shadow`, `soft` — отдельным блоком.',
			},
			source: { code: ACCORDION_VARIANTS.map(variant => `<BaseAccordion :items="items" variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseAccordion },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: ACCORDION_VARIANTS, showcaseItems }),
		template: `
			<div class="story-grid" style="--story-grid-min: 320px;">
				<div v-for="(variant, index) in variants" :key="variant" class="story-col">
					<span class="story-label">{{ variant }}</span>
					<BaseAccordion v-bind="props" :items="showcaseItems(index)" :variant="variant" />
				</div>
			</div>
		`,
	}),
}
