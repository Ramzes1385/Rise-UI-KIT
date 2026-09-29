import { ref } from 'vue'
import type meta from '../../BaseSelect.stories'
import BaseSelect from '../../../ui/BaseSelect.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { SELECT_VARIANTS } from '../../../types/BaseSelect.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Шесть вариантов триггера — как у `BaseInput`. `default` — основной; `outline` — на цветном фоне;',
					'`soft`, `ghost` — в тулбарах и фильтрах; `shadow` — с тенью; `underline` — только нижняя линия.',
				].join('\n'),
			},
			source: {
				code: SELECT_VARIANTS.map(
					variant => `<BaseSelect v-model="city" :options="cities" variant="${variant}" label="${variant}" />`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSelect },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'variant', 'onUpdate:modelValue']),
			variants: SELECT_VARIANTS,
			values: ref<Record<string, string>>({ default: 'msk' }),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<BaseSelect
					v-for="variant in variants"
					:key="variant"
					v-bind="props"
					v-model="values[variant]"
					:variant="variant"
					:label="variant" />
			</div>
		`,
	}),
}
