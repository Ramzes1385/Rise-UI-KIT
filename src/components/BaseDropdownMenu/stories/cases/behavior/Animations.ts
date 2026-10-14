import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDropdownMenu.stories'
import { expect, screen, waitFor } from 'storybook/test'
import BaseDropdownMenu from '../../../ui/BaseDropdownMenu.vue'
import { docsFrame, motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseDropdownMenu v-bind="args" :is-open="isOpen">
			<BaseButton variant="outline">Действия</BaseButton>
		</BaseDropdownMenu>
	`,
	state: { isOpen: false },
	action: 'isOpen = !isOpen',
	trigger: 'Открыть или закрыть',
	components: { BaseDropdownMenu, BaseButton },
	imports: ['BaseDropdownMenu'],
	slots: [],
	omit: ['isOpen', 'onUpdate:isOpen'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { animation: 'scale' },
	parameters: {
		controls: { include: ['animation', 'position', 'variant'] },
		docs: {
			description: {
				story: [
					'Появление и уход меню и подменю в четырёх пресетах движения: пресет берётся из области кнопки (`data-rise-motion`).',
					'Проп `animation`: `scale` (по умолчанию) — масштаб от угла у кнопки, `fade` — прозрачность, `slide` — сдвиг от кнопки',
					'на `--rise-motion-distance`, `pop` — масштаб с пружиной, `none` — сразу. Галочки флажков и точки переключателей',
					'появляются с пружиной. Кнопка в колонке открывает своё меню, кнопка сверху — все сразу.',
					'В `none` и при «уменьшить движение» меню появляется сразу.',
				].join('\n'),
			},
			...docsFrame(320),
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const [first] = canvas.getAllByRole('button', { name: 'Действия' })
		first.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1))
		await expect(screen.getByRole('menu').closest('[data-rise-motion]')).toHaveAttribute('data-rise-motion', 'none')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryAllByRole('menu')).toHaveLength(0))
		await expect(first).toHaveFocus()
	},
}
