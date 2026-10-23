import type meta from '../../BaseCountdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCountdown from '../../../ui/BaseCountdown.vue'
import { expect, userEvent, waitFor } from 'storybook/test'
import { COUNTDOWN_DIGIT_ANIMATIONS } from '../../../types/BaseCountdown.types'
import { TO, TO_SCRIPT, digitModes, displayText, isReducedMotion } from '../../shared'
import { literal, motionPresetsStory, storySource, useStorySetup } from '@/stories/helpers'

const animations = COUNTDOWN_DIGIT_ANIMATIONS

const PRESETS = 4

const state = { shift: 0 }

const motion = motionPresetsStory({
	item: `
		<div v-for="animation in animations" :key="animation" class="story-row">
			<span class="story-label">{{ animation }}</span>
			<BaseCountdown v-bind="args" :to="to - shift" :digit-animation="animation" />
		</div>
	`,
	components: { BaseButton, BaseCountdown },
	imports: ['BaseCountdown'],
	state,
	action: 'shift += 1000',
	trigger: 'Следующая секунда',
	omit: ['to', 'digitAnimation'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		docs: {
			description: {
				story: [
					'Смена цифр `digitAnimation` (строки в каждой колонке) в четырёх пресетах движения `data-rise-motion` (колонки).',
					'Меняются только изменившиеся разряды, разделители статичны. «Следующая секунда» сдвигает цель на секунду раньше.',
					'Длительность — `min(var(--rise-duration-slow), 600ms)`, кривая — `--rise-ease-spring` (перелёт только в `expressive`).',
					"Выключить движение в приложении — `digitAnimation: 'none'` (в том числе через `defaults` плагина),",
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; при «уменьшить движение» в системе цифры меняются сразу.",
				].join('\n'),
			},
			source: storySource({
				template: motion.template,
				imports: ['BaseButton', 'BaseCountdown'],
				state,
				script: [TO_SCRIPT, `const animations = ${literal(animations)}`].join('\n'),
				omit: ['to', 'digitAnimation'],
			}),
		},
		controls: { include: ['layout', 'variant', 'sizeScale'] },
	},
	args: { layout: 'inline', format: ['minutes', 'seconds'] },
	render: args => ({
		components: { BaseButton, BaseCountdown },
		setup: useStorySetup(args, { state, data: { animations, to: TO }, slots: ['to', 'digitAnimation'] }),
		template: motion.template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const isReduced = isReducedMotion()
		await expect(digitModes(canvasElement)).toEqual(
			Array.from({ length: PRESETS }, () => animations.map(animation => (isReduced ? 'none' : animation))).flat(),
		)
		const clock = canvasElement.querySelector('.base-countdown__clock')
		const before = displayText(clock)
		await userEvent.click(canvas.getByRole('button', { name: 'Следующая секунда' }))
		await waitFor(() => expect(displayText(clock)).not.toBe(before))
		await expect(displayText(clock)).toMatch(/^\d+:\d\d$/)
	},
}
