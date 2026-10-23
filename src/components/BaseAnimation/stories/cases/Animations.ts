import type meta from '../BaseAnimation.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAnimation from '../../ui/BaseAnimation.vue'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" v-bind="args">
			<div class="story-frame">Заказ оформлен</div>
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton },
	imports: ['BaseAnimation'],
	slots: ['default', 'show', 'isGroup', 'tag'],
	omit: ['default', 'show', 'isGroup', 'tag'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { name: 'slide-up' },
	parameters: {
		controls: { include: ['name', 'mode'] },
		docs: {
			description: {
				story: [
					'Одна и та же анимация в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`.',
					'«Повторить» монтирует блок заново. Длительности, сдвиг и масштаб берутся из токенов `--rise-duration*`,',
					'`--rise-motion-distance` и `--rise-motion-scale-from`, поэтому атрибут `data-rise-motion` на контейнере меняет',
					"движение всей области. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или",
					"`reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByText('Заказ оформлен')).toHaveLength(4))
		for (const block of canvas.getAllByText('Заказ оформлен')) await waitFor(() => expect(block).toBeVisible())
	},
}
