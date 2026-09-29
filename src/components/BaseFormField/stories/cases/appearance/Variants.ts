import { ref } from 'vue'
import { BasePin } from '@components/BasePin'
import type meta from '../../BaseFormField.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseFormField from '../../../ui/BaseFormField.vue'
import { FORM_FIELD_VARIANTS } from '../../../types/BaseFormField.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['description', 'error', 'isRequired', 'sizeScale'] },
		docs: {
			description: {
				story: 'Варианты: `default` и `ghost` — без оформления, `outline` — рамка, `soft` — мягкий фон, `shadow` — рамка и тень.',
			},
			source: {
				code: FORM_FIELD_VARIANTS.map(variant => `<BaseFormField variant="${variant}" label="${variant}">…</BaseFormField>`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseFormField, BasePin },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'label', 'variant']),
			variants: FORM_FIELD_VARIANTS,
			values: ref<Record<string, string>>(Object.fromEntries(FORM_FIELD_VARIANTS.map(variant => [variant, '']))),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 280px;">
				<BaseFormField v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant">
					<BasePin v-model="values[variant]" />
				</BaseFormField>
			</div>
		`,
	}),
}
