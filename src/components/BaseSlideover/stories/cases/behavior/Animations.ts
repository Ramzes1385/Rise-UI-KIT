import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseSlideover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseSlideover from '../../../ui/BaseSlideover.vue'

const motion = motionPresetsStory({
	item: `
		<div class="story-frame" style="height: 200px;">
			<BaseSlideover v-bind="args" v-model:is-open="isOpen" is-contained title="Панель">
				<BaseText>Появление и уход.</BaseText>
			</BaseSlideover>
		</div>
	`,
	state: { isOpen: true },
	action: 'isOpen = !isOpen',
	trigger: 'Открыть или закрыть',
	components: { BaseSlideover, BaseButton, BaseText },
	imports: ['BaseSlideover', 'BaseText'],
	slots: [...SHOWCASE_OWN_ARGS],
	omit: [...SHOWCASE_OWN_ARGS],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { animation: 'slide' },
	parameters: {
		controls: { include: ['animation', 'side'] },
		docs: {
			description: {
				story: [
					'Появление и уход панели в четырёх пресетах движения. Проп `animation`: `slide` (по умолчанию) — въезд со своего края',
					'на всю ширину панели, `fade` — прозрачность, `scale` — масштаб от своего края, `pop` — масштаб с пружиной',
					'(перелёт — в `expressive`), `none` — сразу. Длительности — токены движения; в `none` и при «уменьшить движение» панель появляется сразу.',
					"Для всего приложения — `createUiKitPlugin({ defaults: { BaseSlideover: { animation: 'fade' } } })`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(canvas.getAllByRole('dialog')).toHaveLength(4))
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть или закрыть' }))
		await waitFor(() => expect(canvas.queryAllByRole('dialog')).toHaveLength(0))
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть или закрыть' }))
		await waitFor(() => expect(canvas.getAllByRole('dialog')).toHaveLength(4))
	},
}
