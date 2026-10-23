import type meta from '../../BaseIcon.stories'
import BaseIcon from '../../../ui/BaseIcon.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="scale">
			<BaseIcon v-bind="args" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseIcon },
	imports: ['BaseAnimation', 'BaseIcon'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['name', 'rotate', 'isFlipX', 'isFlipY'] },
		docs: {
			description: {
				story: [
					'Своего появления у иконки нет — в колонках четырёх пресетов движения она появляется через `BaseAnimation` (`scale`);',
					'«Повторить» монтирует её заново. Поворот и отражение (`rotate`, `isFlipX`, `isFlipY` в Controls) и смена цвета идут',
					'плавно: переход по `transform` и `color` на токенах `--rise-duration` и `--rise-ease`. Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-icon')).toHaveLength(4))
		for (const icon of canvasElement.querySelectorAll('.base-icon')) await waitFor(() => expect(icon).toBeVisible())
	},
}
