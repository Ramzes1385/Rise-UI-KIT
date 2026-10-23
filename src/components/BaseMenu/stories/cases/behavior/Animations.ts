import { SHORT_ITEMS } from '../../shared'
import type meta from '../../BaseMenu.stories'
import BaseMenu from '../../../ui/BaseMenu.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="scale">
			<BaseMenu v-bind="args" :items="items" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseMenu },
	imports: ['BaseAnimation', 'BaseMenu'],
	state: { items: SHORT_ITEMS },
	omit: ['items'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Своего появления у меню нет — его показывает панель (`BaseDropdown`, `BasePopover`); здесь в колонках четырёх пресетов',
					'движения оно появляется через `BaseAnimation` (`scale`), «Повторить» монтирует его заново. Наведение и нажатие на пункт',
					'плавно меняют фон и цвет за `--rise-duration-fast` с кривой `--rise-ease`. В пресете `none` и при «уменьшить движение»',
					"цвета меняются сразу. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-menu')).toHaveLength(4))
		for (const item of canvas.getAllByRole('button', { name: 'Скачать' })) await waitFor(() => expect(item).toBeVisible())
	},
}
