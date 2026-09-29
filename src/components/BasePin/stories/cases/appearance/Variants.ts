import { ref } from 'vue'
import BasePin from '../../../ui/BasePin.vue'
import type meta from '../../BasePin.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { PIN_VARIANTS } from '../../../types/BasePin.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'length', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: 'Пять вариантов, как у `BaseInput`: `default`, `outline` — без фона, `soft` — мягкий фон, `ghost` — без рамки, `shadow` — с тенью.',
			},
			source: { code: PIN_VARIANTS.map(variant => `<BasePin v-model="code" variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BasePin },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'variant', 'onUpdate:modelValue']),
			variants: PIN_VARIANTS,
			values: ref<Record<string, string>>(Object.fromEntries(PIN_VARIANTS.map(variant => [variant, '48']))),
		}),
		template: `
			<div class="story-col">
				<div v-for="variant in variants" :key="variant" class="story-row">
					<span class="story-label">{{ variant }}</span>
					<BasePin v-bind="props" v-model="values[variant]" :variant="variant" :aria-label="'Код, вариант ' + variant" />
				</div>
			</div>
		`,
	}),
}
