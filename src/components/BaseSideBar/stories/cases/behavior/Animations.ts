import { SLOT_KEYS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseSideBar.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { motionPresetsStory } from '@/stories/helpers'

const hidden = [...SLOT_KEYS, 'isCollapsed', 'onUpdate:isCollapsed', 'linkComponent']

const motion = motionPresetsStory({
	item: `
		<div style="display: flex; height: 360px;">
			<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed" />
		</div>
	`,
	components: { BaseSideBar, BaseButton },
	imports: ['BaseSideBar'],
	state: { isCollapsed: false },
	action: 'isCollapsed = !isCollapsed',
	trigger: 'Свернуть или развернуть',
	slots: hidden,
	omit: hidden,
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { width: 220 },
	parameters: {
		controls: { include: ['variant', 'width', 'collapsedWidth', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Сворачивание панели и раскрытие подменю в четырёх пресетах движения. Кнопка над колонками сворачивает и разворачивает',
					'все четыре панели; «Настройки» в каждой колонке раскрывает подменю.',
					'При сворачивании подписи гаснут за `--rise-duration-fast`, затем ширина сужается за `--rise-duration-slow` на кривой',
					'`--rise-ease-emphasized`; при разворачивании — наоборот: сначала ширина, потом подписи. Подменю раскрывается по высоте',
					'(`grid-template-rows`) за `--rise-duration-slow` с проявлением за `--rise-duration`; шеврон поворачивается.',
					'В `none` и при «уменьшить движение» панель и подменю сразу в конечном состоянии.',
					"Выключить в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const sidebars = () => canvas.getAllByRole('complementary')
		const toggle = canvas.getByRole('button', { name: 'Свернуть или развернуть' })

		await userEvent.click(toggle)
		await waitFor(() => sidebars().forEach(sidebar => expect(sidebar).toHaveClass('base-side-bar--collapsed')))
		await userEvent.click(toggle)
		await waitFor(() => sidebars().forEach(sidebar => expect(sidebar).not.toHaveClass('base-side-bar--collapsed')))
		await waitFor(() => sidebars().forEach(sidebar => expect(sidebar).not.toHaveClass('base-side-bar--labels-in')))
	},
}
