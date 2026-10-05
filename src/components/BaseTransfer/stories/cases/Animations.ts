import type meta from '../BaseTransfer.stories'
import { BaseButton } from '@components/BaseButton'
import BaseTransfer from '../../ui/BaseTransfer.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { expect, waitFor, within } from 'storybook/test'

const motion = motionPresetsStory({
	item: `
		<BaseTransfer v-bind="args" v-model="value" />
	`,
	components: { BaseTransfer, BaseButton },
	imports: ['BaseTransfer'],
	state: { value: ['vera'] },
	action: "value = value.length > 1 ? ['vera'] : ['vera', 'anna', 'darya']",
	trigger: 'Перенести',
	slots: ['modelValue'],
	omit: ['modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { height: 200, label: 'Участники' },
	parameters: {
		controls: { include: ['variant', 'isSortable', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перенос строк в четырёх пресетах движения: «Перенести» меняет v-model, так же — кнопки со стрелками и Ctrl + ← / →.',
					'Ушедшая строка гаснет копией поверх старого списка (`position: absolute`) и сдвигается к новому: Web Animations API,',
					'только `opacity` и `transform`, `--rise-duration-fast`, `--rise-ease-in`, сдвиг `--rise-motion-distance`. Появление в новом',
					'списке и сдвиг оставшихся строк (FLIP) делает сам BaseList. Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение»",
					'действует всегда — строки переносятся сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Перенести' })
		await userEvent.click(trigger)
		for (const target of canvas.getAllByRole('listbox', { name: 'Выбрано' })) {
			await waitFor(() => expect(within(target).getAllByRole('option')).toHaveLength(3))
		}
		trigger.focus()
		await userEvent.keyboard('{Enter}')
		for (const target of canvas.getAllByRole('listbox', { name: 'Выбрано' })) {
			await waitFor(() => expect(within(target).getAllByRole('option')).toHaveLength(1))
		}
		for (const source of canvas.getAllByRole('listbox', { name: 'Доступно' })) {
			await waitFor(() => expect(within(source).getByRole('option', { name: /Анна Смирнова/ })).toBeVisible())
		}
	},
}
