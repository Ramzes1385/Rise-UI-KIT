import { BaseText } from '@components/BaseText'
import type { Meta } from '@storybook/vue3-vite'
import { FRAME_SOURCE, useFrameColorMode } from './shared'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseColorModeButton from '../ui/BaseColorModeButton.vue'

const template = `
	<div ref="frame" class="story-frame story-row" style="background: var(--rise-bg); color: var(--rise-text);">
		<BaseColorModeButton v-bind="args" :color-mode="colorMode" />
		<BaseText>Тема этой рамки — {{ colorMode.isDark.value ? 'тёмная' : 'светлая' }}</BaseText>
	</div>
`

export const source = storySource({ template, imports: ['BaseColorModeButton', 'BaseText'], ...FRAME_SOURCE })

export const render = (args => {
	const setup = useStorySetup(args, { slots: [] })
	return {
		components: { BaseColorModeButton, BaseText },
		setup: () => ({ ...setup(), ...useFrameColorMode() }),
		template,
	}
}) satisfies Meta<typeof BaseColorModeButton>['render']
