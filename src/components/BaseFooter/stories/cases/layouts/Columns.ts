import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseFooter.stories'
import BaseFooter from '../../../ui/BaseFooter.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'

const columns = [
	{
		title: 'Продукт',
		links: [
			{ label: 'Возможности', href: '#features' },
			{ label: 'Цены', href: '#pricing' },
			{ label: 'Обновления', href: '#changelog' },
		],
	},
	{
		title: 'Разработчикам',
		links: [
			{ label: 'Документация', href: '#docs' },
			{ label: 'API', href: '#api' },
			{ label: 'Статус сервиса', href: '#status' },
		],
	},
	{
		title: 'Компания',
		links: [
			{ label: 'О нас', href: '#about' },
			{ label: 'Вакансии', href: '#jobs' },
			{ label: 'Контакты', href: '#contacts' },
		],
	},
]

const template = `
	<BaseFooter container-size="lg" :columns="columns">
		<template #top>
			<strong>Rise Studio</strong>
			<p style="margin: 0">Компоненты для интерфейсов на Vue: формы, таблицы, чат и редактор.</p>
		</template>
		<template #start>© 2026 Rise Studio</template>
		<template #end>
			<BaseLink href="#terms">Условия</BaseLink>
			<BaseLink href="#privacy">Конфиденциальность</BaseLink>
		</template>
	</BaseFooter>
`

export const Columns: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Колонки ссылок: `columns` — массив `{ title, links }`, каждая колонка — `<nav>` с именем по заголовку.',
					'Слот `top` — описание слева от колонок; нижняя строка отделена линией.',
				].join('\n'),
			},
			source: staticStorySource({ template, imports: ['BaseFooter', 'BaseLink'], script: `const columns = ${literal(columns)}` }),
		},
		controls: { disable: true },
	},
	render: args => ({ components: { BaseFooter, BaseLink }, setup: useStorySetup(args, { data: { columns } }), template }),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('navigation')).toHaveLength(3)
		await expect(canvas.getByRole('navigation', { name: 'Разработчикам' })).toContainElement(canvas.getByRole('link', { name: 'API' }))
	},
}
