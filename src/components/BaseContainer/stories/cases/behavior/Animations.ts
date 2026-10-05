import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseContainer.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseContainer from '../../../ui/BaseContainer.vue'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="fade">
			<BaseContainer v-bind="args">
				<div style="padding: 16px; border: 1px dashed var(--rise-border-accented); border-radius: 8px">Отчёт за сентябрь</div>
			</BaseContainer>
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseContainer },
	imports: ['BaseAnimation', 'BaseContainer'],
	slots: [],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['size', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Контейнер статичен: своего движения у него нет — он задаёт только ширину и отступы. Здесь — появление',
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
		await waitFor(() => expect(canvas.getAllByText('Отчёт за сентябрь')).toHaveLength(4))
		for (const text of canvas.getAllByText('Отчёт за сентябрь')) await waitFor(() => expect(text).toBeVisible())
	},
}
