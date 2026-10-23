import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import type meta from '../../BaseAvatarCropper.stories'
import BaseAvatarCropper from '../../../ui/BaseAvatarCropper.vue'

const motion = motionPresetsStory({
	item: `
		<BaseAvatarCropper v-bind="args" :crop="isNear ? { x: 275, y: 125, size: 250 } : { x: 150, y: 0, size: 500 }" />
	`,
	components: { BaseAvatarCropper, BaseButton },
	imports: ['BaseAvatarCropper'],
	state: { isNear: false },
	action: 'isNear = !isNear',
	trigger: 'Сменить кадр',
	omit: ['crop'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { size: 200 },
	parameters: {
		controls: { include: ['shape', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Шаг кадра в четырёх пресетах движения: «Сменить кадр» задаёт новый кадр через `v-model:crop`, фото переезжает и',
					'масштабируется плавно. Так же — шаги клавишами (стрелки, «+», «−», «0») и `reset()`; перетаскивание, колёсико и',
					'ползунок двигают фото сразу, без перехода. Положение фото — `transform`, длительность — `--rise-duration`, кривая —',
					"`--rise-ease-out`. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const sliders = canvas.getAllByRole('slider', { name: 'Масштаб' })
		for (const slider of sliders) await waitFor(() => expect(slider).not.toHaveAttribute('aria-disabled', 'true'))
		const trigger = canvas.getByRole('button', { name: 'Сменить кадр' })
		trigger.focus()
		await userEvent.keyboard('{Enter}')
		for (const slider of sliders) await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '2'))
		await userEvent.click(trigger)
		for (const slider of sliders) await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '1'))
	},
}
