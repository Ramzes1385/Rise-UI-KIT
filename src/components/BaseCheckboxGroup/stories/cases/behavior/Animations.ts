import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import type meta from '../../BaseCheckboxGroup.stories'
import BaseCheckboxGroup from '../../../ui/BaseCheckboxGroup.vue'

const OWN_ARGS = ['modelValue', 'onUpdate:modelValue']

const motion = motionPresetsStory({
	item: `
		<BaseCheckboxGroup v-bind="args" v-model="selected" />
	`,
	components: { BaseCheckboxGroup, BaseButton },
	imports: ['BaseCheckboxGroup'],
	state: { selected: [] },
	action: "selected = selected.length ? [] : ['email', 'push', 'telegram']",
	trigger: 'Переключить',
	slots: OWN_ARGS,
	omit: OWN_ARGS,
})

const marks = (canvasElement: HTMLElement) => canvasElement.querySelectorAll('.base-checkbox-group__checkbox .base-checkbox__icon')

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'isVertical', 'hasSelectAll', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Переключатели: своего движения у группы нет — каждый флажок — BaseCheckbox со своим появлением отметки (`transform: scale()`',
					'и `opacity` на токенах `--rise-duration`, `--rise-duration-fast`, `--rise-ease-out`). «Переключить» отмечает все доступные',
					"варианты во всех четырёх пресетах или снимает их. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Переключить' }))
		await waitFor(() => expect(marks(canvasElement)).toHaveLength(12))

		canvas.getAllByRole('checkbox', { name: 'Telegram' })[0]!.focus()
		await userEvent.keyboard(' ')
		await waitFor(() => expect(marks(canvasElement)).toHaveLength(8))
		for (const checkbox of canvas.getAllByRole('checkbox', { name: 'Telegram' })) await expect(checkbox).not.toBeChecked()
	},
}
