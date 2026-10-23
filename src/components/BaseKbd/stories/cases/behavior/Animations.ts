import BaseKbd from '../../../ui/BaseKbd.vue'
import type meta from '../../BaseKbd.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="slide-up">
			<span class="story-row" style="gap: 4px;"><BaseKbd v-bind="args" value="ctrl" platform="other" /> + <BaseKbd v-bind="args" /></span>
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseKbd },
	imports: ['BaseAnimation', 'BaseKbd'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['value', 'variant'] },
		docs: {
			description: {
				story: [
					'Своего движения у клавиши нет — в колонках четырёх пресетов движения сочетание появляется через `BaseAnimation`',
					'(`slide-up`); «Повторить» монтирует его заново. Длительность и сдвиг — токены `--rise-duration*` и `--rise-motion-distance`,',
					"поэтому атрибут `data-rise-motion` меняет движение всей области. Выключить — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('kbd')).toHaveLength(8))
		for (const key of canvasElement.querySelectorAll('kbd')) await waitFor(() => expect(key).toBeVisible())
	},
}
