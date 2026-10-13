import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import type meta from '../../BaseDashboardGrid.stories'
import BaseDashboardGrid from '../../../ui/BaseDashboardGrid.vue'

const layoutA = [
	{ id: 'revenue', label: 'Выручка', x: 0, y: 0, w: 2, h: 1 },
	{ id: 'orders', label: 'Заказы', x: 2, y: 0, w: 2, h: 1 },
	{ id: 'traffic', label: 'Трафик', x: 0, y: 1, w: 4, h: 1 },
]

const layoutB = [
	{ id: 'revenue', label: 'Выручка', x: 0, y: 1, w: 2, h: 1 },
	{ id: 'orders', label: 'Заказы', x: 2, y: 1, w: 2, h: 1 },
	{ id: 'traffic', label: 'Трафик', x: 0, y: 0, w: 4, h: 1 },
]

const motion = motionPresetsStory({
	item: `
		<BaseDashboardGrid v-bind="args" :layout="swapped ? layoutB : layoutA" :cols="4" :row-height="40" :gap="8" label="Сетка %preset%" />
	`,
	state: { swapped: false, layoutA, layoutB },
	action: 'swapped = !swapped',
	trigger: 'Переставить',
	components: { BaseDashboardGrid, BaseButton },
	imports: ['BaseDashboardGrid'],
	omit: ['layout'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: [
					'Перестановка виджетов в четырёх пресетах движения: кнопка меняет раскладку, виджеты плавно переезжают на новые места.',
					'Позиция и размер меняются через `transform`, `width` и `height` за `--rise-duration`; при переносе указателем виджет сразу идёт за курсором,',
					'а «призрак» места и соседи переезжают плавно. В `none` и при «уменьшить движение» виджеты встают на место сразу.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const widget = canvas.getAllByRole('group', { name: 'Выручка' })[0]
		const before = widget.style.transform
		await userEvent.click(canvas.getByRole('button', { name: 'Переставить' }))
		await waitFor(() => expect(widget.style.transform).not.toBe(before))
		await userEvent.click(canvas.getByRole('button', { name: 'Переставить' }))
		await waitFor(() => expect(widget.style.transform).toBe(before))
	},
}
