import { BaseText } from '@components/BaseText'
import type meta from '../../BasePopover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopover from '../../../ui/BasePopover.vue'
import { docsFrame, SHOWCASE_OWN_ARGS } from '../../shared'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: пропорционально меняются отступы, кегль, стрелка и ширина панели (до 320px при 100).',
			},
			...docsFrame(180),
			source: { code: SIZE_PRESETS.map(preset => `<BasePopover :size-scale="${preset.sizeScale}">…</BasePopover>`).join('\n') },
		},
	},
	render: args => ({
		components: { BasePopover, BaseButton, BaseText },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'sizeScale']),
			presets: SIZE_PRESETS.filter(preset => ['sm', 'md', 'lg'].includes(preset.name)),
			sizeLabel,
		}),
		template: `
			<div class="story-row" style="gap: 96px;">
				<BasePopover v-for="preset in presets" :key="preset.name" v-bind="props" :is-open="true" :size-scale="preset.sizeScale">
					<template #trigger>
						<BaseButton variant="outline" :size-scale="preset.sizeScale">{{ sizeLabel(preset) }}</BaseButton>
					</template>
					<BaseText>Текст поповера</BaseText>
				</BasePopover>
			</div>
		`,
	}),
}
