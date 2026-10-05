import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BaseScrollArea.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseScrollArea from '../../../ui/BaseScrollArea.vue'

const motion = motionPresetsStory({
	item: `
		<BaseScrollArea v-bind="args" :scrollbar="isBarShown ? 'always' : 'hover'" style="border: 1px solid var(--rise-border)">
			<p v-for="row in 12" :key="row" style="margin: 8px 16px">Отгрузка № {{ 1200 + row }}</p>
		</BaseScrollArea>
	`,
	state: { isBarShown: false },
	action: 'isBarShown = !isBarShown',
	trigger: 'Показать или скрыть полосу',
	components: { BaseScrollArea, BaseButton },
	imports: ['BaseScrollArea'],
	slots: [],
	omit: ['scrollbar'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { ariaLabel: undefined, maxHeight: 160 },
	parameters: {
		controls: { include: ['maxHeight', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Своего пропа `animation` у области нет: прокрутка и перетаскивание ползунка идут за пальцем без сглаживания.',
					'Движется только появление полосы — прозрачность за `--rise-duration` при наведении, прокрутке и фокусе;',
					'ползунок меняет цвет за `--rise-duration-fast`. Кнопка переключает `scrollbar` между `hover` и `always` в четырёх пресетах;',
					'в `none` и при «уменьшить движение» полоса появляется сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvasElement, canvas, userEvent }) => {
		const roots = () => [...canvasElement.querySelectorAll('.base-scroll-area')]

		await waitFor(() => expect(canvasElement.querySelectorAll('.base-scroll-area__bar')).toHaveLength(4))
		await userEvent.click(canvas.getByRole('button', { name: 'Показать или скрыть полосу' }))
		await waitFor(() => roots().forEach(root => expect(root).toHaveClass('base-scroll-area--scrollbar-always')))
		for (const bar of canvasElement.querySelectorAll<HTMLElement>('.base-scroll-area__bar'))
			await waitFor(() => expect(getComputedStyle(bar).opacity).toBe('1'))
		await userEvent.click(canvas.getByRole('button', { name: 'Показать или скрыть полосу' }))
		await waitFor(() => roots().forEach(root => expect(root).toHaveClass('base-scroll-area--scrollbar-hover')))
	},
}
