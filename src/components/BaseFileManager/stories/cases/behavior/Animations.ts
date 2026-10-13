import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFileManager.stories'
import { motionPresetsStory } from '@/stories/helpers'
import BaseFileManager from '../../../ui/BaseFileManager.vue'
import type { FileManagerItem } from '../../../types/BaseFileManager.types'

const items: FileManagerItem[] = [
	{ id: 'docs', name: 'Документы', type: 'folder', modifiedAt: new Date(2025, 4, 14, 9, 30) },
	{ id: 'photos', name: 'Фото', type: 'folder', modifiedAt: new Date(2025, 3, 28, 20, 15) },
	{ id: 'readme', name: 'README.md', type: 'file', size: 1200, mime: 'text/markdown', modifiedAt: new Date(2025, 4, 1, 8, 0) },
	{
		id: 'lease',
		name: 'Договор аренды.pdf',
		type: 'file',
		size: 2411724,
		mime: 'application/pdf',
		modifiedAt: new Date(2025, 4, 14, 9, 30),
	},
]

const motion = motionPresetsStory({
	item: `
		<BaseFileManager v-bind="args" v-model:selected="selected" :items="items" :has-tree="false" :height="240" />
	`,
	components: { BaseButton, BaseFileManager },
	imports: ['BaseFileManager'],
	state: { selected: [], items },
	action: "selected = selected.length ? [] : ['docs', 'lease']",
	trigger: 'Выбрать записи',
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Выбор записей в четырёх пресетах движения: кнопка сверху выбирает и снимает выбор. Своих анимаций у менеджера нет: цвет строки при наведении и выборе',
					'переходит по токенам `--rise-duration`, `--rise-ease-in` и `--rise-ease-out`; панель, кнопки и дерево внутри двигаются своими токенами.',
					"В `none` и при «уменьшить движение» цвет меняется сразу. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Выбрать записи' }))
		await waitFor(() => expect(canvas.getAllByRole('option', { selected: true })).toHaveLength(8))
		await userEvent.click(canvas.getByRole('button', { name: 'Выбрать записи' }))
		await waitFor(() => expect(canvas.queryAllByRole('option', { selected: true })).toHaveLength(0))
	},
}
