import type meta from '../../BaseCountdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCountdown from '../../../ui/BaseCountdown.vue'
import { expect, userEvent, waitFor } from 'storybook/test'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { COUNTDOWN_DIGIT_ANIMATIONS } from '../../../types/BaseCountdown.types'
import { TO, TO_SCRIPT, digitModes, displayText, isReducedMotion } from '../../shared'

const animations = COUNTDOWN_DIGIT_ANIMATIONS

const presets = ['none', 'subtle', 'standard', 'expressive'] as const

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton variant="outline" @click="shift += 1000">Следующая секунда</BaseButton>
		</div>
		<div style="display: grid; grid-template-columns: repeat(5, max-content); gap: 12px 24px; align-items: center;">
			<span></span>
			<span v-for="preset in presets" :key="preset" class="story-label">{{ preset }}</span>
			<template v-for="animation in animations" :key="animation">
				<span class="story-label">{{ animation }}</span>
				<div v-for="preset in presets" :key="preset" :data-rise-motion="preset">
					<BaseCountdown v-bind="args" :to="to - shift" :digit-animation="animation" />
				</div>
			</template>
		</div>
	</div>
`

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		docs: {
			description: {
				story: [
					'Смена цифр `digitAnimation` во всех режимах (строки) и пресетах движения `data-rise-motion` (колонки).',
					'Меняются только изменившиеся разряды, разделители статичны. «Следующая секунда» сдвигает цель на секунду раньше.',
					'Длительность — `min(var(--rise-duration-slow), 600ms)`, кривая — `--rise-ease-spring`, без неё `--rise-ease-emphasized`.',
					"Выключить движение в приложении — `digitAnimation: 'none'` (в том числе через `defaults` плагина);",
					'при «уменьшить движение» в системе цифры меняются сразу.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseCountdown'],
				state: { shift: 0 },
				script: [TO_SCRIPT, `const animations = ${literal(animations)}`, `const presets = ${literal(presets)}`].join('\n'),
				omit: ['to', 'digitAnimation'],
			}),
		},
		controls: { include: ['layout', 'variant', 'sizeScale'] },
	},
	args: { layout: 'inline', format: ['minutes', 'seconds'] },
	render: args => ({
		components: { BaseButton, BaseCountdown },
		setup: useStorySetup(args, { state: { shift: 0 }, data: { animations, presets, to: TO }, slots: ['to', 'digitAnimation'] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const isReduced = isReducedMotion()
		await expect(digitModes(canvasElement)).toEqual(
			animations.flatMap(animation => Array(presets.length).fill(isReduced ? 'none' : animation)),
		)
		const clock = canvasElement.querySelector('.base-countdown__clock')
		const before = displayText(clock)
		await userEvent.click(canvas.getByRole('button', { name: 'Следующая секунда' }))
		await waitFor(() => expect(displayText(clock)).not.toBe(before))
		await expect(displayText(clock)).toMatch(/^\d+:\d\d$/)
	},
}
