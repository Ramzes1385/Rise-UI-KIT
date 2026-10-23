import type meta from '../../BaseChip.stories'
import BaseChip from '../../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<div style="padding: 12px;">
			<BaseChip v-bind="args" :content="count" is-hidden-on-zero>
				<BaseButton variant="outline" aria-label="Уведомления" :padding="{ x: 5, y: 5 }"><BaseIcon name="inbox" /></BaseButton>
			</BaseChip>
		</div>
	`,
	components: { BaseChip, BaseButton, BaseIcon },
	imports: ['BaseChip', 'BaseIcon'],
	state: { count: 0 },
	action: 'count = (count + 1) % 4',
	trigger: 'Следующее значение',
	slots: ['default', 'content', 'isHiddenOnZero'],
	omit: ['default', 'content', 'isHiddenOnZero'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'placement', 'hasOverflow', 'maxValue', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Счётчик 0 → 1 → 2 → 3 → 0 в четырёх пресетах движения. Индикатор появляется и исчезает с масштабом и прозрачностью',
					'(`--rise-duration`, `--rise-duration-fast`, кривая появления — `--rise-ease-spring`), новое значение «выпрыгивает»',
					'на том же узле (фокус не теряется); глубина масштаба считается от `--rise-motion-scale-from`. В пресете `none` и при «уменьшить движение» —',
					"сразу конечное состояние. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или",
					"`reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const next = canvas.getByRole('button', { name: 'Следующее значение' })
		await userEvent.click(next)
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-chip__badge')).toHaveLength(4))
		for (const badge of canvasElement.querySelectorAll('.base-chip__badge')) await expect(badge).toHaveTextContent('1')
		await userEvent.click(next)
		await userEvent.click(next)
		await userEvent.click(next)
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-chip__badge')).toHaveLength(0))
	},
}
