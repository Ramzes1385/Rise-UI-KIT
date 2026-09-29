import { docsFrame } from '../../shared'
import type meta from '../../BaseTooltip.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTooltip from '../../../ui/BaseTooltip.vue'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	args: { isAlwaysVisible: true },
	parameters: {
		controls: { include: ['variant', 'position'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: пропорционально меняются кегль, отступы, радиус и стрелка подсказки; кнопка — нет.',
			},
			...docsFrame(140),
			source: {
				code: SIZE_PRESETS.map(
					preset => `<BaseTooltip text="${preset.name}" :size-scale="${preset.sizeScale}">…</BaseTooltip>`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTooltip, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['sizeScale', 'text']), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-row" style="gap: 40px;">
				<BaseTooltip v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :text="sizeLabel(preset)">
					<BaseButton variant="outline">{{ preset.name }}</BaseButton>
				</BaseTooltip>
			</div>
		`,
	}),
}
