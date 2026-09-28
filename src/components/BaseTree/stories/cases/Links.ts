import { nodeHeader } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseTree.stories'
import BaseTree from '../../ui/BaseTree.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TreeNode } from '../../types/BaseTree.types'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

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
			source: {
				code: [
					'<!-- { id: "button", label: "Кнопка", to: "/docs/components/button" } -->',
					'<!-- { id: "github", label: "Исходный код", href: "https://github.com/…", target: "_blank" } -->',
					'<BaseTree v-model:selected-ids="current" :items="pages" selection-mode="single" aria-label="Документация" />',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onExpanded = useModelArg('expandedIds')
		const onSelected = useModelArg('selectedIds')
		return {
			components: { BaseTree },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onExpanded, onSelected }),
			template: `
				<div class="story-stack story-narrow" style="gap: 8px;">
					<BaseTree v-bind="props" @update:expanded-ids="onExpanded" @update:selected-ids="onSelected" />
					<span class="story-label">Текущая страница: {{ props.selectedIds?.join(', ') || '—' }}</span>
				</div>
			`,
		}
	},
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
