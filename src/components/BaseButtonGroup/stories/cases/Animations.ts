import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseButtonGroup.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'
import BaseButtonGroup from '../../ui/BaseButtonGroup.vue'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="scale">
			<BaseButtonGroup v-bind="args">
				<BaseButton variant="outline">День</BaseButton>
				<BaseButton variant="outline">Неделя</BaseButton>
			</BaseButtonGroup>
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButtonGroup, BaseButton },
	imports: ['BaseAnimation', 'BaseButtonGroup'],
	slots: [],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['orientation', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'У группы нет своего движения: кнопки внутри меняют цвет при наведении (`--rise-duration-fast`). Здесь — появление',
					'через BaseAnimation (`scale`) в четырёх пресетах: длительность и масштаб — `--rise-duration`, `--rise-motion-scale-from`.',
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
		await waitFor(() => expect(canvas.getAllByRole('group', { name: 'Период' })).toHaveLength(4))
		for (const group of canvas.getAllByRole('group', { name: 'Период' })) await waitFor(() => expect(group).toBeVisible())
	},
}
