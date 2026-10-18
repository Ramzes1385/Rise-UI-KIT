import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { renderRoadmap } from '../fixtures/renderRoadmap'
import { fireEvent, screen, within } from '@testing-library/vue'
import { CSS_UNLOCKED, EMPTY_PROGRESS, HTML_DONE } from '../fixtures/shellFixtures'

function topicRow(name: string): HTMLElement {
	return screen.getByRole('button', { name: new RegExp(`^${name}`) }).closest('[data-topic-id]') as HTMLElement
}

function statusIcon(name: string): HTMLElement {
	return topicRow(name).querySelector('.base-roadmap__topic-icon') as HTMLElement
}

describe('BaseRoadmap: v-model:progress', () => {
	it('отметка в панели темы изучает её и сообщает новый прогресс', async () => {
		const { user, emitted } = await renderRoadmap()
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(screen.getByRole('button', { name: 'Отметить изученной' }))
		const [progress] = (emitted()['update:progress'] as unknown[][]).at(-1) as [{ topics: Record<string, { status: string }> }]
		expect(progress.topics.html.status).toBe('done')
		expect(emitted()['status-change']).toHaveLength(1)
		expect(emitted()['topic-complete']).toHaveLength(1)
		expect(screen.getByText('1 из 5 тем')).toBeInTheDocument()
		expect(screen.getByRole('progressbar', { name: 'Прогресс пути' })).toHaveAttribute('aria-valuenow', '20')
		expect(screen.getByRole('button', { name: 'Вернуть в работу' })).toBeInTheDocument()
	})

	it('повторное нажатие возвращает тему в работу', async () => {
		const { user } = await renderRoadmap({ props: { progress: HTML_DONE } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(screen.getByRole('button', { name: 'Вернуть в работу' }))
		expect(screen.getByRole('button', { name: /^HTML.*доступна/ })).toBeInTheDocument()
	})

	it('progress из пропса определяет состояние тем и открывает зависимые', async () => {
		const { rerender } = await renderRoadmap({ props: { progress: EMPTY_PROGRESS } })
		expect(screen.getByRole('button', { name: /^CSS.*закрыта: нужно знать HTML/ })).toBeInTheDocument()
		await rerender({ progress: HTML_DONE })
		expect(screen.getByRole('button', { name: /^HTML.*изучена/ })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /^CSS.*доступна/ })).toBeInTheDocument()
		await rerender({ progress: CSS_UNLOCKED })
		expect(screen.getByRole('button', { name: /^React/ })).toBeInTheDocument()
	})

	it('отметка подтемы переводит тему в процесс и сообщает прогресс', async () => {
		const { user, emitted } = await renderRoadmap()
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(screen.getByRole('checkbox', { name: 'Теги' }))
		expect(screen.getByRole('checkbox', { name: 'Теги' })).toBeChecked()
		expect(screen.getByRole('button', { name: /^HTML.*в процессе, 1 из 2 подтем/ })).toBeInTheDocument()
		expect(emitted()['update:progress']).toHaveLength(1)
		await user.click(screen.getByRole('checkbox', { name: 'Теги' }))
		expect(screen.getByRole('checkbox', { name: 'Теги' })).not.toBeChecked()
	})

	it('снятие флажка подтемы у изученной темы возвращает её в процесс', async () => {
		const { user, emitted } = await renderRoadmap({ props: { progress: HTML_DONE, selected: 'html' } })
		const boxes = within(screen.getByRole('complementary', { name: 'Подробности темы' })).getAllByRole('checkbox')
		expect(boxes.every(box => (box as HTMLInputElement).checked)).toBe(true)
		await user.click(screen.getByRole('checkbox', { name: 'Теги' }))
		expect(screen.getByRole('checkbox', { name: 'Теги' })).not.toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Формы' })).toBeChecked()
		expect(screen.getByRole('button', { name: /^HTML.*в процессе, 1 из 2 подтем/ })).toBeInTheDocument()
		expect(emitted()['status-change']).toEqual([[expect.objectContaining({ from: 'done', to: 'in-progress', source: 'subtopic' })]])
		expect(screen.getByRole('status')).toHaveTextContent('HTML: в процессе · 0 из 5 тем')
	})

	it('пропуск и сброс через меню «Ещё»', async () => {
		const { user } = await renderRoadmap()
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(screen.getByRole('button', { name: 'Ещё' }))
		await user.click(await screen.findByRole('menuitem', { name: 'Пропустить' }))
		expect(screen.getByRole('button', { name: /^HTML.*пропущена/ })).toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: 'Ещё' }))
		await user.click(await screen.findByRole('menuitem', { name: 'Сбросить' }))
		expect(screen.getByRole('button', { name: /^HTML.*доступна/ })).toBeInTheDocument()
	})

	it('значок статуса мышью отмечает тему и снимает отметку', async () => {
		const { user } = await renderRoadmap()
		await user.click(statusIcon('HTML'))
		expect(screen.getByRole('button', { name: /^HTML.*изучена/ })).toBeInTheDocument()
		await user.click(statusIcon('HTML'))
		expect(screen.getByRole('button', { name: /^HTML.*доступна/ })).toBeInTheDocument()
	})

	it('значок статуса пальцем открывает панель, а не отмечает', async () => {
		const { emitted } = await renderRoadmap()
		await fireEvent(statusIcon('HTML'), new PointerEvent('click', { pointerType: 'touch', bubbles: true }))
		expect(screen.getByRole('complementary', { name: 'Подробности темы' })).toBeInTheDocument()
		expect(emitted()['update:progress']).toBeUndefined()
	})

	it('значок закрытой темы открывает панель с требованиями', async () => {
		const { user } = await renderRoadmap()
		await user.click(statusIcon('CSS'))
		const panel = screen.getByRole('complementary', { name: 'Подробности темы' })
		expect(within(panel).getByRole('heading', { name: 'CSS' })).toBeInTheDocument()
		expect(within(panel).getByRole('button', { name: 'Отметить изученной' })).toBeDisabled()
	})

	it('isDisabled запрещает отметки', async () => {
		const { user } = await renderRoadmap({ props: { isDisabled: true } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		expect(screen.getByRole('button', { name: 'Отметить изученной' })).toBeDisabled()
		expect(screen.getByRole('checkbox', { name: 'Теги' })).toBeDisabled()
		expect(screen.getByRole('region', { name: 'Фронтенд' })).toHaveAttribute('aria-disabled', 'true')
	})
})

