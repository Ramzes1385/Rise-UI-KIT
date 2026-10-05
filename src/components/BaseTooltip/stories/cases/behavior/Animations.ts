import { docsFrame } from '../../shared'
import type meta from '../../BaseTooltip.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTooltip from '../../../ui/BaseTooltip.vue'
import { motionPresetsStory } from '@/stories/helpers'
import { expect, screen, waitFor } from 'storybook/test'

const motion = motionPresetsStory({
	item: `
		<div style="padding-top: 48px;">
			<BaseTooltip v-bind="args" text="Подсказка" :is-always-visible="isShown">
				<BaseButton variant="outline">Цель</BaseButton>
			</BaseTooltip>
		</div>
	`,
	state: { isShown: true },
	action: 'isShown = !isShown',
	trigger: 'Показать или скрыть',
	components: { BaseTooltip, BaseButton },
	imports: ['BaseTooltip'],
	slots: [],
	omit: ['text', 'isAlwaysVisible'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { animation: 'scale' },
	parameters: {
		controls: { include: ['animation', 'position', 'variant'] },
		docs: {
			description: {
				story: [
					'Появление и уход подсказки в четырёх пресетах движения: пресет берётся из области триггера (`data-rise-motion`).',
					'Проп `animation`: `fade` (по умолчанию) — прозрачность, `scale` — масштаб от триггера, `slide` — сдвиг от триггера',
					'на `--rise-motion-distance`, `pop` — масштаб с пружиной, `none` — сразу. Длительность — `--rise-duration-fast`;',
					'в `none` и при «уменьшить движение» подсказка появляется сразу.',
				].join('\n'),
			},
			...docsFrame(220),
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(screen.getAllByRole('tooltip')).toHaveLength(4))
		await expect(screen.getAllByRole('tooltip')[0].closest('[data-rise-motion]')).not.toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: 'Показать или скрыть' }))
		await waitFor(() => expect(screen.queryAllByRole('tooltip')).toHaveLength(0))
		await userEvent.click(canvas.getByRole('button', { name: 'Показать или скрыть' }))
		await waitFor(() => expect(screen.getAllByRole('tooltip')).toHaveLength(4))
	},
}
