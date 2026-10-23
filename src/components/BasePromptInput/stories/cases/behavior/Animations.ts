import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePromptInput.stories'
import { motionPresetsStory } from '@/stories/helpers'
import BasePromptInput from '../../../ui/BasePromptInput.vue'

const motion = motionPresetsStory({
	item: `
		<BasePromptInput v-bind="args" v-model="text" :is-generating="isGenerating" />
	`,
	components: { BasePromptInput, BaseButton },
	imports: ['BasePromptInput'],
	state: { text: 'Как работает перекрёстная смена?', isGenerating: false },
	action: 'isGenerating = !isGenerating',
	trigger: 'Начать или остановить ответ',
	slots: ['modelValue', 'onUpdate:modelValue'],
	omit: ['modelValue', 'onUpdate:modelValue', 'isGenerating'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Смена кнопки «Отправить» на «Остановить ответ» (`is-generating`) в четырёх пресетах движения: «Начать или остановить',
					'ответ» переключает состояние. Новая кнопка появляется — прозрачность и масштаб от `--rise-motion-scale-from` за',
					'`--rise-duration` на `--rise-ease-out`, прежняя гаснет поверх неё за `--rise-duration-fast`, панель не сдвигается.',
					'Авторост поля по тексту не анимируется: высота меняется сразу. В `none` и при «уменьшить движение» кнопка сменяется сразу.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Начать или остановить ответ' })
		await userEvent.click(trigger)
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Остановить ответ' })).toHaveLength(4))
		await waitFor(() => expect(canvas.queryAllByRole('button', { name: 'Отправить' })).toHaveLength(0))
		await userEvent.click(trigger)
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Отправить' })).toHaveLength(4))
		await waitFor(() => expect(canvas.queryAllByRole('button', { name: 'Остановить ответ' })).toHaveLength(0))
	},
}
