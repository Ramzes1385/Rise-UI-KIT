import { BasePin } from '@components/BasePin'
import type meta from '../../BaseFormField.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFormField from '../../../ui/BaseFormField.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { FORM_FIELD_VARIANTS } from '../../../types/BaseFormField.types'

const variants = FORM_FIELD_VARIANTS

const state = { values: Object.fromEntries(FORM_FIELD_VARIANTS.map(variant => [variant, ''])) }

const template = `
	<div class="story-grid" style="--story-grid-min: 280px;">
		<BaseFormField v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="variant">
			<BasePin v-model="values[variant]" />
		</BaseFormField>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['description', 'error', 'isRequired', 'sizeScale'] },
		docs: {
			description: {
				story: 'Варианты: `default` и `ghost` — без оформления, `outline` — рамка, `soft` — мягкий фон, `shadow` — рамка и тень.',
			},
			source: storySource({
				template,
				imports: ['BaseFormField', 'BasePin'],
				script: `const variants = ${literal(variants)}`,
				state,
				types: { values: 'Record<string, string>' },
				omit: ['default', 'label', 'variant'],
			}),
		},
	},
	render: args => ({
		components: { BaseFormField, BasePin },
		setup: useStorySetup(args, { state, data: { variants }, slots: ['default', 'label', 'variant'] }),
		template,
	}),
}
