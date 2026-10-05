import type meta from '../../BaseUser.stories'
import BaseUser from '../../../ui/BaseUser.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="slide-up">
			<BaseUser v-bind="args" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseUser },
	imports: ['BaseAnimation', 'BaseUser'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['name', 'description', 'isOnline', 'orientation', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Своего движения у блока нет (фото аватара проявляется движением BaseAvatar) — в колонках четырёх пресетов движения',
					'он появляется через `BaseAnimation` (`slide-up`); «Повторить» монтирует его заново. Длительность и сдвиг — токены',
					'`--rise-duration*` и `--rise-motion-distance`, поэтому атрибут `data-rise-motion` меняет движение всей области.',
					"Выключить — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка",
					'«уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByText('Анна Смирнова')).toHaveLength(4))
		for (const name of canvas.getAllByText('Анна Смирнова')) await waitFor(() => expect(name).toBeVisible())
	},
}
