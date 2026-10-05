import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import type meta from '../../BaseCommandPalette.stories'
import { expect, waitFor, within } from 'storybook/test'
import BaseCommandPalette from '../../../ui/BaseCommandPalette.vue'

const motion = motionPresetsStory({
	item: `
		<div class="story-frame" style="height: 380px;">
			<BaseCommandPalette v-bind="args" v-model:is-open="isOpen" is-contained />
		</div>
	`,
	state: { isOpen: true },
	action: 'isOpen = !isOpen',
	trigger: 'Открыть или закрыть',
	components: { BaseCommandPalette, BaseButton },
	imports: ['BaseCommandPalette'],
	slots: ['command', 'empty'],
	omit: ['isOpen', 'isContained', 'onUpdate:isOpen'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { animation: 'scale', hotkey: null },
	parameters: {
		controls: { include: ['animation', 'variant'] },
		docs: {
			description: {
				story: [
					'Открытие и закрытие палитры в четырёх пресетах движения и набор запроса. Проп `animation` уходит в BaseModal:',
					'`scale` (по умолчанию) — масштаб от центра, `fade` — прозрачность, `slide` — снизу, `pop` — масштаб с пружиной, `none` — сразу.',
					'Подсветка команды при наборе и стрелках меняет цвет плавно (`--rise-duration-fast`); список при наборе меняется сразу,',
					'чтобы результаты не отставали от ввода. В `none` и при «уменьшить движение» — без движения.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(canvas.getAllByRole('dialog')).toHaveLength(4))
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть или закрыть' }))
		await waitFor(() => expect(canvas.queryAllByRole('dialog')).toHaveLength(0))
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть или закрыть' }))
		await waitFor(() => expect(canvas.getAllByRole('dialog')).toHaveLength(4))

		const [first] = canvas.getAllByRole('dialog')
		await userEvent.type(within(first).getByRole('combobox'), 'зада')
		await expect(within(first).getAllByRole('option')).toHaveLength(2)
		await expect(within(first).getAllByRole('option', { selected: true })).toHaveLength(1)
	},
}
