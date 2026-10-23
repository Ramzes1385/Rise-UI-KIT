import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseContextMenu.stories'
import { expect, screen, waitFor } from 'storybook/test'
import BaseContextMenu from '../../../ui/BaseContextMenu.vue'
import { docsFrame, motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseContextMenu :key="replay" v-bind="args">
			<BaseButton variant="outline">Серия 3</BaseButton>
		</BaseContextMenu>
	`,
	trigger: 'Сбросить',
	components: { BaseContextMenu, BaseButton },
	imports: ['BaseContextMenu'],
	slots: [],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { animation: 'scale' },
	parameters: {
		controls: { include: ['animation', 'variant'] },
		docs: {
			description: {
				story: [
					'Появление и уход меню в четырёх пресетах движения: правый клик или Shift+F10 по кнопке в колонке, Escape закрывает.',
					'Пресет берётся из области (`data-rise-motion`). Проп `animation`: `scale` (по умолчанию) — масштаб от точки клика,',
					'`fade` — прозрачность, `slide` — сдвиг от точки клика на `--rise-motion-distance`, `pop` — масштаб с пружиной, `none` — сразу.',
					'В `none` и при «уменьшить движение» меню появляется сразу.',
				].join('\n'),
			},
			...docsFrame(300),
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const area = canvas.getAllByRole('button', { name: 'Серия 3' })[2]
		area.focus()
		await userEvent.keyboard('{Shift>}{F10}{/Shift}')
		const menu = await screen.findByRole('menu')
		await expect(menu.closest('[data-rise-motion]')).toHaveAttribute('data-rise-motion', 'standard')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
		await expect(area).toHaveFocus()
	},
}
