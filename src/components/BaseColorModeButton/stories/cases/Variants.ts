import { useFrameColorMode } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseColorModeButton.stories'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseColorModeButton from '../../ui/BaseColorModeButton.vue'
import { BUTTON_VARIANTS } from '@components/BaseButton/types/BaseButton.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Варианты BaseButton: `ghost` (по умолчанию) — для шапки, остальные — рядом с кнопками того же варианта.',
			},
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseColorModeButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []), variants: BUTTON_VARIANTS, ...useFrameColorMode() }),
		template: `
			<div ref="frame" class="story-frame story-row" style="background: var(--rise-bg);">
				<BaseColorModeButton v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="'Тёмная тема: ' + variant" :color-mode="colorMode" />
			</div>
		`,
	}),
}
