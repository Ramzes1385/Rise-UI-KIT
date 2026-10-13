import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseGrid.stories'
import BaseGrid from '../../../ui/BaseGrid.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseGridItem } from '@components/BaseGrid'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="fade">
			<BaseGrid v-bind="args" :cols="4">
				<BaseGridItem v-for="n in 4" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">Ячейка {{ n }}</BaseGridItem>
			</BaseGrid>
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseGrid, BaseGridItem },
	imports: ['BaseAnimation', 'BaseGrid', 'BaseGridItem'],
	slots: [],
	omit: ['cols'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['gap', 'rowGap', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Сетка статична: своего движения у неё нет — она только раскладывает ячейки. Здесь — появление',
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
		await waitFor(() => expect(canvas.getAllByText('Ячейка 1')).toHaveLength(4))
		for (const cell of canvas.getAllByText('Ячейка 1')) await waitFor(() => expect(cell).toBeVisible())
	},
}
