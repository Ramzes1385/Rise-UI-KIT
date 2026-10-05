import { SHORT } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDescriptions.stories'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'
import BaseDescriptions from '../../../ui/BaseDescriptions.vue'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="fade">
			<BaseDescriptions v-bind="args" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseDescriptions },
	imports: ['BaseAnimation', 'BaseDescriptions'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { items: SHORT, columns: 1 },
	parameters: {
		controls: { include: ['variant', 'layout', 'isCopyable'] },
		docs: {
			description: {
				story: [
					'Своего движения у списка нет — в колонках четырёх пресетов движения он появляется через `BaseAnimation` (`fade`);',
					'«Повторить» монтирует его заново. После «Копировать» иконка сменяется на галочку и обратно с масштабом (`enter-pop`).',
					'Длительности — токены `--rise-duration*`, `--rise-ease*`, масштаб — `--rise-motion-scale-from`, поэтому атрибут',
					"`data-rise-motion` меняет движение всей области. Выключить — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-descriptions')).toHaveLength(4))
		for (const list of canvasElement.querySelectorAll('.base-descriptions')) await waitFor(() => expect(list).toBeVisible())
	},
}
