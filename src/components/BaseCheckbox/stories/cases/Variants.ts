import { ref } from 'vue'
import type meta from '../BaseCheckbox.stories'
import BaseCheckbox from '../../ui/BaseCheckbox.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { CHECKBOX_VARIANTS } from '../../types/BaseCheckbox.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Пять вариантов в двух состояниях. `default` — основной; `outline` — прозрачный, для цветного фона;',
					'`soft` — мягкий фон основного цвета; `ghost` — без рамки; `shadow` — с тенью.',
				].join('\n'),
			},
			source: {
				code: CHECKBOX_VARIANTS.map(variant => `<BaseCheckbox v-model="checked" variant="${variant}" label="${variant}" />`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseCheckbox },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'variant', 'onUpdate:modelValue']),
			variants: CHECKBOX_VARIANTS,
			values: ref(Object.fromEntries(CHECKBOX_VARIANTS.map(variant => [variant, { off: false, on: true }]))),
		}),
		template: `
			<div class="story-col">
				<div v-for="variant in variants" :key="variant" class="story-row">
					<span class="story-label">{{ variant }}</span>
					<BaseCheckbox v-bind="props" v-model="values[variant].off" :variant="variant" label="Email" />
					<BaseCheckbox v-bind="props" v-model="values[variant].on" :variant="variant" label="SMS" />
				</div>
			</div>
		`,
	}),
}
