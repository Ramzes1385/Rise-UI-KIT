import { ref } from 'vue'
import type meta from '../BaseInput.stories'
import BaseInput from '../../ui/BaseInput.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { INPUT_VARIANTS } from '../../types/BaseInput.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Семь вариантов. `default` — основной; `outline` — на цветном фоне; `soft`, `ghost` — в плотных интерфейсах',
					'(тулбары, фильтры таблиц); `filled` — приподнятое поле; `underline` — только нижняя линия; `shadow` — с тенью.',
				].join('\n'),
			},
			source: {
				code: INPUT_VARIANTS.map(variant => `<BaseInput v-model="value" variant="${variant}" label="${variant}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseInput },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'variant', 'onUpdate:modelValue']),
			variants: INPUT_VARIANTS,
			values: ref<Record<string, string>>({}),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<BaseInput
					v-for="variant in variants"
					:key="variant"
					v-bind="props"
					v-model="values[variant]"
					:variant="variant"
					:label="variant"
					placeholder="Введите текст" />
			</div>
		`,
	}),
}
