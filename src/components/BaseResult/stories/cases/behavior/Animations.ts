import { MESSAGES } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseResult.stories'
import BaseResult from '../../../ui/BaseResult.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="fade">
			<BaseResult v-bind="args" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseResult },
	imports: ['BaseAnimation', 'BaseResult'],
	slots: [],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['status', 'variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Результат статичен: своего движения у него нет. Здесь — появление через BaseAnimation (`fade`)',
					'в четырёх пресетах движения: длительность — `--rise-duration`.',
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
		await waitFor(() => expect(canvas.getAllByText(MESSAGES.success.title)).toHaveLength(4))
		for (const title of canvas.getAllByText(MESSAGES.success.title)) await waitFor(() => expect(title).toBeVisible())
	},
}
