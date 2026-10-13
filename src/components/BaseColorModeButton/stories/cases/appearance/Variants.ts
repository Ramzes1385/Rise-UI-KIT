import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorModeButton.stories'
import { FRAME_SOURCE, useFrameColorMode } from '../../shared'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseColorModeButton from '../../../ui/BaseColorModeButton.vue'
import { BUTTON_VARIANTS } from '@components/BaseButton/types/BaseButton.types'

const template = `
	<div ref="frame" class="story-frame story-row" style="background: var(--rise-bg);">
		<BaseColorModeButton
			v-for="variant in BUTTON_VARIANTS"
			:key="variant"
			v-bind="args"
			:variant="variant"
			:label="'Тёмная тема: ' + variant"
			:color-mode="colorMode" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Варианты BaseButton: `ghost` (по умолчанию) — для шапки, остальные — рядом с кнопками того же варианта.',
			},
			source: storySource({ template, imports: ['BaseColorModeButton', 'BUTTON_VARIANTS'], ...FRAME_SOURCE, omit: ['variant'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => {
		const setup = useStorySetup(args, { slots: [], data: { BUTTON_VARIANTS } })
		return {
			components: { BaseColorModeButton },
			setup: () => ({ ...setup(), ...useFrameColorMode() }),
			template,
		}
	},
}
