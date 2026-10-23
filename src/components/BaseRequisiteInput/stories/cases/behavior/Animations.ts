import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import type meta from '../../BaseRequisiteInput.stories'
import BaseRequisiteInput from '../../../ui/BaseRequisiteInput.vue'

const motion = motionPresetsStory({
	item: `<BaseRequisiteInput v-bind="args" :model-value="isWrong ? '500100732250' : '500100732259'" />`,
	components: { BaseRequisiteInput, BaseButton },
	imports: ['BaseRequisiteInput'],
	state: { isWrong: false },
	action: 'isWrong = !isWrong',
	trigger: 'Сменить ИНН',
	slots: ['modelValue', 'onUpdate:modelValue'],
	omit: ['modelValue', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Поле ИНН в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`.',
					'«Сменить ИНН» переключает верный и неверный ИНН человека. Своей анимации у поля нет: рамка и фон внутреннего BaseInput',
					'плавно меняют цвет (`--rise-duration-fast`, `--rise-ease`). Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить ИНН' }))
		await waitFor(() => expect(canvas.getAllByText('Неверное контрольное число')).toHaveLength(4))
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить ИНН' }))
		await waitFor(() => expect(canvas.queryAllByText('Неверное контрольное число')).toHaveLength(0))
	},
}
