import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import userEvent from '@testing-library/user-event'
import { render, screen, within } from '@testing-library/vue'
import { stageView, topicView } from '../fixtures/shellFixtures'
import RoadmapTopicPanel from '../../ui/parts/RoadmapTopicPanel.vue'
import type { RoadmapTopicView } from '../../types/internal/roadmapInternal.types'
import type { RoadmapTopicPanelProps } from '../../types/internal/roadmapView.types'

const ui = (part: string): string => `base-roadmap__${part}`

interface PanelInput {
	view?: RoadmapTopicView
	props?: Partial<RoadmapTopicPanelProps>
	slots?: Record<string, unknown>
}

function renderPanel({ view = topicView({ title: 'HTML' }), props = {}, slots }: PanelInput = {}) {
	const user = userEvent.setup()
	const result = render(RoadmapTopicPanel, {
		props: { view, stage: stageView({ title: 'Основы', index: 1 }), doneSubtopics: [], requirements: [], ui, ...props },
		slots,
	} as never)
	return { user, ...result }
}

function isDisabledItem(item: HTMLElement): boolean {
	return item.getAttribute('aria-disabled') === 'true' || (item as HTMLButtonElement).disabled === true
}

const FULL = topicView({
	title: 'HTML',
	status: 'in-progress',
	done: 1,
	total: 2,
	fraction: 0.5,
	topic: {
		description: 'Разметка',
		hours: 2.5,
		subtopics: [
			{ id: 'a', title: 'Теги' },
			{ id: 'b', title: 'Формы' },
		],
		materials: [{ title: 'Лекция', kind: 'video', minutes: 30 }],
	},
})

