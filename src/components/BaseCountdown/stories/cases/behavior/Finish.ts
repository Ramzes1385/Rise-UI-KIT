import { displayText } from '../../shared'
import type meta from '../../BaseCountdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCountdown from '../../../ui/BaseCountdown.vue'
import { expect, fn, waitFor, within } from 'storybook/test'
import { STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseCountdown v-bind="args" :to="to" :format="['minutes', 'seconds']" @finish="isOpen = true">
			<template #finished><strong>Регистрация открыта</strong></template>
		</BaseCountdown>
		<p role="status">{{ isOpen ? 'Можно регистрироваться' : '' }}</p>
	</div>
`

export const Finish: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Короткий отсчёт: через 3 секунды — событие `finish` и слот `finished` вместо нулей.',
					'Пример объявления окончания своим `role="status"`. Перезапуск — кнопка ↻ над превью.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCountdown'],
				state: { isOpen: false },
				script: 'const to = Date.now() + 3000',
				omit: ['to', 'format'],
			}),
		},
		controls: { include: ['variant', 'layout'] },
	},
	args: { label: 'До открытия регистрации', onFinish: fn() },
	render: args => ({
		components: { BaseCountdown },
		setup: useStorySetup(args, { state: { isOpen: false }, setup: () => ({ to: Date.now() + 3000 }), slots: ['to', 'format'] }),
		template,
	}),
	play: async ({ canvas, canvasElement, args }) => {
		await expect(displayText(canvasElement.querySelectorAll('.base-countdown__value')[1])).toMatch(/^0[1-3]$/)
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Можно регистрироваться'), {
			timeout: STORY_WAIT_TIMEOUT + 4000,
		})
		await expect(within(canvas.getByRole('timer')).getByText('Регистрация открыта')).toBeVisible()
		await expect(args.onFinish).toHaveBeenCalledOnce()
	},
}
