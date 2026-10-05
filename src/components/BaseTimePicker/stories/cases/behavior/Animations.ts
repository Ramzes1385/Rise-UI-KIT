import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BaseTimePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseTimePicker from '../../../ui/BaseTimePicker.vue'

const motion = motionPresetsStory({
	item: `<BaseTimePicker v-bind="args" :model-value="isLate ? '17:30' : '09:00'" :error="isLate ? 'Поздно для звонка' : ''" />`,
	components: { BaseTimePicker, BaseButton },
	imports: ['BaseTimePicker'],
	state: { isLate: false },
	action: 'isLate = !isLate',
	trigger: 'Сменить время',
	slots: ['modelValue', 'error', 'onUpdate:modelValue'],
	omit: ['modelValue', 'error', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Поле времени в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`.',
					'«Сменить время» переключает значение и ошибку. Своей анимации у поля нет: рамка и фон внутреннего BaseInput плавно',
					'меняют цвет (`--rise-duration-fast`, `--rise-ease`), список BaseAutocomplete появляется и проявляет пункты по своим токенам.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить время' }))
		await waitFor(() => expect(canvas.getAllByText('Поздно для звонка')).toHaveLength(4))
		for (const field of canvas.getAllByRole('combobox', { name: 'Время звонка' })) await expect(field).toHaveValue('17:30')
	},
}
