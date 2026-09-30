import { showcaseItems } from '../../shared'
import type meta from '../../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAccordion from '../../../ui/BaseAccordion.vue'
import { ACCORDION_VARIANTS } from '../../../types/BaseAccordion.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = ACCORDION_VARIANTS.map((variant, index) => ({ name: variant, items: showcaseItems(index) }))

const template = `
	<div class="story-grid" style="--story-grid-min: 320px;">
		<div v-for="variant in variants" :key="variant.name" class="story-col">
			<span class="story-label">{{ variant.name }}</span>
			<BaseAccordion v-bind="args" :items="variant.items" :variant="variant.name" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: {
			description: {
				story: 'Пять вариантов: `default` и `ghost` — для страниц и боковых панелей, `outline`, `shadow`, `soft` — отдельным блоком.',
			},
			source: storySource({
				template,
				imports: ['BaseAccordion'],
				script: `const variants = ${literal(variants)}`,
				omit: ['items', 'variant'],
			}),
		},
	},
	render: args => ({
		components: { BaseAccordion },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}
