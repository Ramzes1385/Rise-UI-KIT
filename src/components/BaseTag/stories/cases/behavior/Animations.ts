import BaseTag from '../../../ui/BaseTag.vue'
import type meta from '../../BaseTag.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<div class="story-row">
			<BaseTag v-bind="args" v-model:is-selected="isActive" label="Vue" is-selectable />
			<BaseTag v-bind="args" label="Сочи" :is-removable="isActive" />
		</div>
	`,
	components: { BaseTag, BaseButton },
	imports: ['BaseTag'],
	state: { isActive: false },
	action: 'isActive = !isActive',
	trigger: 'Переключить',
	slots: ['default'],
	omit: ['default', 'label', 'isSelectable', 'isSelected', 'isRemovable'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { isSelectable: false, isSelected: false, isRemovable: false },
	parameters: {
		controls: { include: ['variant', 'tone', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'«Переключить» выбирает первую метку и делает вторую удаляемой — в колонках четырёх пресетов движения.',
					'Галочка и кнопка «×» появляются с масштабом и прозрачностью (пружина `--rise-ease-spring` за `--rise-duration`),',
					'уходят быстрее (`--rise-duration-fast`). Если галочка сменяет значок, старый уходит на своём месте — текст не прыгает.',
					'Место под значок раскрывается без рывка: колонка значка растёт от 0fr до 1fr (`grid-template-columns`, `--rise-duration`,',
					'`--rise-ease-emphasized`), ширина метки не анимируется; при уходе значка колонка закрывается за то же время.',
					'Цвет фона меняется за `--rise-duration-fast`. В пресете `none` и при «уменьшить движение» — сразу конечное состояние.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Переключить' }))
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Удалить метку Сочи' })).toHaveLength(4))
		for (const tag of canvas.getAllByRole('button', { name: 'Vue' })) await expect(tag).toHaveAttribute('aria-pressed', 'true')
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-tag__icon')).toHaveLength(4))
		for (const icon of canvasElement.querySelectorAll('.base-tag__icon')) await waitFor(() => expect(icon).toBeVisible())
		await expect(canvasElement.querySelectorAll('.base-tag__lead--open')).toHaveLength(4)
		await userEvent.click(canvas.getByRole('button', { name: 'Переключить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-tag__lead--open')).toHaveLength(0))
	},
}
