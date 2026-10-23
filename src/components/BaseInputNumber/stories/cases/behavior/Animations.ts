import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseInputNumber.stories'
import { motionPresetsStory } from '@/stories/helpers'
import BaseInputNumber from '../../../ui/BaseInputNumber.vue'

const motion = motionPresetsStory({
	item: '<BaseInputNumber v-bind="args" v-model="count" />',
	components: { BaseInputNumber, BaseButton },
	imports: ['BaseInputNumber'],
	state: { count: 2 },
	action: 'count = count >= 10 ? 1 : count + 1',
	trigger: '+1',
	slots: ['modelValue', 'onUpdate:modelValue'],
	omit: ['modelValue', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Одно поле в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`. «+1» меняет значение во всех колонках.',
					'Число в поле не «прокручивается» — анимация мешала бы вводу. Кнопки −/+ плавно меняют цвет и фон',
					'(`--rise-duration-fast`, `--rise-ease`), а при нажатии значок сжимается до `--rise-motion-scale-from`',
					'(в `none` и при «уменьшить движение» — 1, без сжатия). Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: '+1' }))
		for (const field of canvas.getAllByRole('spinbutton')) await waitFor(() => expect(field).toHaveValue('3'))
		await userEvent.click(canvas.getAllByRole('button', { name: 'Увеличить' })[2])
		await waitFor(() => expect(canvas.getAllByRole('spinbutton')).toHaveLength(4))
		for (const field of canvas.getAllByRole('spinbutton')) await waitFor(() => expect(field).toHaveValue('4'))
	},
}
