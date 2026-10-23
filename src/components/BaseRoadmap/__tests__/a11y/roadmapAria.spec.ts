import '@testing-library/jest-dom/vitest'
import { CSS_UNLOCKED } from '../fixtures/shellFixtures'
import { renderRoadmap } from '../fixtures/renderRoadmap'
import { screen, waitFor, within } from '@testing-library/vue'

describe('BaseRoadmap: доступность', () => {
	it('корень — область с именем из заголовка или из ariaLabel', async () => {
		const first = await renderRoadmap()
		expect(screen.getByRole('region', { name: 'Фронтенд' })).toBeInTheDocument()
		first.unmount()
		await renderRoadmap({ props: { ariaLabel: 'Мой путь' } })
		expect(screen.getByRole('region', { name: 'Мой путь' })).toBeInTheDocument()
	})

	it('aria-controls есть только у раскрытого этапа и указывает на существующий список', async () => {
		const { user } = await renderRoadmap()
		const open = screen.getByRole('button', { name: /Основы/ })
		const locked = screen.getByRole('button', { name: /Фреймворки/ })
		expect(locked).not.toHaveAttribute('aria-controls')
		const id = open.getAttribute('aria-controls') as string
		const list = document.getElementById(id) as HTMLElement
		expect(list).toBeInTheDocument()
		expect(list).toHaveAttribute('aria-labelledby', (open.closest('h3') as HTMLElement).id)
		await user.click(open)
		expect(open).not.toHaveAttribute('aria-controls')
		await waitFor(() => expect(document.getElementById(id)).toBeNull())
		await user.click(open)
		expect(open).toHaveAttribute('aria-controls', id)
		expect(document.getElementById(id)).toBeInTheDocument()
	})

	it('закрытый этап — статичная кнопка без aria-expanded с aria-disabled и подсказкой', async () => {
		await renderRoadmap()
		const locked = screen.getByRole('button', { name: /Фреймворки/ })
		expect(locked).toHaveAttribute('aria-disabled', 'true')
		expect(locked).not.toHaveAttribute('aria-expanded')
		expect(locked).toHaveAccessibleName(/Этап 2,\s*Фреймворки, закрыт.*Откроется после «CSS»/)
	})

	it('заголовки этапов — h3 с номером и состоянием для скринридера', async () => {
		await renderRoadmap()
		expect(screen.getByRole('heading', { name: /Этап 1,\s*Основы, текущий/, level: 3 })).toBeInTheDocument()
	})

	it('живой регион пуст при монтировании и объявляет итог действия', async () => {
		const { user } = await renderRoadmap({ props: { selected: 'html' } })
		const live = screen.getByRole('status')
		expect(live).toHaveAttribute('aria-live', 'polite')
		expect(live).toHaveAttribute('aria-atomic', 'true')
		expect(live).toHaveTextContent('')
		await user.click(within(screen.getByRole('complementary')).getByRole('button', { name: 'Отметить изученной' }))
		expect(live).toHaveTextContent('HTML изучена · 1 из 5 тем')
		await user.click(within(screen.getByRole('complementary')).getByRole('button', { name: 'Вернуть в работу' }))
		expect(live).toHaveTextContent('HTML: отметка снята · 0 из 5 тем')
	})

	it('повторное одинаковое объявление меняет текст, чтобы его озвучили заново', async () => {
		const data = {
			version: 1,
			title: 'Путь',
			stages: [
				{
					id: 's',
					title: 'Этап',
					topics: [
						{
							id: 'x',
							title: 'Тема',
							subtopics: [
								{ id: 'a', title: 'Первая' },
								{ id: 'b', title: 'Вторая' },
								{ id: 'c', title: 'Третья' },
							],
						},
					],
				},
			],
		}
		const { user } = await renderRoadmap({ props: { data, selected: 'x' } })
		const live = screen.getByRole('status')
		await user.click(screen.getByRole('checkbox', { name: 'Первая' }))
		const first = live.textContent
		await user.click(screen.getByRole('checkbox', { name: 'Вторая' }))
		expect(live.textContent).not.toBe(first)
		expect(live.textContent?.trim()).toBe(first?.trim())
	})

	it('пропуск, прогресс по подтемам и сброс объявляются', async () => {
		const { user } = await renderRoadmap({ props: { selected: 'html' } })
		const live = screen.getByRole('status')
		await user.click(within(screen.getByRole('complementary')).getByRole('checkbox', { name: 'Теги' }))
		expect(live).toHaveTextContent('HTML: в процессе · 0 из 5 тем')
		await user.click(screen.getByRole('button', { name: 'Ещё' }))
		await user.click(await screen.findByRole('menuitem', { name: 'Пропустить' }))
		expect(live).toHaveTextContent('HTML пропущена · 0 из 5 тем')
	})

	it('отклонённая смена ничего не объявляет', async () => {
		const { user } = await renderRoadmap({ props: { selected: 'html', beforeStatusChange: () => false } })
		await user.click(within(screen.getByRole('complementary')).getByRole('button', { name: 'Отметить изученной' }))
		expect(screen.getByRole('status')).toHaveTextContent('')
	})

	it('isLoading: aria-busy, группа загрузки с именем, остальных элементов нет', async () => {
		await renderRoadmap({ props: { isLoading: true } })
		expect(screen.getByRole('region', { name: 'Фронтенд' })).toHaveAttribute('aria-busy', 'true')
		expect(screen.getByRole('group', { name: 'Загрузка пути' })).toBeInTheDocument()
		expect(screen.queryByRole('heading', { name: 'Фронтенд' })).not.toBeInTheDocument()
		expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
	})

	it('без загрузки aria-busy и aria-disabled нет', async () => {
		await renderRoadmap()
		const region = screen.getByRole('region', { name: 'Фронтенд' })
		expect(region).not.toHaveAttribute('aria-busy')
		expect(region).not.toHaveAttribute('aria-disabled')
	})

	it('выбранная тема — aria-pressed, у остальных false', async () => {
		await renderRoadmap({ props: { selected: 'git' } })
		expect(screen.getByRole('button', { name: /^Git/ })).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByRole('button', { name: /^HTML/ })).toHaveAttribute('aria-pressed', 'false')
	})

	it('имя темы включает статус, вид и подтемы, а значок скрыт от скринридера', async () => {
		await renderRoadmap({
			props: {
				progress: { version: 1, topics: { html: { status: 'in-progress', subtopics: ['tags'] } } },
				expanded: ['basics', 'frameworks'],
			},
		})
		expect(screen.getByRole('button', { name: /^HTML.*в процессе, 1 из 2 подтем/ })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /^Git.*по желанию/ })).toBeInTheDocument()
		const row = screen.getByRole('button', { name: /^HTML/ }).closest('[data-topic-id]') as HTMLElement
		expect(row.querySelector('.base-roadmap__topic-icon')).toHaveAttribute('aria-hidden', 'true')
	})

	it('альтернативные темы и рекомендованная названы словами', async () => {
		await renderRoadmap({ props: { progress: CSS_UNLOCKED, expanded: ['frameworks'] } })
		expect(screen.getByRole('button', { name: /^React.*советуем/ })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /^Vue.*альтернатива/ })).toBeInTheDocument()
	})

	it('легенда — список с именем, декоративные значки скрыты', async () => {
		await renderRoadmap()
		const legend = screen.getByRole('list', { name: 'Обозначения' })
		expect(within(legend).getAllByRole('listitem')).toHaveLength(6)
		expect(legend.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0)
	})

	it('панель сбоку — aside с именем, шторка — диалог с названием темы', async () => {
		const side = await renderRoadmap({ props: { selected: 'html' } })
		expect(screen.getByRole('complementary', { name: 'Подробности темы' })).toBeInTheDocument()
		side.unmount()
		await renderRoadmap({ props: { selected: 'html', detailsPosition: 'sheet' } })
		const dialog = await screen.findByRole('dialog', { name: 'HTML' })
		expect(dialog).toHaveAttribute('aria-modal', 'true')
	})

	it('сводка: прогресс пути — progressbar с значением', async () => {
		await renderRoadmap({ props: { progress: CSS_UNLOCKED } })
		const bar = screen.getByRole('progressbar', { name: 'Прогресс пути' })
		expect(bar).toHaveAttribute('aria-valuenow', '40')
		expect(bar).toHaveAttribute('aria-valuemin', '0')
		expect(bar).toHaveAttribute('aria-valuemax', '100')
	})

	it('требования в панели читаются со статусом', async () => {
		await renderRoadmap({ props: { selected: 'css' } })
		const requirement = within(screen.getByRole('complementary')).getByRole('button', { name: /^HTML/ })
		expect(requirement).toHaveAccessibleName(/доступна/)
	})
})
