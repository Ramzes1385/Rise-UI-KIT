import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseSplitButton.stories'
import { motionPresetsStory } from '@/stories/helpers'
import BaseSplitButton from '../../../ui/BaseSplitButton.vue'

const motion = motionPresetsStory({
	item: `
		<BaseSplitButton v-bind="args" :is-loading="isLoading" />
	`,
	components: { BaseButton, BaseSplitButton },
	imports: ['BaseSplitButton'],
	state: { isLoading: false },
	action: 'isLoading = !isLoading',
	trigger: 'Переключить загрузку',
	slots: ['isLoading'],
	omit: ['isLoading'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Своего движения у кнопки с меню нет — его дают части: загрузка основной кнопки (содержимое гаснет, спиннер',
					'проявляется — `--rise-duration-fast`, `--rise-duration`, `--rise-ease*`), цвета при наведении и появление меню',
					'(BaseDropdownMenu). Здесь — загрузка в четырёх пресетах движения; спиннер крутится всегда, его период —',
					"`calc(var(--rise-duration-loop) * 0.8)`. Выключить переходы — `createUiKitPlugin({ motion: 'none' })` или",
					"`reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const toggle = canvas.getByRole('button', { name: 'Переключить загрузку' })
		await userEvent.click(toggle)
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-split-button__main[aria-busy="true"]')).toHaveLength(4))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-button__loader')).toHaveLength(4))
		await userEvent.click(toggle)
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-button__loader')).toHaveLength(0))
	},
}
