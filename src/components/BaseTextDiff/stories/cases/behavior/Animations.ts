import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseTextDiff.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseTextDiff from '../../../ui/BaseTextDiff.vue'
import { SHORT_AFTER, SHORT_BEFORE } from '../../shared'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="slide-up">
			<BaseTextDiff v-bind="args" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseTextDiff },
	imports: ['BaseAnimation', 'BaseTextDiff'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { before: SHORT_BEFORE, after: SHORT_AFTER, label: 'Карточка товара' },
	parameters: {
		controls: { include: ['before', 'after', 'mode', 'variant'] },
		docs: {
			description: {
				story: [
					'Своего движения у сравнения нет — в колонках четырёх пресетов движения оно появляется через `BaseAnimation`',
					'(`slide-up`); «Повторить» монтирует его заново. Длительности и сдвиг — токены `--rise-duration*`, `--rise-ease*`,',
					'`--rise-motion-distance`, поэтому атрибут `data-rise-motion` меняет движение всей области. Выключить —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-text-diff')).toHaveLength(4))
		for (const diff of canvasElement.querySelectorAll('.base-text-diff')) await waitFor(() => expect(diff).toBeVisible())
	},
}
