import { ref } from 'vue'
import type meta from '../../BaseSwitch.stories'
import BaseSwitch from '../../../ui/BaseSwitch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { SWITCH_VARIANTS } from '../../../types/BaseSwitch.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: 'Три варианта в двух состояниях: `default`, `outline` — прозрачный выключенный трек с рамкой, `shadow` — с тенью.',
			},
			source: {
				code: SWITCH_VARIANTS.map(variant => `<BaseSwitch v-model="enabled" variant="${variant}" label="${variant}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSwitch },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'variant', 'onUpdate:modelValue']),
			variants: SWITCH_VARIANTS,
			values: ref(Object.fromEntries(SWITCH_VARIANTS.map(variant => [variant, { off: false, on: true }]))),
		}),
		template: `
			<div class="story-col">
				<div v-for="variant in variants" :key="variant" class="story-row">
					<span class="story-label">{{ variant }}</span>
					<BaseSwitch v-bind="props" v-model="values[variant].off" :variant="variant" label="Выключен" />
					<BaseSwitch v-bind="props" v-model="values[variant].on" :variant="variant" label="Включён" />
				</div>
			</div>
		`,
	}),
}
