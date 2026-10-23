import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseCheckbox.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseCheckbox from '../../../ui/BaseCheckbox.vue'

const OWN_ARGS = ['modelValue', 'label', 'onUpdate:modelValue']

const motion = motionPresetsStory({
	item: `
		<BaseCheckbox v-bind="args" v-model="isChecked" label="Получать новости" />
	`,
	components: { BaseCheckbox, BaseButton },
	imports: ['BaseCheckbox'],
	state: { isChecked: false },
	action: 'isChecked = !isChecked',
	trigger: 'Переключить',
	slots: OWN_ARGS,
	omit: OWN_ARGS,
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'isIndeterminate', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Переключатели: появление отметки в четырёх пресетах движения. «Переключить» (или щелчок, пробел по флажку) отмечает',
					'все четыре флажка: галочка проявляется и вырастает из `scale(0.5)` (`opacity` и `transform`), при снятии — гаснет быстрее.',
					'Длительности и кривые — токены `--rise-duration`, `--rise-duration-fast`, `--rise-ease-out`, `--rise-ease-in`; цвет квадрата',
					'меняется за `--rise-duration-fast`. В неотмеченном флажке отметки нет в DOM, состояние читает скринридер у `<input>`.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда — отметка появляется сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Переключить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-checkbox__icon')).toHaveLength(4))
		for (const checkbox of canvas.getAllByRole('checkbox', { name: 'Получать новости' })) await expect(checkbox).toBeChecked()

		canvas.getAllByRole('checkbox', { name: 'Получать новости' })[0]!.focus()
		await userEvent.keyboard(' ')
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-checkbox__icon')).toHaveLength(0))
		for (const checkbox of canvas.getAllByRole('checkbox', { name: 'Получать новости' })) await expect(checkbox).not.toBeChecked()
	},
}
