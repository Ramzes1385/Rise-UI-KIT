import { BaseCode } from '@components/BaseCode'
import { BaseTree } from '@components/BaseTree'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseSplitter.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSplitter from '../../../ui/BaseSplitter.vue'
import { checkSplitterDrag, checkSplitterKeyboard } from '../../play'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'

const items = [
	{
		id: 'src',
		label: 'src',
		icon: 'folder',
		children: [
			{ id: 'main', label: 'main.ts', icon: 'file-ts' },
			{ id: 'format', label: 'formatSum.ts', icon: 'file-ts' },
		],
	},
	{ id: 'package', label: 'package.json', icon: 'file-json' },
]

const files: Record<string, { title: string; language: string; code: string }> = {
	main: {
		title: 'main.ts',
		language: 'ts',
		code: ["import { createApp } from 'vue'", "import App from './App.vue'", '', "createApp(App).mount('#app')"].join('\n'),
	},
	format: {
		title: 'formatSum.ts',
		language: 'ts',
		code: [
			'export function formatSum(value: number): string {',
			"\treturn new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value)",
			'}',
		].join('\n'),
	},
	package: {
		title: 'package.json',
		language: 'json',
		code: ['{', '\t"name": "orders-app",', '\t"private": true,', '\t"scripts": { "dev": "vite" }', '}'].join('\n'),
	},
}

const state = { size: 30, expandedIds: ['src'], selectedIds: ['main'] }

const template = `
	<div style="height: 340px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden">
		<BaseSplitter v-model="size" label="Файлы проекта" :min="20" :max="60">
			<template #start>
				<BaseTree
					v-model:expanded-ids="expandedIds"
					v-model:selected-ids="selectedIds"
					:items="items"
					selection-mode="single"
					aria-label="Файлы проекта" />
			</template>
			<template #end>
				<BaseCode
					:code="files[selectedIds[0]].code"
					:language="files[selectedIds[0]].language"
					:title="files[selectedIds[0]].title" />
			</template>
		</BaseSplitter>
	</div>
`

export const FileTree: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Файловый менеджер: слева дерево файлов (`BaseTree`), справа код выбранного файла с подсветкой (`BaseCode`).',
					'Выберите файл в дереве — код справа сменится. Дерево и код не мешают друг другу: разделитель двигается и мышью, и клавишами.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseSplitter', 'BaseTree', 'BaseCode'],
				state,
				types: { expandedIds: 'string[]', selectedIds: 'string[]' },
				script: [`const items = ${literal(items)}`, `const files = ${literal(files)}`].join('\n'),
			}),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseSplitter, BaseTree, BaseCode },
		setup: useStorySetup(args, { state, data: { items, files } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const separator = canvas.getByRole('separator', { name: 'Файлы проекта' })
		await userEvent.click(canvas.getByText('formatSum.ts'))
		await waitFor(() => expect(canvasElement.querySelector('code')).toHaveTextContent('Intl.NumberFormat'))
		await checkSplitterKeyboard(separator, { min: 20, max: 60, step: 5 }, userEvent)
		await checkSplitterDrag(separator, { min: 20, max: 60 })
	},
}
