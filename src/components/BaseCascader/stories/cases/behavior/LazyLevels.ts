import type meta from '../../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCascader from '../../../ui/BaseCascader.vue'
import { expect, screen, waitFor, within } from 'storybook/test'
import { docsFrame, LAZY_LEVELS, LAZY_ROOTS } from '../../shared'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import type { BaseCascaderNode } from '../../../types/BaseCascader.types'

const models = { selected: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseCascader v-bind="args" v-model="selected" :items="roots" :load="load" /></div>
`

const script = [
	`const roots: BaseCascaderNode[] = ${literal(LAZY_ROOTS)}`,
	`const levels: Record<string, BaseCascaderNode[]> = ${literal(LAZY_LEVELS)}`,
	'let hasFailed = false',
	'',
	'function load(node: BaseCascaderNode): Promise<BaseCascaderNode[]> {',
	'\treturn new Promise((resolve, reject) => {',
	'\t\tsetTimeout(() => {',
	"\t\t\tif (node.id === 'by' && !hasFailed) {",
	'\t\t\t\thasFailed = true',
	"\t\t\t\treject(new Error('Сервер недоступен'))",
	'\t\t\t\treturn',
	'\t\t\t}',
	'\t\t\tresolve(levels[node.id] ?? [])',
	'\t\t}, 600)',
	'\t})',
	'}',
].join('\n')

function setup() {
	let hasFailed = false
	function load(node: BaseCascaderNode): Promise<BaseCascaderNode[]> {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (node.id === 'by' && !hasFailed) {
					hasFailed = true
					reject(new Error('Сервер недоступен'))
					return
				}
				resolve(LAZY_LEVELS[node.id] ?? [])
			}, 600)
		})
	}
	return { roots: LAZY_ROOTS, load }
}

export const LazyLevels: StoryObj<typeof meta> = {
	parameters: {
		controls: { exclude: ['items', 'modelValue'] },
		docs: {
			...docsFrame(320),
			description: {
				story: [
					'Ленивые уровни: `load(node)` возвращает промис детей. Пока он не выполнен, колонка показывает загрузку;',
					'ошибка — текст и кнопка «Повторить» (Беларусь падает с первого раза); загруженное запоминается.',
					'Узел без `children` и без `isLeaf` раскрывается через `load`, `isLeaf: true` — конечный.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCascader', 'type BaseCascaderNode'],
				models,
				script,
				omit: ['items'],
			}),
		},
	},
	args: { label: 'Город', placeholder: 'Выберите город' },
	render: args => ({
		components: { BaseCascader },
		setup: useStorySetup(args, { models, slots: ['items'], setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Город' })
		await userEvent.click(field)
		await userEvent.click(await screen.findByRole('option', { name: /Беларусь/ }))
		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Не удалось загрузить'), { timeout: 3000 })
		await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(screen.getByRole('status', { name: /Загрузка/ })).toBeVisible())
		const minsk = await screen.findByRole('option', { name: 'Минск' }, { timeout: 3000 })
		await expect(within(screen.getAllByRole('listbox')[1]).getAllByRole('option')).toHaveLength(1)
		await userEvent.click(minsk)
		await expect(field).toHaveTextContent('Беларусь / Минск')
	},
}
