import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageCompare.stories'
import { motionPresetsStory } from '@/stories/helpers'
import BaseImageCompare from '../../../ui/BaseImageCompare.vue'

const motion = motionPresetsStory({
	item: `
		<BaseImageCompare v-bind="args" :position="isNear ? 20 : 80" />
	`,
	components: { BaseImageCompare, BaseButton },
	imports: ['BaseImageCompare'],
	state: { isNear: false },
	action: 'isNear = !isNear',
	trigger: 'Сдвинуть границу',
	omit: ['position'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		maxWidth: 1200,
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Шаг границы в четырёх пресетах движения: «Сдвинуть границу» задаёт новое положение через `v-model:position`, линия',
					'с ручкой и обрезка «до» переезжают плавно. Так же — шаг клавишами и щелчок в любом месте; при перетаскивании граница',
					'идёт за указателем без перехода. Линия и ручка двигаются `transform: translateX()`, обрезка — `clip-path: inset()`;',
					'длительность — `--rise-duration-slow`, кривая — `--rise-ease-emphasized`. Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Сдвинуть границу' })
		await userEvent.click(trigger)
		for (const slider of canvas.getAllByRole('slider')) await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '20'))
		await userEvent.click(trigger)
		for (const slider of canvas.getAllByRole('slider')) await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '80'))
	},
}
