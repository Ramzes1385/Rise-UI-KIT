import { recentDays } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseHeatmap.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseHeatmap from '../../../ui/BaseHeatmap.vue'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseHeatmap
			v-bind="args"
			:data="days.map(day => ({ date: day.date, value: (day.value * (step + 1)) % 11 }))"
			:weeks="12" />
	`,
	components: { BaseButton, BaseHeatmap },
	imports: ['BaseHeatmap'],
	state: { step: 0, days: recentDays(84) },
	action: 'step = (step + 1) % 3',
	trigger: 'Новые данные',
	slots: ['data', 'weeks'],
	omit: ['data', 'weeks'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'markColor', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Новые данные в четырёх пресетах движения: «Новые данные» переключает три набора по кругу, и ячейки плавно меняют',
					'насыщенность — цвет заливки переходит за `--rise-duration-slow` (`--rise-ease`); раскладка календаря не меняется.',
					'Сводка для скринридера сразу описывает новые данные.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`:",
					'ячейки перекрашиваются сразу; системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const summaries = () => new Set(canvas.getAllByRole('img').map(region => region.getAttribute('aria-label')))
		const before = [...summaries()][0]

		await userEvent.click(canvas.getByRole('button', { name: 'Новые данные' }))
		await waitFor(() => expect([...summaries()]).not.toContain(before))
		await expect(summaries().size).toBe(1)
		await expect(canvasElement.querySelectorAll('.base-heatmap')).toHaveLength(4)
	},
}