describe('BaseRoadmap: v-model:expanded', () => {
	it('по умолчанию раскрыт текущий этап', async () => {
		await renderRoadmap()
		expect(screen.getByRole('button', { name: /Основы/ })).toHaveAttribute('aria-expanded', 'true')
		expect(screen.getByRole('button', { name: /Фреймворки/ })).not.toHaveAttribute('aria-expanded')
		expect(screen.queryByRole('button', { name: /^React/ })).not.toBeInTheDocument()
	})

	it('нажатие на заголовок сворачивает и разворачивает этап, сообщая список', async () => {
		const { user, emitted } = await renderRoadmap()
		await user.click(screen.getByRole('button', { name: /Основы/ }))
		expect(screen.queryByRole('button', { name: /^HTML/ })).not.toBeInTheDocument()
		expect(emitted()['update:expanded']).toEqual([[[]]])
		await user.click(screen.getByRole('button', { name: /Основы/ }))
		expect(emitted()['update:expanded']).toEqual([[[]], [['basics']]])
		expect(screen.getByRole('button', { name: /^HTML/ })).toBeInTheDocument()
	})

	it('expanded из пропса раскрывает нужные этапы', async () => {
		await renderRoadmap({ props: { expanded: ['frameworks'], progress: CSS_UNLOCKED } })
		expect(screen.getByRole('button', { name: /^React/ })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: /^HTML/ })).not.toBeInTheDocument()
	})

	it('закрытый этап не раскрывается нажатием', async () => {
		const { user, emitted } = await renderRoadmap()
		await user.click(screen.getByRole('button', { name: /Фреймворки/ }))
		expect(emitted()['update:expanded']).toBeUndefined()
		expect(screen.getByRole('button', { name: /Фреймворки/ })).toHaveAttribute('aria-disabled', 'true')
	})
})

