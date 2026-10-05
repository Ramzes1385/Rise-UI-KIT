import BaseFab from '../../../ui/BaseFab.vue'
import type meta from '../../BaseFab.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<div style="position: relative; height: 96px;">
			<BaseAnimation :key="replay" name="scale">
				<BaseFab v-bind="args" />
			</BaseAnimation>
		</div>
	`,
	components: { BaseAnimation, BaseFab, BaseButton },
	imports: ['BaseAnimation', 'BaseFab'],
	slots: [],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'isExtended', 'position', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Своего движения у кнопки нет, кроме смены цвета при наведении (`--rise-duration-fast`). Появление на экране —',
					'через BaseAnimation (`scale`): длительность и масштаб — `--rise-duration`, `--rise-motion-scale-from`, в четырёх',
					"пресетах. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Новая задача' })).toHaveLength(4))
		for (const fab of canvas.getAllByRole('button', { name: 'Новая задача' })) await waitFor(() => expect(fab).toBeVisible())
	},
}
