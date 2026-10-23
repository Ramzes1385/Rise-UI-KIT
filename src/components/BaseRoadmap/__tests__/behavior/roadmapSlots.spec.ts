import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import { screen, within } from '@testing-library/vue'
import { renderRoadmap } from '../fixtures/renderRoadmap'

describe('BaseRoadmap: слоты', () => {
	it('topic заменяет содержимое строки темы и получает тему и состояние', async () => {
		await renderRoadmap({
			slots: {
				topic: ({ topic, state }: { topic: { title: string }; state: { status: string } }) =>
					h('i', `${topic.title}/${state.status}`),
			},
		})
		const row = screen.getByRole('button', { name: /^HTML\/available/ })
		expect(within(row).queryByText('4 ч')).not.toBeInTheDocument()
		expect(screen.getByText('CSS/locked')).toBeInTheDocument()
	})

	it('без слота topic в строке название и часы', async () => {
		await renderRoadmap()
		expect(screen.getByRole('button', { name: /^HTML.*4 ч/ })).toBeInTheDocument()
	})

	it('stage-header заменяет заголовок этапа', async () => {
		await renderRoadmap({
			slots: {
				'stage-header': ({ stage, status }: { stage: { title: string }; status: string }) => h('b', `${stage.title}:${status}`),
			},
		})
		expect(screen.getByRole('button', { name: 'Основы:current' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Фреймворки:locked' })).toBeInTheDocument()
	})

	it('topic-details добавляется в панель темы', async () => {
		await renderRoadmap({
			props: { selected: 'css' },
			slots: {
				'topic-details': ({ topic, state }: { topic: { title: string }; state: { status: string } }) =>
					h('p', `Заметка: ${topic.title} ${state.status}`),
			},
		})
		expect(within(screen.getByRole('complementary', { name: 'Подробности темы' })).getByText('Заметка: CSS locked')).toBeInTheDocument()
	})

	it('topic-details попадает и в шторку', async () => {
		await renderRoadmap({
			props: { selected: 'css', detailsPosition: 'sheet' },
			slots: { 'topic-details': () => h('p', 'Свой блок') },
		})
		expect(within(await screen.findByRole('dialog')).getByText('Свой блок')).toBeInTheDocument()
	})

	it('material заменяет вид материала', async () => {
		await renderRoadmap({
			props: { selected: 'html' },
			slots: { material: ({ material }: { material: { title: string } }) => h('span', `Материал ${material.title}`) },
		})
		const panel = screen.getByRole('complementary', { name: 'Подробности темы' })
		expect(within(panel).getByText('Материал MDN')).toBeInTheDocument()
		expect(within(panel).queryByRole('link')).not.toBeInTheDocument()
	})

	it('material работает и в шторке', async () => {
		await renderRoadmap({
			props: { selected: 'html', detailsPosition: 'sheet' },
			slots: { material: ({ material }: { material: { title: string } }) => h('span', `Свой ${material.title}`) },
		})
		expect(within(await screen.findByRole('dialog')).getByText('Свой Лекция')).toBeInTheDocument()
	})

	it('summary-end добавляется в конец сводки, в том числе в узком виде', async () => {
		const first = await renderRoadmap({ slots: { 'summary-end': () => h('button', 'Экспорт') } })
		expect(screen.getByRole('button', { name: 'Экспорт' }).closest('.base-roadmap__summary')).not.toBeNull()
		first.unmount()
		await renderRoadmap({ width: 400, slots: { 'summary-end': () => h('button', 'Экспорт') } })
		expect(screen.getByRole('button', { name: 'Экспорт' })).toBeInTheDocument()
	})

	it('empty показывается вместо этапов и по умолчанию говорит, что их нет', async () => {
		const first = await renderRoadmap({ props: { data: { version: 1, title: 'Пусто', stages: [] } } })
		expect(screen.getByText('В пути пока нет этапов')).toBeInTheDocument()
		expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
		expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
		first.unmount()
		await renderRoadmap({
			props: { data: { version: 1, title: 'Пусто', stages: [] } },
			slots: { empty: () => h('p', 'Добавьте этапы') },
		})
		expect(screen.getByText('Добавьте этапы')).toBeInTheDocument()
		expect(screen.queryByText('В пути пока нет этапов')).not.toBeInTheDocument()
	})
})
