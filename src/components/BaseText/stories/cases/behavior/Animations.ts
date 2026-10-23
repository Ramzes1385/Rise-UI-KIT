import type meta from '../../BaseText.stories'
import BaseText from '../../../ui/BaseText.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="slide-up">
			<BaseText v-bind="args">Заказ оформлен</BaseText>
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseText },
	imports: ['BaseAnimation', 'BaseText'],
	slots: ['default'],
	omit: ['default'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['tag', 'weight', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Своего движения у текста нет — в колонках четырёх пресетов движения он появляется через `BaseAnimation`',
					'(`slide-up`); «Повторить» монтирует его заново. Длительность и сдвиг — токены `--rise-duration*` и `--rise-motion-distance`,',
					"поэтому атрибут `data-rise-motion` меняет движение всей области. Выключить — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByText('Заказ оформлен')).toHaveLength(4))
		for (const text of canvas.getAllByText('Заказ оформлен')) await waitFor(() => expect(text).toBeVisible())
	},
}
