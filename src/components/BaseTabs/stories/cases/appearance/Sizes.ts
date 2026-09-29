import { ref } from 'vue'
import { MODEL_KEYS } from '../../shared'
import type meta from '../../BaseTabs.stories'
import BaseTabs from '../../../ui/BaseTabs.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	args: { variant: 'pills' },
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: высота вкладки 24, 28, 32, 36 и 40px — как у кнопки того же размера.' },
			source: {
				code: SIZE_PRESETS.map(p => `<BaseTabs v-model="tab" :items="items" variant="pills" :size-scale="${p.sizeScale}" />`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseTabs },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...MODEL_KEYS, 'sizeScale', 'default']),
			presets: SIZE_PRESETS,
			sizeLabel,
			tabs: ref<Record<string, string>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 'overview']))),
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-col">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseTabs v-bind="props" v-model="tabs[preset.name]" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}
