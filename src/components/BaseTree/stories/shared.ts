import type { TreeNode } from '../types/BaseTree.types'

export const FILES: TreeNode[] = [
	{
		id: 'src',
		label: 'src',
		icon: 'folder',
		children: [
			{
				id: 'components',
				label: 'components',
				icon: 'folder',
				children: [
					{ id: 'app-header', label: 'AppHeader.vue', icon: 'file-vue' },
					{ id: 'user-card', label: 'UserCard.vue', icon: 'file-vue' },
				],
			},
			{
				id: 'composables',
				label: 'composables',
				icon: 'folder',
				children: [
					{ id: 'use-auth', label: 'useAuth.ts', icon: 'file-ts' },
					{ id: 'use-api', label: 'useApi.ts', icon: 'file-ts' },
				],
			},
			{ id: 'app-vue', label: 'App.vue', icon: 'file-vue' },
			{ id: 'main-ts', label: 'main.ts', icon: 'file-ts' },
		],
	},
	{
		id: 'public',
		label: 'public',
		icon: 'folder',
		children: [
			{ id: 'favicon', label: 'favicon.svg', icon: 'file-svg' },
			{ id: 'robots', label: 'robots.txt', icon: 'file-txt' },
		],
	},
	{ id: 'package-json', label: 'package.json', icon: 'file-json' },
	{ id: 'readme', label: 'README.md', icon: 'file-md' },
]

export function nodeLabel(canvasElement: HTMLElement, text: string): HTMLElement {
	const label = [...canvasElement.querySelectorAll<HTMLElement>('.base-tree__label')].find(item => item.textContent?.trim() === text)
	if (!label) throw new Error(`Узел «${text}» не найден`)
	return label
}

export function nodeHeader(canvasElement: HTMLElement, text: string): HTMLElement {
	return nodeLabel(canvasElement, text).closest('.base-tree__header') as HTMLElement
}

export function treeNode(canvasElement: HTMLElement, text: string): HTMLElement {
	return nodeLabel(canvasElement, text).closest('.base-tree__node') as HTMLElement
}