describe('BaseRoadmap: v-model:selected', () => {
	it('выбор темы сообщает id и тему', async () => {
		const { user, emitted } = await renderRoadmap()
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		expect(emitted()['update:selected']).toEqual([['html']])
		expect(emitted().select).toEqual([[expect.objectContaining({ id: 'html' })]])
		expect(screen.getByRole('button', { name: /^HTML/ })).toHaveAttribute('aria-pressed', 'true')
	})

	it('selected из пропса открывает панель, смена пропса переключает тему', async () => {
		const { rerender } = await renderRoadmap({ props: { selected: 'css' } })
		expect(screen.getByRole('heading', { name: 'CSS', level: 2 })).toBeInTheDocument()
		await rerender({ selected: 'git' })
		expect(screen.getByRole('heading', { name: 'Git', level: 2 })).toBeInTheDocument()
		await rerender({ selected: null })
		expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
	})

	it('неизвестный selected панель не открывает', async () => {
		await renderRoadmap({ props: { selected: 'nope' } })
		expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
	})
})

describe('BaseRoadmap: v-model:filter', () => {
	it('фильтр сообщает значение и приглушает лишние темы', async () => {
		const { user, emitted } = await renderRoadmap()
		await user.click(screen.getByRole('radio', { name: 'Обязательные' }))
		expect(emitted()['update:filter']).toEqual([['required']])
		expect(topicRow('Git')).toHaveClass('base-roadmap__topic--filtered')
		expect(topicRow('HTML')).not.toHaveClass('base-roadmap__topic--filtered')
		await user.click(screen.getByRole('radio', { name: 'По желанию' }))
		expect(topicRow('HTML')).toHaveClass('base-roadmap__topic--filtered')
		expect(topicRow('Git')).not.toHaveClass('base-roadmap__topic--filtered')
	})

	it('filter из пропса задаёт выбранный сегмент', async () => {
		const { rerender } = await renderRoadmap({ props: { filter: 'optional' } })
		expect(screen.getByRole('radio', { name: 'По желанию' })).toBeChecked()
		await rerender({ filter: 'all' })
		expect(screen.getByRole('radio', { name: 'Все' })).toBeChecked()
	})

	it('hasFilter: false убирает фильтр', async () => {
		await renderRoadmap({ props: { hasFilter: false } })
		expect(screen.queryByRole('radiogroup', { name: 'Какие темы показывать' })).not.toBeInTheDocument()
	})
})

