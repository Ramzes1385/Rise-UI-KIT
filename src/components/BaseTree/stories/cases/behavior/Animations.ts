import type meta from '../../BaseTree.stories'
import BaseTree from '../../../ui/BaseTree.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseTree v-bind="args" v-model:expanded-ids="expanded" />
	`,
	components: { BaseTree, BaseButton },
	imports: ['BaseTree'],
	state: { expanded: [] },
	action: `expanded = expanded.length ? [] : ['src']`,
	trigger: 'Раскрыть или свернуть',
	omit: ['expandedIds'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'arrowPosition'] },
		docs: {
			description: {
				story: [
					'Раскрытие и сворачивание ветки `src` в колонках четырёх пресетов движения; первое нажатие — первое раскрытие:',
					'дети монтируются свёрнутыми и сразу раскрываются тем же переходом, без рывка (повторить — перезагрузить историю).',
					'Ветка растёт по высоте через `grid-template-rows` 0fr → 1fr (миксин `expand-rows`) за `--rise-duration-slow` с кривой',
					'`--rise-ease-emphasized`, содержимое проявляется за `--rise-duration`; шеврон поворачивается через `transform` с той же',
					'длительностью и кривой, что и ветка. В пресете `none` и при «уменьшить движение» — сразу конечное состояние.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const toggle = canvas.getByRole('button', { name: 'Раскрыть или свернуть' })
		await userEvent.click(toggle)
		for (const item of canvas.getAllByRole('treeitem', { name: 'src' }))
			await waitFor(() => expect(item).toHaveAttribute('aria-expanded', 'true'))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-tree__children--open')).toHaveLength(4))
		for (const item of canvas.getAllByRole('treeitem', { name: 'App.vue' })) await waitFor(() => expect(item).toBeVisible())
		await userEvent.click(toggle)
		for (const item of canvas.getAllByRole('treeitem', { name: 'src' }))
			await waitFor(() => expect(item).toHaveAttribute('aria-expanded', 'false'))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-tree__children--open')).toHaveLength(0))
	},
}
