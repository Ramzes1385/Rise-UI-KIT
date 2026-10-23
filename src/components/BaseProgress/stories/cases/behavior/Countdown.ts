import { expect } from 'storybook/test'
import type meta from '../../BaseProgress.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseProgress from '../../../ui/BaseProgress.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseProgress v-bind="args" :value="100" aria-label="Закрытие уведомления" />
	</div>
`

export const Countdown: StoryObj<typeof meta> = {
	args: { countdown: 8000, isPaused: true },
	parameters: {
		docs: {
			description: {
				story: [
					'Обратный отсчёт: полоса сама сжимается от полной до пустой за `countdown` мс (CSS-анимация `transform`, без таймеров).',
					'`isPaused` ставит отсчёт на паузу (в истории включена, чтобы кадр был неподвижным), перезапуск — сменой `key`.',
					'При «уменьшить движение» полоса остаётся полной. `aria-valuenow` не выставляется.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseProgress'], omit: ['default', 'shape', 'value'] }),
		},
		controls: { include: ['sizeScale', 'color', 'countdown', 'isPaused'] },
	},
	render: args => ({
		components: { BaseProgress },
		setup: useStorySetup(args, { slots: ['default', 'shape', 'value'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const progressbar = canvas.getByRole('progressbar')
		await expect(progressbar).toHaveClass('base-progress--countdown', 'base-progress--paused')
		await expect(progressbar).not.toHaveAttribute('aria-valuenow')
		const fill = progressbar.querySelector('.base-progress__fill') as HTMLElement
		await expect(fill.style.getPropertyValue('--progress-countdown')).toBe('8000ms')
	},
}
