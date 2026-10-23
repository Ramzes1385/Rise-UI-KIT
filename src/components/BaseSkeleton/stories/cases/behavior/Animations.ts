import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseSkeleton.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseSkeleton from '../../../ui/BaseSkeleton.vue'

const motion = motionPresetsStory({
	item: `
		<Transition name="base-skeleton" mode="out-in">
			<div v-if="isLoading" key="loading" class="story-stack" style="gap: 8px;" aria-busy="true">
				<BaseSkeleton v-bind="args" shape="text" width="80%" />
				<BaseSkeleton v-bind="args" shape="text" width="50%" :is-animated="false" is-pulse />
			</div>
			<div v-else key="content" class="story-stack" style="gap: 8px;">
				<span>Анна Смирнова</span>
				<span class="story-label">Дизайнер</span>
			</div>
		</Transition>
	`,
	components: { BaseButton, BaseSkeleton },
	imports: ['BaseSkeleton'],
	state: { isLoading: true },
	action: 'isLoading = !isLoading',
	trigger: 'Переключить загрузку',
	slots: ['shape', 'width', 'isAnimated', 'isPulse'],
	omit: ['shape', 'width', 'isAnimated', 'isPulse'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['sizeScale', 'color'] },
		docs: {
			description: {
				story: [
					'Шиммер (`isAnimated`, по умолчанию) и мерцание (`isPulse`) в четырёх пресетах движения. Период петель — кратное токена',
					'`--rise-duration-loop` (1s; пресеты его не обнуляют): шиммер — 1.5, мерцание — 2. Петли декоративные: при системной',
					"настройке «уменьшить движение», в пресете `none` и при `reducedMotion: 'always'` скелетон стоит без движения. Смену скелетона на содержимое показывает приложение",
					'(`v-if`/`v-else`); плавная смена — обёртка `<Transition name="base-skeleton" mode="out-in">`: скелетон гаснет',
					'(`--rise-duration-fast`), содержимое проявляется (`--rise-duration`). Выключить переходы —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`: содержимое встаёт сразу.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const toggle = canvas.getByRole('button', { name: 'Переключить загрузку' })
		await userEvent.click(toggle)
		await waitFor(() => expect(canvas.getAllByText('Анна Смирнова')).toHaveLength(4))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-skeleton')).toHaveLength(0))
		await userEvent.click(toggle)
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-skeleton')).toHaveLength(8))
		const none = canvasElement.querySelector('[data-rise-motion="none"] .base-skeleton--animated')!
		await expect(getComputedStyle(none).getPropertyValue('--rise-motion-loop-state').trim()).toBe('paused')
	},
}
