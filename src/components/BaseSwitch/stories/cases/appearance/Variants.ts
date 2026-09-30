import type meta from '../../BaseSwitch.stories'
import BaseSwitch from '../../../ui/BaseSwitch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SWITCH_VARIANTS } from '../../../types/BaseSwitch.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = SWITCH_VARIANTS

const state = { values: Object.fromEntries(SWITCH_VARIANTS.map(variant => [variant, { off: false, on: true }])) }

const template = `
	<div class="story-col">
		<div v-for="variant in variants" :key="variant" class="story-row">
			<span class="story-label">{{ variant }}</span>
			<BaseSwitch v-bind="args" v-model="values[variant].off" :variant="variant" label="Выключен" />
			<BaseSwitch v-bind="args" v-model="values[variant].on" :variant="variant" label="Включён" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: 'Три варианта в двух состояниях: `default`, `outline` — прозрачный выключенный трек с рамкой, `shadow` — с тенью.',
			},
			source: storySource({
				template,
				imports: ['BaseSwitch'],
				script: `const variants = ${literal(variants)}`,
				state,
				omit: ['default', 'modelValue', 'label', 'variant', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseSwitch },
		setup: useStorySetup(args, {
			state,
			data: { variants },
			slots: ['default', 'modelValue', 'label', 'variant', 'onUpdate:modelValue'],
		}),
		template,
	}),
}
