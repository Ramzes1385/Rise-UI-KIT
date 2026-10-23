import type meta from '../../BaseEmpty.stories'
import { expect, waitFor } from 'storybook/test'
import BaseEmpty from '../../../ui/BaseEmpty.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="scale">
			<BaseEmpty v-bind="args" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseEmpty },
	imports: ['BaseAnimation', 'BaseEmpty'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['title', 'description', 'variant'] },
		docs: {
			description: {
				story: [
					'Своего движения у пустого состояния нет — в колонках четырёх пресетов движения оно появляется через `BaseAnimation`',
					'(`scale`); «Повторить» монтирует его заново. Длительность и масштаб — токены `--rise-duration*`, `--rise-ease*` и',
					'`--rise-motion-scale-from`, поэтому атрибут `data-rise-motion` меняет движение всей области. Выключить —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-empty')).toHaveLength(4))
		for (const empty of canvasElement.querySelectorAll('.base-empty')) await waitFor(() => expect(empty).toBeVisible())
	},
}
