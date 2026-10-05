import type meta from '../../BaseButton.stories'
import { expect, waitFor } from 'storybook/test'
import BaseButton from '../../../ui/BaseButton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseButton v-bind="args" :is-loading="isLoading">Сохранить</BaseButton>
	`,
	components: { BaseButton },
	imports: [],
	state: { isLoading: false },
	action: 'isLoading = !isLoading',
	trigger: 'Переключить загрузку',
	slots: ['default', 'isLoading'],
	omit: ['default', 'isLoading'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Загрузка в четырёх пресетах движения: содержимое гаснет, спиннер проявляется (`--rise-duration-fast`,',
					'`--rise-duration`, `--rise-ease*`), при выключении — наоборот. Спиннер крутится всегда, даже при «уменьшить движение»:',
					"период — `calc(var(--rise-duration-loop) * 0.8)`. Выключить переходы в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const toggle = canvas.getByRole('button', { name: 'Переключить загрузку' })
		await userEvent.click(toggle)
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-button__loader')).toHaveLength(4))
		for (const button of canvas.getAllByRole('button', { name: 'Сохранить' })) await expect(button).toHaveAttribute('aria-busy', 'true')
		await userEvent.click(toggle)
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-button__loader')).toHaveLength(0))
	},
}
