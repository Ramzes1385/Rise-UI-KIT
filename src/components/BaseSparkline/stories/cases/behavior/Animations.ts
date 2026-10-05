import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseSparkline.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseSparkline from '../../../ui/BaseSparkline.vue'
import { REVENUE, REVENUE_DIP, REVENUE_SPIKE } from '../../shared'

const motion = motionPresetsStory({
	item: `
		<div class="story-stack" style="padding-top: 40px">
			<BaseSparkline v-bind="args" :values="datasets[step]" variant="line" />
			<BaseSparkline v-bind="args" :values="datasets[step]" variant="area" />
			<BaseSparkline v-bind="args" :values="datasets[step]" variant="bar" />
		</div>
	`,
	components: { BaseButton, BaseSparkline },
	imports: ['BaseSparkline'],
	state: { step: 0, datasets: [REVENUE, REVENUE_DIP, REVENUE_SPIKE] },
	action: 'step = (step + 1) % datasets.length',
	trigger: 'Новые данные',
	slots: ['values', 'variant'],
	omit: ['values', 'variant'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['height', 'markColor', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Новые данные в четырёх пресетах движения: «Новые данные» переключает три набора по кругу, и точки линии, заливка,',
					'точка последнего значения и высота столбиков плавно переходят к новым значениям (`useTween`, длительность',
					'`--rise-duration-xslow`, замедление к концу). Набор другой длины встаёт сразу — переходить не из чего. Сводка для',
					'скринридера сразу описывает новые данные.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`:",
					'график встаёт сразу; системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const lines = () => new Set([...canvasElement.querySelectorAll('.base-sparkline__line')].map(line => line.getAttribute('d')))
		const before = [...lines()][0]

		await userEvent.click(canvas.getByRole('button', { name: 'Новые данные' }))
		await expect(canvas.getAllByRole('img', { name: 'Выручка за год, тыс. ₽: от 142 до 214, последнее значение 196' })).toHaveLength(12)
		await waitFor(() => expect(lines().size).toBe(1))
		await expect([...lines()][0]).not.toBe(before)
	},
}
