import type meta from '../Motion.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<div :key="replay" class="story-row">
			<BaseAnimation name="fade"><span class="story-frame">fade</span></BaseAnimation>
			<BaseAnimation name="slide-up"><span class="story-frame">slide-up</span></BaseAnimation>
			<BaseAnimation name="scale"><span class="story-frame">scale</span></BaseAnimation>
		</div>
	`,
	components: { BaseAnimation, BaseButton },
	imports: ['BaseAnimation'],
})

export const Enter: StoryObj<typeof meta> = {
	name: 'Появление',
	parameters: {
		docs: {
			description: {
				story: [
					'BaseAnimation в каждом пресете: появление `fade`, `slide-up` и `scale`. Сдвиг — `--rise-motion-distance`,',
					'начальный масштаб — `--rise-motion-scale-from`; в `none` блоки появляются сразу. Свои переходы на тех же',
					'токенах дают миксины `enter-fade`, `enter-slide`, `enter-scale` и `enter-pop` (DESIGN_SYSTEM, «Движение»).',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByText('slide-up')).toHaveLength(4))
		for (const block of canvas.getAllByText('scale')) await waitFor(() => expect(block).toBeVisible())
	},
}
