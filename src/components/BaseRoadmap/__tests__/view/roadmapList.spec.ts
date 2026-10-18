import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import userEvent from '@testing-library/user-event'
import RoadmapList from '../../ui/layouts/RoadmapList.vue'
import { render, screen, within } from '@testing-library/vue'
import { stageView, topicView } from '../fixtures/shellFixtures'
import { ROADMAP_LAYOUT_COMPONENTS } from '../../ui/layouts/roadmapLayouts'

const ui = (part: string): string => `base-roadmap__${part}`

function stages() {
	return [
		stageView({
			id: 's1',
			title: 'Основы',
			status: 'current',
			isExpanded: true,
			topics: [topicView({ id: 'a', title: 'A' }), topicView({ id: 'b', title: 'B', status: 'locked', missing: ['a'] })],
		}),
		stageView({
			id: 's2',
			title: 'Дальше',
			status: 'locked',
			index: 1,
			requires: ['b'],
			topics: [topicView({ id: 'c', title: 'C', status: 'locked' })],
		}),
		stageView({ id: 's3', title: 'Свёрнутый', status: 'available', index: 2, topics: [topicView({ id: 'd', title: 'D' })] }),
	]
}

describe('RoadmapList', () => {
	it('нумерованный список этапов, раскрыт только нужный', () => {
		render(RoadmapList, { props: { stages: stages(), progress: 0.2, ui } })
		const root = screen.getAllByRole('list')[0]
		expect(root.tagName).toBe('OL')
		expect(within(root).getAllByRole('heading', { level: 3 })).toHaveLength(3)
		expect(screen.getByRole('button', { name: /^A/ })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: /^D/ })).not.toBeInTheDocument()
		expect(screen.getByRole('button', { name: /Основы/ }).closest('li')).toHaveClass(
			'base-roadmap__stage--current',
			'base-roadmap__stage--expanded',
		)
	})

	it('закрытый этап статичен и подсказывает, что нужно пройти', async () => {
		const user = userEvent.setup()
		const { emitted } = render(RoadmapList, { props: { stages: stages(), progress: 0, ui } })
		const locked = screen.getByRole('button', { name: /Дальше/ })
		expect(locked).toHaveAttribute('aria-disabled', 'true')
		expect(locked).toHaveAccessibleName(/Откроется после «B»/)
		await user.click(locked)
		expect(emitted()['toggle-stage']).toBeUndefined()
	})

	it('события этапа и тем: переключение этапа, выбор темы, значок', async () => {
		const user = userEvent.setup()
		const { emitted, container } = render(RoadmapList, { props: { stages: stages(), progress: 0, ui } })
		await user.click(screen.getByRole('button', { name: /Свёрнутый/ }))
		await user.click(screen.getByRole('button', { name: /^A/ }))
		await user.click(container.querySelector('[data-topic-id="a"] .base-roadmap__topic-icon') as HTMLElement)
		expect(emitted()['toggle-stage']).toEqual([['s3']])
		expect(emitted()['select-topic']).toEqual([['a']])
		expect(emitted()['toggle-topic']).toEqual([['a']])
	})

	it('закрытая тема называет требования по названиям', () => {
		render(RoadmapList, { props: { stages: stages(), progress: 0, ui } })
		expect(screen.getByRole('button', { name: /^B.*закрыта: нужно знать A/ })).toBeInTheDocument()
	})

	it('список раскрытого этапа связан с заголовком', () => {
		render(RoadmapList, { props: { stages: stages(), progress: 0, ui } })
		const heading = screen.getByRole('heading', { name: /Основы/ })
		const topics = screen.getByRole('button', { name: /^A/ }).closest('ul') as HTMLElement
		expect(topics).toHaveAttribute('aria-labelledby', heading.id)
		expect(topics.id).toBe('s1-panel')
	})

	it('слоты topic и stage-header пробрасываются', () => {
		render(RoadmapList, {
			props: { stages: stages(), progress: 0, ui },
			slots: {
				topic: ({ topic }: { topic: { title: string } }) => h('i', `Т ${topic.title}`),
				'stage-header': ({ stage }: { stage: { title: string } }) => h('b', `Э ${stage.title}`),
			},
		})
		expect(screen.getByText('Т A')).toBeInTheDocument()
		expect(screen.getByText('Э Основы')).toBeInTheDocument()
	})

	it('раскрытие и сворачивание проходит через переход без сбоев', async () => {
		const { rerender } = render(RoadmapList, { props: { stages: stages(), progress: 0, ui } })
		const next = stages()
		next[0] = { ...next[0], isExpanded: false }
		next[2] = { ...next[2], isExpanded: true }
		await rerender({ stages: next })
		expect(await screen.findByRole('button', { name: /^D/ })).toBeInTheDocument()
	})

	it('занятая тема помечена aria-busy', () => {
		const list = stages()
		list[0].topics[0] = { ...list[0].topics[0], isBusy: true }
		const { container } = render(RoadmapList, { props: { stages: list, progress: 0, ui } })
		expect(container.querySelector('[data-topic-id="a"]')).toHaveAttribute('aria-busy', 'true')
		expect(container.querySelector('[data-topic-id="b"]')).not.toHaveAttribute('aria-busy')
	})

	it('реестр раскладок содержит все четыре', () => {
		expect(Object.keys(ROADMAP_LAYOUT_COMPONENTS).sort()).toEqual(['horizontal', 'list', 'path', 'snake'])
		expect(ROADMAP_LAYOUT_COMPONENTS.list).toBe(RoadmapList)
	})
})
