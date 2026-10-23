import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BaseJsonViewer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseJsonViewer from '../../../ui/BaseJsonViewer.vue'

const motion = motionPresetsStory({
	item: `
		<BaseJsonViewer v-bind="args" :expand-depth="depth" />
	`,
	components: { BaseJsonViewer, BaseButton },
	imports: ['BaseJsonViewer'],
	state: { depth: 1 },
	action: 'depth = depth > 1 ? 1 : 3',
	trigger: 'Развернуть и свернуть',
	omit: ['expandDepth'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { hasToolbar: false },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Дерево JSON в колонках четырёх пресетов движения; кнопка раскрывает три уровня (`expandDepth: 3`) и сворачивает до',
					'одного. Раскрытие и сворачивание — движение BaseTree: высота узла меняется через `grid-template-rows` (`0fr ↔ 1fr`),',
					'стрелка поворачивается через `transform`; длительности и кривые — токены `--rise-duration*`, `--rise-ease*`, поэтому',
					'атрибут `data-rise-motion` меняет движение всей области. `aria-expanded` у узлов меняется сразу. В пресете `none` и при',
					"«уменьшить движение» — сразу конечное состояние. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const items = () => canvas.getAllByRole('treeitem', { name: '0: 4 ключа' })
		const toggle = canvas.getByRole('button', { name: 'Развернуть и свернуть' })
		await expect(items()).toHaveLength(4)
		for (const item of items()) await expect(item).toHaveAttribute('aria-expanded', 'false')
		await userEvent.click(toggle)
		await waitFor(async () => {
			for (const item of items()) await expect(item).toHaveAttribute('aria-expanded', 'true')
		})
		await userEvent.click(toggle)
		await waitFor(async () => {
			for (const item of items()) await expect(item).toHaveAttribute('aria-expanded', 'false')
		})
	},
}
