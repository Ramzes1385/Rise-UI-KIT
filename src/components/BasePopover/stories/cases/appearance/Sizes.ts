import { BaseText } from '@components/BaseText'
import type meta from '../../BasePopover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopover from '../../../ui/BasePopover.vue'
import { docsFrame, SHOWCASE_OWN_ARGS } from '../../shared'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.filter(preset => ['sm', 'md', 'lg'].includes(preset.name)).map(preset => ({
	name: preset.name,
	sizeScale: preset.sizeScale,
	label: sizeLabel(preset),
}))

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'sizeScale']

const template = `
	<div class="story-row" style="gap: 96px;">
		<BasePopover v-for="preset in presets" :key="preset.name" v-bind="args" :is-open="true" :size-scale="preset.sizeScale">
			<template #trigger>
				<BaseButton variant="outline" :size-scale="preset.sizeScale">{{ preset.label }}</BaseButton>
			</template>
			<BaseText>Текст поповера</BaseText>
		</BasePopover>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: пропорционально меняются отступы, кегль, стрелка и ширина панели (до 320px при 100).',
			},
			...docsFrame(180),
			source: storySource({
				template,
				imports: ['BasePopover', 'BaseButton', 'BaseText'],
				script: `const presets = ${literal(presets)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BasePopover, BaseButton, BaseText },
		setup: useStorySetup(args, { data: { presets }, slots: OWN_ARGS }),
		template,
	}),
}
