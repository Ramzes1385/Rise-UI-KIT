import { ref } from 'vue'
import type meta from '../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { INPUT_VARIANTS } from '@components/BaseInput'
import BaseDatePicker from '../../ui/BaseDatePicker.vue'
import { useArgsWithoutSlots, storyDate } from '@/stories/helpers'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: 'Варианты поля — те же, что у `BaseInput`: `default`, `outline`, `soft`, `ghost`, `filled`, `underline`, `shadow`.',
			},
			source: {
				code: INPUT_VARIANTS.map(variant => `<BaseDatePicker v-model="date" input-variant="${variant}" label="${variant}" />`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseDatePicker },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'inputVariant', 'onUpdate:modelValue']),
			variants: INPUT_VARIANTS,
			values: ref<Record<string, Date | null>>(Object.fromEntries(INPUT_VARIANTS.map(variant => [variant, storyDate(0, 0, 0)]))),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<BaseDatePicker
					v-for="variant in variants"
					:key="variant"
					v-bind="props"
					v-model="values[variant]"
					:input-variant="variant"
					:label="variant" />
			</div>
		`,
	}),
}
