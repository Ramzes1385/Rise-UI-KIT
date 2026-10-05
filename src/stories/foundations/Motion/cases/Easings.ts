import type meta from '../Motion.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<div :key="replay" class="fnd-motion-tracks">
			<div class="fnd-motion-track"><span class="fnd-motion-track__dot" style="--fnd-ease: var(--rise-ease);"></span><code>--rise-ease</code></div>
			<div class="fnd-motion-track"><span class="fnd-motion-track__dot" style="--fnd-ease: var(--rise-ease-emphasized);"></span><code>--rise-ease-emphasized</code></div>
			<div class="fnd-motion-track"><span class="fnd-motion-track__dot" style="--fnd-ease: var(--rise-ease-spring);"></span><code>--rise-ease-spring</code></div>
		</div>
	`,
	components: { BaseButton },
	imports: [],
})

export const Easings: StoryObj<typeof meta> = {
	name: 'Кривые',
	parameters: {
		docs: {
			description: {
				story: [
					'Точка проходит путь за `--rise-duration-xslow` с каждой кривой. `--rise-ease` — эффекты (прозрачность, цвет),',
					'без перелёта в любом пресете. `--rise-ease-emphasized` — крупное движение. `--rise-ease-spring` — пружина',
					'для transform: в `expressive` это `linear()` с перелётом около 5 %, в остальных пресетах — плавная кривая.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByText('--rise-ease-spring')).toHaveLength(4))
	},
}
