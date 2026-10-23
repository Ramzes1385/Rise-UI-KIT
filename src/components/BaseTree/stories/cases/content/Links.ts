import { expect } from 'storybook/test'
import { nodeHeader } from '../../shared'
import type meta from '../../BaseTree.stories'
import BaseTree from '../../../ui/BaseTree.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TreeNode } from '../../../types/BaseTree.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const DOCS_NAV: TreeNode[] = [
	{ id: 'intro', label: 'Введение', icon: 'home', to: '/docs/intro' },
	{
		id: 'components',
		label: 'Компоненты',
		icon: 'folder',
		to: '/docs/components',
		children: [
			{ id: 'button', label: 'Кнопка', icon: 'file-md', to: '/docs/components/button' },
			{ id: 'input', label: 'Поле ввода', icon: 'file-md', to: '/docs/components/input' },
			{ id: 'tree', label: 'Дерево', icon: 'file-md', to: '/docs/components/tree' },
		],
	},
	{ id: 'changelog', label: 'Изменения', icon: 'file-md', to: '/docs/changelog' },
	{ id: 'github', label: 'Исходный код', icon: 'link', href: 'https://github.com', target: '_blank' },
]

const models = { expandedIds: 'expandedIds', selectedIds: 'selectedIds' }

const template = `
	<div class="story-stack story-narrow" style="gap: 8px;">
		<BaseTree v-bind="args" v-model:expanded-ids="expandedIds" v-model:selected-ids="selectedIds" />
		<span class="story-label">Текущая страница: {{ selectedIds?.join(', ') || '—' }}</span>
	</div>
`

export const Links: StoryObj<typeof meta> = {
	args: { items: DOCS_NAV, selectionMode: 'single', expandedIds: ['components'], selectedIds: ['intro'], ariaLabel: 'Документация' },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'arrowPosition'] },
		docs: {
			description: {
				story: [
					'Навигация: узел с `to` (маршрут) или `href` (внешний адрес) — подпись-ссылка BaseLink. Клик по подписи и Enter',
					'переходят по ссылке и не раскрывают раздел (для этого шеврон и стрелки); в режиме `single` узел становится выбранным —',
					'так отмечается текущая страница. Маршруты открывает RouterLink приложения или `linkComponent` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTree'], models }),
		},
	},
	render: args => ({
		components: { BaseTree },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const link = canvas.getByRole('link', { name: 'Кнопка' })
		await expect(link).toHaveAttribute('href', '/docs/components/button')
		await expect(canvas.getByRole('link', { name: /Исходный код/ })).toHaveAttribute('rel', 'noopener noreferrer')

		await userEvent.click(link)
		await expect(nodeHeader(canvasElement, 'Кнопка')).toHaveAttribute('aria-selected', 'true')
		await expect(nodeHeader(canvasElement, 'Кнопка')).toHaveFocus()
		await expect(canvas.getByText('Текущая страница: button')).toBeVisible()

		await userEvent.keyboard('{ArrowUp}{Enter}')
		await expect(nodeHeader(canvasElement, 'Компоненты')).toHaveAttribute('aria-expanded', 'true')
		await expect(args.onSelect).toHaveBeenLastCalledWith('components', true)
	},
}
