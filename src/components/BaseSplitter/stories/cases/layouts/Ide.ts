import { expect } from 'storybook/test'
import type meta from '../../BaseSplitter.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSplitter from '../../../ui/BaseSplitter.vue'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'

const files = ['src/', 'App.vue', 'main.ts', 'router.ts', 'store.ts']

const symbols = ['setup()', 'loadOrders()', 'formatSum()']

const state = { sizes: [20, 60, 20], editorSize: 70 }

const template = `
	<div style="height: 360px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden">
		<BaseSplitter v-model:sizes="sizes" :pane-labels="['Файлы', 'Редактор и терминал']">
			<template #pane-1>
				<ul aria-label="Файлы" style="margin: 0; padding: 12px 16px; list-style: none; display: grid; gap: 6px">
					<li v-for="file in files" :key="file">{{ file }}</li>
				</ul>
			</template>
			<template #pane-2>
				<BaseSplitter v-model="editorSize" orientation="vertical" label="Редактор" :min="30" :max="85">
					<template #start>
						<pre style="margin: 0; padding: 12px 16px">const orders = await loadOrders()
const total = orders.reduce((sum, order) => sum + order.sum, 0)
console.log(formatSum(total))</pre>
					</template>
					<template #end>
						<pre aria-label="Терминал" style="margin: 0; padding: 12px 16px">$ npm run dev
Сервер запущен: http://localhost:5173</pre>
					</template>
				</BaseSplitter>
			</template>
			<template #pane-3>
				<ul aria-label="Структура файла" style="margin: 0; padding: 12px 16px; list-style: none; display: grid; gap: 6px">
					<li v-for="symbol in symbols" :key="symbol">{{ symbol }}</li>
				</ul>
			</template>
		</BaseSplitter>
	</div>
`

export const Ide: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Редактор кода: файлы, редактор с терминалом и структура файла. В средней панели — вложенный разделитель',
					'`orientation="vertical"`: несколько панелей по горизонтали и по вертикали в одном окне.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseSplitter'],
				state,
				types: { sizes: 'number[]' },
				script: [`const files = ${literal(files)}`, `const symbols = ${literal(symbols)}`].join('\n'),
			}),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseSplitter },
		setup: useStorySetup(args, { state, data: { files, symbols } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('separator')).toHaveLength(3)
		await expect(canvas.getByRole('separator', { name: 'Файлы' })).toHaveAttribute('aria-orientation', 'vertical')
		await expect(canvas.getByRole('separator', { name: 'Редактор' })).toHaveAttribute('aria-orientation', 'horizontal')
		await expect(canvas.getByRole('separator', { name: 'Редактор' })).toHaveAttribute('aria-valuenow', '70')
	},
}
