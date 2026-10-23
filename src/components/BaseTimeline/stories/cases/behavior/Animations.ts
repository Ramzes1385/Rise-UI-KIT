import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseTimeline.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseTimeline from '../../../ui/BaseTimeline.vue'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="slide-up">
			<BaseTimeline v-bind="args" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseTimeline },
	imports: ['BaseAnimation', 'BaseTimeline'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'currentId', 'orientation'] },
		docs: {
			description: {
				story: [
					'Своего движения у ленты нет: события не меняются на глазах, а дописываются приложением. В колонках четырёх',
					'пресетов движения лента появляется через `BaseAnimation` (`slide-up`); «Повторить» монтирует её заново.',
					'Длительность и сдвиг — токены `--rise-duration*` и `--rise-motion-distance`, поэтому атрибут `data-rise-motion`',
					"меняет движение всей области. Выключить — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-timeline')).toHaveLength(4))
		for (const timeline of canvasElement.querySelectorAll('.base-timeline')) await waitFor(() => expect(timeline).toBeVisible())
		await expect(canvas.getAllByText('Передан в доставку')).toHaveLength(4)
	},
}
