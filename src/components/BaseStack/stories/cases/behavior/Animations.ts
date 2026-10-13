import type meta from '../../BaseStack.stories'
import { expect, waitFor } from 'storybook/test'
import BaseStack from '../../../ui/BaseStack.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="fade">
			<BaseStack v-bind="args">
				<div v-for="n in 3" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">Блок {{ n }}</div>
			</BaseStack>
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseStack },
	imports: ['BaseAnimation', 'BaseStack'],
	slots: [],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['direction', 'gap', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Стопка статична: своего движения у неё нет — она только выстраивает элементы с промежутками. Здесь — появление',
					'через BaseAnimation (`fade`) в четырёх пресетах движения: длительность — `--rise-duration`.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByText('Блок 1')).toHaveLength(4))
		for (const block of canvas.getAllByText('Блок 1')) await waitFor(() => expect(block).toBeVisible())
	},
}
