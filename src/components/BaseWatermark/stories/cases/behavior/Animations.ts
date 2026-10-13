import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseWatermark.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseWatermark from '../../../ui/BaseWatermark.vue'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="fade">
			<BaseWatermark v-bind="args">
				<div class="story-frame story-medium story-stack">
					<strong>Квартальный отчёт</strong>
					<span>Выручка выросла на 12 %.</span>
				</div>
			</BaseWatermark>
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseWatermark },
	imports: ['BaseAnimation', 'BaseWatermark'],
	slots: [],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['content', 'opacity'] },
		docs: {
			description: {
				story: [
					'Знак не двигается: он лежит поверх содержимого и не принимает действий, анимировать нечего. Здесь — появление',
					'обёрнутого содержимого вместе с узором через BaseAnimation (`fade`) в четырёх пресетах движения:',
					'длительность — `--rise-duration`.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByText('Квартальный отчёт')).toHaveLength(4))
		for (const title of canvas.getAllByText('Квартальный отчёт')) await waitFor(() => expect(title).toBeVisible())
	},
}
