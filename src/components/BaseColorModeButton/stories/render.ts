import { useFrameColorMode } from './shared'
import { BaseText } from '@components/BaseText'
import type { Meta } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseColorModeButton from '../ui/BaseColorModeButton.vue'

export const render = (args => ({
	components: { BaseColorModeButton, BaseText },
	setup: () => ({ props: useArgsWithoutSlots(args, []), ...useFrameColorMode() }),
	template: `
			<div ref="frame" class="story-frame story-row" style="background: var(--rise-bg); color: var(--rise-text);">
				<BaseColorModeButton v-bind="props" :color-mode="colorMode" />
				<BaseText>Тема этой рамки — {{ colorMode.isDark.value ? 'тёмная' : 'светлая' }}</BaseText>
			</div>
		`,
})) satisfies Meta<typeof BaseColorModeButton>['render']
