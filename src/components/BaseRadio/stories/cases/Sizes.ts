import { ref } from 'vue'
import type meta from '../BaseRadio.stories'
import BaseRadio from '../../ui/BaseRadio.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'isVertical'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: круг 12, 14, 16, 18 и 20px, подписи масштабируются вместе с ним.' },
			source: {
				code: SIZE_PRESETS.map(
					p => `<BaseRadio v-model="value" :options="options" name="size-${p.name}" :size-scale="${p.sizeScale}" />`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseRadio },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'name', 'label', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string | number>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 'courier']))),
		}),
		template: `
			<div class="story-stack">
				<BaseRadio
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					v-model="values[preset.name]"
					:name="'size-' + preset.name"
					:size-scale="preset.sizeScale"
					:label="sizeLabel(preset)" />
			</div>
		`,
	}),
}
