import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseReasoning.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseReasoning from '../../../ui/BaseReasoning.vue'

const omit = ['isOpen', 'onUpdate:isOpen', 'default']

const motion = motionPresetsStory({
	item: `
		<BaseReasoning v-bind="args" v-model:is-open="isOpen" />
	`,
	components: { BaseReasoning, BaseButton },
	imports: ['BaseReasoning'],
	state: { isOpen: false },
	action: 'isOpen = !isOpen',
	trigger: 'Раскрыть или свернуть',
	slots: ['default'],
	omit,
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Раскрытие и сворачивание в четырёх пресетах движения: «Раскрыть или свернуть» переключает все блоки, заголовок тоже',
					'переключает свой. Высота меняется строками сетки 0fr↔1fr за `--rise-duration-slow` (`--rise-ease-emphasized`), текст',
					'проявляется за `--rise-duration` (`--rise-ease`), шеврон поворачивается на 180° за `--rise-duration`. Перелив «Думает…»',
					'во время потока — петля `--rise-duration-loop` × 2. В `none` и при «уменьшить движение» блок раскрывается сразу, перелива нет.',
					"Выключить в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const triggers = () => canvas.getAllByRole('button', { name: 'Думал 12 с' })
		await userEvent.click(canvas.getByRole('button', { name: 'Раскрыть или свернуть' }))
		await waitFor(() => {
			for (const trigger of triggers()) expect(trigger).toHaveAttribute('aria-expanded', 'true')
			expect(canvas.getAllByText(/Пользователь спрашивает/)).toHaveLength(4)
			for (const text of canvas.getAllByText(/Пользователь спрашивает/)) expect(text).toBeVisible()
		})
		await userEvent.click(canvas.getByRole('button', { name: 'Раскрыть или свернуть' }))
		await waitFor(() => {
			for (const trigger of triggers()) expect(trigger).toHaveAttribute('aria-expanded', 'false')
		})
	},
}