describe('RoadmapTopicPanel', () => {
	it('в боковой панели есть заголовок с бейджем статуса и бейджи этапа, часов и вида', () => {
		renderPanel({ view: FULL })
		expect(screen.getByRole('heading', { name: 'HTML', level: 2 })).toBeInTheDocument()
		expect(screen.getByText('В процессе')).toBeInTheDocument()
		expect(screen.getByText('Этап 2 · Основы')).toBeInTheDocument()
		expect(screen.getByText('2,5 ч')).toBeInTheDocument()
		expect(screen.getByText('Обязательная')).toBeInTheDocument()
		expect(screen.getByText('Разметка')).toBeInTheDocument()
		expect(screen.getByText('1 из 2 подтем')).toBeInTheDocument()
		expect(screen.getByText('50 %')).toBeInTheDocument()
		expect(screen.getByRole('progressbar', { name: 'Что изучить' })).toHaveAttribute('aria-valuenow', '50')
	})

	it('в шторке заголовка нет (его показывает диалог), класс шторки добавлен', () => {
		const { container } = renderPanel({ view: FULL, props: { isSheet: true } })
		expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
		expect(container.firstElementChild).toHaveClass('base-roadmap__details--sheet')
	})

	it('минимальная тема: без часов, описания, подтем, материалов и требований', () => {
		renderPanel()
		expect(screen.queryByRole('list')).not.toBeInTheDocument()
		expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
		expect(screen.queryByText('Материалы')).not.toBeInTheDocument()
		expect(screen.queryByText('Нужно знать')).not.toBeInTheDocument()
		expect(screen.queryByText(/ ч$/)).not.toBeInTheDocument()
	})

	it.each([
		{ status: 'done', text: 'Изучена' },
		{ status: 'skipped', text: 'Пропущена' },
		{ status: 'locked', text: 'Закрыта' },
		{ status: 'available', text: 'Доступна' },
	] as const)('бейдж статуса $status — «$text»', ({ status, text }) => {
		renderPanel({ view: topicView({ status }) })
		expect(screen.getByRole('heading', { level: 2 }).nextElementSibling).toHaveTextContent(text)
	})

	it('подтемы: отмечены по doneSubtopics, переключение сообщает тему, подтему и значение', async () => {
		const { user, emitted } = renderPanel({ view: FULL, props: { doneSubtopics: ['a'] } })
		expect(screen.getByRole('checkbox', { name: 'Теги' })).toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Формы' })).not.toBeChecked()
		await user.click(screen.getByRole('checkbox', { name: 'Формы' }))
		await user.click(screen.getByRole('checkbox', { name: 'Теги' }))
		expect(emitted()['toggle-subtopic']).toEqual([
			['t1', 'b', true],
			['t1', 'a', false],
		])
	})

	it('у изученной темы подтемы все отмечены', () => {
		renderPanel({ view: { ...FULL, state: { ...FULL.state, status: 'done' } } })
		expect(screen.getAllByRole('checkbox').every(box => (box as HTMLInputElement).checked)).toBe(true)
	})

	it.each([
		{ name: 'isDisabled', props: { isDisabled: true } },
		{ name: 'isBusy', props: { isBusy: true } },
	])('при $name подтемы и «Отметить изученной» недоступны', ({ props }) => {
		renderPanel({ view: FULL, props })
		expect(screen.getByRole('checkbox', { name: 'Теги' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Отметить изученной' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Ещё' })).toBeDisabled()
	})

	it('закрытая тема нельзя отметить, подтемы недоступны', () => {
		renderPanel({ view: { ...FULL, state: { ...FULL.state, status: 'locked' } } })
		expect(screen.getByRole('button', { name: 'Отметить изученной' })).toBeDisabled()
		expect(screen.getByRole('checkbox', { name: 'Теги' })).toBeDisabled()
	})

	it('кнопка отметки: «изучена» и «вернуть в работу» сообщают нужный статус', async () => {
		const first = renderPanel()
		await first.user.click(screen.getByRole('button', { name: 'Отметить изученной' }))
		expect(first.emitted()['set-status']).toEqual([['t1', 'done']])
		first.unmount()
		const second = renderPanel({ view: topicView({ status: 'done' }) })
		await second.user.click(screen.getByRole('button', { name: 'Вернуть в работу' }))
		expect(second.emitted()['set-status']).toEqual([['t1', null]])
	})

	it('меню «Ещё»: пропустить и сбросить сообщают статус', async () => {
		const { user, emitted } = renderPanel({ view: topicView({ status: 'in-progress' }) })
		await user.click(screen.getByRole('button', { name: 'Ещё' }))
		await user.click(await screen.findByRole('menuitem', { name: 'Пропустить' }))
		await user.click(screen.getByRole('button', { name: 'Ещё' }))
		await user.click(await screen.findByRole('menuitem', { name: 'Сбросить' }))
		expect(emitted()['set-status']).toEqual([
			['t1', 'skipped'],
			['t1', null],
		])
	})

	it.each([
		{ status: 'skipped', skipDisabled: true, resetDisabled: false },
		{ status: 'available', skipDisabled: false, resetDisabled: true },
		{ status: 'locked', skipDisabled: true, resetDisabled: true },
		{ status: 'done', skipDisabled: false, resetDisabled: false },
	] as const)('пункты меню при статусе $status', async ({ status, skipDisabled, resetDisabled }) => {
		const user = userEvent.setup()
		render(RoadmapTopicPanel, {
			props: { view: topicView({ status }), stage: stageView(), doneSubtopics: [], requirements: [], ui },
		})
		await user.click(screen.getByRole('button', { name: 'Ещё' }))
		const skip = await screen.findByRole('menuitem', { name: 'Пропустить' })
		const reset = screen.getByRole('menuitem', { name: 'Сбросить' })
		expect(isDisabledItem(skip)).toBe(skipDisabled)
		expect(isDisabledItem(reset)).toBe(resetDisabled)
	})

	it('требования: кнопки со статусом, нажатие сообщает id', async () => {
		const { user, emitted } = renderPanel({
			props: {
				requirements: [
					{ id: 'r1', title: 'HTML', status: 'done', isStage: false },
					{ id: 's0', title: 'Этап 0', status: 'locked', isStage: true },
				],
			},
		})
		const section = screen.getByText('Нужно знать').closest('section') as HTMLElement
		await user.click(within(section).getByRole('button', { name: /^HTML.*изучена/ }))
		expect(within(section).getByRole('button', { name: /^Этап 0.*закрыта/ })).toHaveClass('base-roadmap__requirement--locked')
		expect(emitted().select).toEqual([['r1']])
	})

	it('«Следующая тема» есть только при hasNext и сообщает next', async () => {
		const first = renderPanel()
		expect(screen.queryByRole('button', { name: 'Следующая тема' })).not.toBeInTheDocument()
		first.unmount()
		const second = renderPanel({ props: { hasNext: true } })
		await second.user.click(screen.getByRole('button', { name: 'Следующая тема' }))
		expect(second.emitted().next).toHaveLength(1)
	})

	it('слоты topic-details и material', () => {
		renderPanel({
			view: FULL,
			slots: {
				'topic-details': ({ topic }: { topic: { title: string } }) => h('p', `Блок ${topic.title}`),
				material: ({ material }: { material: { title: string } }) => h('p', `Материал ${material.title}`),
			},
		})
		expect(screen.getByText('Блок HTML')).toBeInTheDocument()
		expect(screen.getByText('Материал Лекция')).toBeInTheDocument()
	})

	it('материалы по умолчанию — список ссылок', () => {
		renderPanel({ view: FULL })
		expect(screen.getByText('Лекция')).toBeInTheDocument()
		expect(screen.getByText('Видео · 30 мин')).toBeInTheDocument()
	})
})
