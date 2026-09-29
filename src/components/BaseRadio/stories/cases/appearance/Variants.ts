import { ref } from 'vue'
import type meta from '../../BaseRadio.stories'
import BaseRadio from '../../../ui/BaseRadio.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { RADIO_VARIANTS } from '../../../types/BaseRadio.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isVertical', 'error'] },
		docs: {
			description: {
				story: [
					'Пять вариантов. `default` — основной; `outline` — прозрачный круг, для цветного фона; `ghost` — без рамки;',
					'`shadow` — с тенью; `bordered` — опции-кнопки без круга.',
				].join('\n'),
			},
			source: {
				code: RADIO_VARIANTS.map(
					variant => `<BaseRadio v-model="value" :options="options" name="${variant}" variant="${variant}" label="${variant}" />`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseRadio },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'name', 'label', 'variant', 'onUpdate:modelValue']),
			variants: RADIO_VARIANTS,
			values: ref<Record<string, string | number>>(Object.fromEntries(RADIO_VARIANTS.map(variant => [variant, 'pickup']))),
		}),
		template: `
			<div class="story-stack">
				<BaseRadio
					v-for="variant in variants"
					:key="variant"
					v-bind="props"
					v-model="values[variant]"
					:name="'delivery-' + variant"
					:variant="variant"
					:label="variant" />
			</div>
		`,
	}),
}