describe('BaseRoadmap: beforeStatusChange', () => {
	it('получает тему, прежний и новый статус и источник', async () => {
		const beforeStatusChange = vi.fn()
		const { user } = await renderRoadmap({ props: { beforeStatusChange } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(screen.getByRole('button', { name: 'Отметить изученной' }))
		expect(beforeStatusChange).toHaveBeenCalledWith({
			topic: expect.objectContaining({ id: 'html' }),
			from: 'available',
			to: 'done',
			source: 'user',
		})
		expect(screen.getByRole('button', { name: /^HTML.*изучена/ })).toBeInTheDocument()
	})

	it('синхронный false отменяет смену', async () => {
		const { user, emitted } = await renderRoadmap({ props: { beforeStatusChange: () => false } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(screen.getByRole('button', { name: 'Отметить изученной' }))
		expect(screen.getByRole('button', { name: /^HTML.*доступна/ })).toBeInTheDocument()
		expect(emitted()['update:progress']).toBeUndefined()
		expect(emitted()['status-change']).toBeUndefined()
		expect(screen.getByRole('status')).toHaveTextContent('')
	})

	it('синхронный true разрешает смену', async () => {
		const { user } = await renderRoadmap({ props: { beforeStatusChange: () => true } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(screen.getByRole('button', { name: 'Отметить изученной' }))
		expect(screen.getByRole('button', { name: /^HTML.*изучена/ })).toBeInTheDocument()
	})

	it('асинхронный хук: пока ждём, тема занята, потом смена применяется', async () => {
		let resolve: (value: boolean) => void = () => undefined
		const hook = () => new Promise<boolean>(done => (resolve = done))
		const { user } = await renderRoadmap({ props: { beforeStatusChange: hook } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(screen.getByRole('button', { name: 'Отметить изученной' }))
		expect(screen.getByRole('complementary', { name: 'Подробности темы' }).firstElementChild).toHaveAttribute('aria-busy', 'true')
		expect(screen.getByRole('button', { name: 'Отметить изученной' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Ещё' })).toBeDisabled()
		expect(screen.getByRole('checkbox', { name: 'Теги' })).toBeDisabled()
		resolve(true)
		expect(await screen.findByRole('button', { name: /^HTML.*изучена/ })).toBeInTheDocument()
		expect(screen.getByRole('complementary', { name: 'Подробности темы' }).firstElementChild).not.toHaveAttribute('aria-busy')
	})

	it('пока хук ждёт, строка темы в списке и в раскладке «Путь» помечена aria-busy', async () => {
		let resolve: (value: boolean) => void = () => undefined
		const hook = () => new Promise<boolean>(done => (resolve = done))
		const { user } = await renderRoadmap({ props: { beforeStatusChange: hook } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(screen.getByRole('button', { name: 'Отметить изученной' }))
		expect(topicRow('HTML')).toHaveAttribute('aria-busy', 'true')
		expect(topicRow('CSS')).not.toHaveAttribute('aria-busy')
		await user.click(screen.getByRole('radio', { name: 'Путь' }))
		expect(document.querySelector('[data-topic-id="html"]')).toHaveAttribute('aria-busy', 'true')
		resolve(true)
		await vi.waitFor(() => expect(document.querySelector('[data-topic-id="html"]')).not.toHaveAttribute('aria-busy'))
	})

	it('асинхронный false отменяет смену и освобождает тему', async () => {
		const { user, emitted } = await renderRoadmap({ props: { beforeStatusChange: () => Promise.resolve(false) } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(screen.getByRole('button', { name: 'Отметить изученной' }))
		await vi.waitFor(() =>
			expect(screen.getByRole('complementary', { name: 'Подробности темы' }).firstElementChild).not.toHaveAttribute('aria-busy'),
		)
		expect(screen.getByRole('button', { name: /^HTML.*доступна/ })).toBeInTheDocument()
		expect(emitted()['update:progress']).toBeUndefined()
	})

	it('упавший хук отменяет смену и пишет предупреждение', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { user } = await renderRoadmap({ props: { beforeStatusChange: () => Promise.reject(new Error('нет прав')) } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(screen.getByRole('button', { name: 'Отметить изученной' }))
		await vi.waitFor(() => expect(warn).toHaveBeenCalledTimes(1))
		expect(warn.mock.calls[0][0]).toContain('нет прав')
		expect(screen.getByRole('button', { name: /^HTML.*доступна/ })).toBeInTheDocument()
	})

	it('хук вызывается и для подтем с источником subtopic', async () => {
		const beforeStatusChange = vi.fn()
		const { user } = await renderRoadmap({ props: { beforeStatusChange } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(screen.getByRole('checkbox', { name: 'Теги' }))
		expect(beforeStatusChange).toHaveBeenCalledWith(expect.objectContaining({ source: 'subtopic', to: 'in-progress' }))
	})
})
