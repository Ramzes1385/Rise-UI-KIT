import { expect } from 'storybook/test'
import type meta from '../../BaseCountdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCountdown from '../../../ui/BaseCountdown.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { TO, TO_SCRIPT, digitModes, isReducedMotion } from '../../shared'
import { COUNTDOWN_DIGIT_ANIMATIONS } from '../../../types/BaseCountdown.types'

const animations = COUNTDOWN_DIGIT_ANIMATIONS

const template = `
	<div class="story-stack">
		<div v-for="animation in animations" :key="animation" class="story-row">
			<span class="story-label">{{ animation }}</span>
			<BaseCountdown v-bind="args" :to="to" :digit-animation="animation" />
			<BaseCountdown v-bind="args" :to="to" :digit-animation="animation" layout="inline" />
		</div>
	</div>
`

export const DigitAnimations: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Режимы смены цифр в ячейках и строкой: `roll` (по умолчанию) — цифра въезжает сверху, `flip` — табло,',
					'`fade` — перекрёстное затухание, `blur` — затухание с размытием, `none` — без анимации.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCountdown'],
				script: [TO_SCRIPT, `const animations = ${literal(animations)}`].join('\n'),
				omit: ['to', 'digitAnimation', 'layout'],
			}),
		},
		controls: { include: ['variant', 'sizeScale', 'format'] },
	},
	render: args => ({
		components: { BaseCountdown },
		setup: useStorySetup(args, { data: { animations, to: TO }, slots: ['to', 'digitAnimation', 'layout'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const isReduced = isReducedMotion()
		await expect(digitModes(canvasElement)).toEqual(animations.flatMap(animation => Array(2).fill(isReduced ? 'none' : animation)))
		await expect(canvasElement.querySelectorAll('.base-countdown__slot').length > 0).toBe(!isReduced)
	},
}
