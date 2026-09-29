import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BaseSlideover.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSlideover from '../../../ui/BaseSlideover.vue'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['side'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: пропорционально меняются отступы, кегль, кнопка закрытия и ширина панели.' },
			source: {
				code: SIZE_PRESETS.map(
					preset =>
						`<BaseSlideover v-model:is-open="isOpen" :size-scale="${preset.sizeScale}" title="${preset.name}">…</BaseSlideover>`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSlideover, BaseText },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'sizeScale']),
			presets: SIZE_PRESETS.filter(preset => ['sm', 'md', 'lg'].includes(preset.name)),
			sizeLabel,
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-frame" style="height: 170px;">
					<BaseSlideover v-bind="props" :is-open="true" is-contained :size-scale="preset.sizeScale" :title="sizeLabel(preset)">
						<BaseText>Содержимое панели.</BaseText>
					</BaseSlideover>
				</div>
			</div>
		`,
	}),
}
