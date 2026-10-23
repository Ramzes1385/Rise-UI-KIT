import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { UI_ARIA } from '@/locales/messages'
import { renderRoadmap } from '../fixtures/renderRoadmap'
import { CSS_UNLOCKED, HTML_DONE } from '../fixtures/shellFixtures'
import { fireEvent, screen, waitFor, within } from '@testing-library/vue'

const PANEL = 'Подробности темы'

function sidePanel(): HTMLElement {
	return screen.getByRole('complementary', { name: PANEL })
}

describe('BaseRoadmap: панель сбоку', () => {
	it('в широком контейнере тема открывается в боковой панели без диалога', async () => {
		const { user } = await renderRoadmap()
		expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		const panel = sidePanel()
		expect(within(panel).getByRole('heading', { name: 'HTML', level: 2 })).toBeInTheDocument()
		expect(within(panel).getByText('Разметка страниц')).toBeInTheDocument()
		expect(within(panel).getByText('Этап 1 · Основы')).toBeInTheDocument()
		expect(within(panel).getByText('4 ч')).toBeInTheDocument()
		expect(within(panel).getByText('Обязательная')).toBeInTheDocument()
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})

	it('Escape закрывает панель и возвращает фокус на строку темы', async () => {
		const { user, emitted } = await renderRoadmap()
		const topic = screen.getByRole('button', { name: /^HTML/ })
		await user.click(topic)
		await user.keyboard('{Escape}')
		expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
		expect(emitted()['update:selected']).toEqual([['html'], [null]])
		await waitFor(() => expect(screen.getByRole('button', { name: /^HTML/ })).toHaveFocus())
	})

	it('Escape не закрывает то, что в боковой панели не открыто, и не мешает снаружи', async () => {
		const { user, emitted } = await renderRoadmap()
		screen.getByRole('button', { name: /^HTML/ }).focus()
		await user.keyboard('{Escape}')
		expect(emitted()['update:selected']).toBeUndefined()
	})

	it('Escape в боковой панели не всплывает выше', async () => {
		const { user } = await renderRoadmap()
		const onOuterKeydown = vi.fn()
		document.body.addEventListener('keydown', onOuterKeydown)
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.keyboard('{Escape}')
		document.body.removeEventListener('keydown', onOuterKeydown)
		expect(onOuterKeydown).not.toHaveBeenCalled()
	})

	it('другие клавиши панель не закрывают', async () => {
		const { user } = await renderRoadmap()
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.keyboard('a')
		expect(sidePanel()).toBeInTheDocument()
	})

	it('выбор другой темы переключает содержимое панели', async () => {
		const { user } = await renderRoadmap()
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(screen.getByRole('button', { name: /^Git/ }))
		expect(within(sidePanel()).getByRole('heading', { name: 'Git' })).toBeInTheDocument()
		expect(within(sidePanel()).getByText('По желанию')).toBeInTheDocument()
	})
})

describe('BaseRoadmap: панель в содержимом темы', () => {
	it('подтемы с долей выполнения, описание и материалы', async () => {
		const { user } = await renderRoadmap({ props: { selected: 'html' } })
		const panel = sidePanel()
		expect(within(panel).getByRole('list', { name: 'Подтемы' })).toBeInTheDocument()
		expect(within(panel).getAllByRole('checkbox')).toHaveLength(2)
		await user.click(within(panel).getByRole('checkbox', { name: 'Формы' }))
		expect(within(panel).getByText('1 из 2 подтем')).toBeInTheDocument()
		expect(within(panel).getByText('50 %')).toBeInTheDocument()
		expect(within(panel).getByRole('progressbar', { name: 'Что изучить' })).toHaveAttribute('aria-valuenow', '50')
	})

	it('у изученной темы все подтемы отмечены', async () => {
		await renderRoadmap({ props: { selected: 'html', progress: HTML_DONE } })
		const boxes = within(sidePanel()).getAllByRole('checkbox')
		expect(boxes.every(box => (box as HTMLInputElement).checked)).toBe(true)
	})

	it('материалы: внешняя ссылка открывается в новой вкладке, внутренняя — нет', async () => {
		await renderRoadmap({ props: { selected: 'html' } })
		const panel = sidePanel()
		const external = within(panel).getByRole('link', { name: /MDN/ })
		expect(external).toHaveAttribute('target', '_blank')
		expect(external).toHaveAttribute('rel', 'noopener noreferrer')
		expect(external).toHaveAttribute('href', 'https://developer.mozilla.org/html')
		expect(within(external).getByText(UI_ARIA.OPENS_IN_NEW_TAB)).toBeInTheDocument()
		const local = within(panel).getByRole('link', { name: /Внутренняя/ })
		expect(local).not.toHaveAttribute('target')
		expect(local).not.toHaveAttribute('rel')
		expect(within(panel).getByText('Видео · 1,5 ч')).toBeInTheDocument()
		expect(within(panel).getByText('Заметка').closest('a')).toBeNull()
	})

	it('требования показывают статус и ведут к теме', async () => {
		const { user } = await renderRoadmap({ props: { selected: 'css' } })
		const requirement = within(sidePanel()).getByRole('button', { name: /^HTML.*доступна/ })
		await user.click(requirement)
		expect(within(sidePanel()).getByRole('heading', { name: 'HTML', level: 2 })).toBeInTheDocument()
	})

	it('требование-этап раскрывает этот этап', async () => {
		const data = {
			version: 1,
			title: 'Два',
			stages: [
				{ id: 'a', title: 'Первый', topics: [{ id: 'a1', title: 'Азы' }] },
				{ id: 'b', title: 'Второй', topics: [{ id: 'b1', title: 'Дальше', requires: ['a'] }] },
			],
		}
		const { user, emitted } = await renderRoadmap({ props: { data, selected: 'b1', expanded: ['b'] } })
		await user.click(within(sidePanel()).getByRole('button', { name: /^Первый.*в процессе/ }))
		expect(emitted()['update:expanded']).toEqual([[['b', 'a']]])
		expect(emitted()['update:selected']).toBeUndefined()
	})

	it('«Следующая тема» открывает ближайшую неизученную', async () => {
		const { user } = await renderRoadmap({ props: { selected: 'html' } })
		await user.click(within(sidePanel()).getByRole('button', { name: 'Следующая тема' }))
		expect(within(sidePanel()).getByRole('heading', { name: 'Git', level: 2 })).toBeInTheDocument()
	})

	it('если других тем нет, «Следующая тема» не показывается', async () => {
		await renderRoadmap({
			props: {
				selected: 'solo',
				data: { version: 1, title: 'Один', stages: [{ id: 's', title: 'Этап', topics: [{ id: 'solo', title: 'Одна' }] }] },
			},
		})
		expect(within(sidePanel()).queryByRole('button', { name: 'Следующая тема' })).not.toBeInTheDocument()
	})

	it('«Следующая тема» раскрывает этап следующей темы', async () => {
		const { user } = await renderRoadmap({ props: { selected: 'css', progress: CSS_UNLOCKED, expanded: ['basics'] } })
		await user.click(within(sidePanel()).getByRole('button', { name: 'Следующая тема' }))
		expect(within(sidePanel()).getByRole('heading', { name: 'Git', level: 2 })).toBeInTheDocument()
		await user.click(within(sidePanel()).getByRole('button', { name: 'Следующая тема' }))
		expect(within(sidePanel()).getByRole('heading', { name: 'React', level: 2 })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /^React/ })).toHaveAttribute('aria-pressed', 'true')
	})
})

describe('BaseRoadmap: «Продолжить»', () => {
	it('кнопка в сводке выбирает первую тему и раскрывает её этап', async () => {
		const { user } = await renderRoadmap({ props: { expanded: [] } })
		expect(screen.queryByRole('button', { name: /^HTML/ })).not.toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: 'Продолжить: HTML' }))
		expect(screen.getByRole('button', { name: /^HTML/ })).toHaveAttribute('aria-pressed', 'true')
		expect(within(sidePanel()).getByRole('heading', { name: 'HTML', level: 2 })).toBeInTheDocument()
	})

	it('когда продолжать нечего, кнопки нет', async () => {
		const data = { version: 1, title: 'Готово', stages: [{ id: 's', title: 'Этап', topics: [{ id: 'a', title: 'A' }] }] }
		await renderRoadmap({ props: { data, progress: { version: 1, topics: { a: { status: 'done' } } } } })
		expect(screen.queryByRole('button', { name: /Продолжить/ })).not.toBeInTheDocument()
	})
})

describe('BaseRoadmap: шторка', () => {
	it('detailsPosition: sheet открывает тему в диалоге', async () => {
		const { user } = await renderRoadmap({ props: { detailsPosition: 'sheet' } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		const dialog = await screen.findByRole('dialog', { name: 'HTML' })
		expect(within(dialog).getByRole('button', { name: 'Отметить изученной' })).toBeInTheDocument()
		expect(within(dialog).queryByRole('heading', { name: 'HTML', level: 2 })).toBeInTheDocument()
		expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
	})

	it('auto: до 900 px — шторка, шире — панель сбоку', async () => {
		const narrow = await renderRoadmap({ width: 800, props: { narrowWidth: 500 } })
		await narrow.user.click(screen.getByRole('button', { name: /^HTML/ }))
		expect(await screen.findByRole('dialog')).toBeInTheDocument()
		narrow.unmount()
		const wide = await renderRoadmap({ width: 1000, props: { narrowWidth: 500 } })
		await wide.user.click(screen.getByRole('button', { name: /^HTML/ }))
		expect(sidePanel()).toBeInTheDocument()
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})

	it('кнопка «Закрыть» закрывает шторку, фокус возвращается на тему', async () => {
		const { user, emitted } = await renderRoadmap({ props: { detailsPosition: 'sheet' } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(await screen.findByRole('button', { name: 'Закрыть' }))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		expect(emitted()['update:selected']).toEqual([['html'], [null]])
		await waitFor(() => expect(screen.getByRole('button', { name: /^HTML/ })).toHaveFocus())
	})

	it('двойное нажатие «Закрыть» закрывает шторку один раз', async () => {
		const { user, emitted } = await renderRoadmap({ props: { detailsPosition: 'sheet' } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		const close = await screen.findByRole('button', { name: 'Закрыть' })
		close.click()
		close.click()
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		expect(emitted()['update:selected']).toEqual([['html'], [null]])
	})

	it('Escape закрывает шторку средствами диалога', async () => {
		const { user } = await renderRoadmap({ props: { detailsPosition: 'sheet' } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await screen.findByRole('dialog')
		await user.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await waitFor(() => expect(screen.getByRole('button', { name: /^HTML/ })).toHaveFocus())
	})

	it('жест «Назад» закрывает шторку', async () => {
		const push = vi.spyOn(window.history, 'pushState')
		const { user, emitted } = await renderRoadmap({ props: { detailsPosition: 'sheet' } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await screen.findByRole('dialog')
		expect(push).toHaveBeenCalledWith(expect.objectContaining({ riseRoadmapSheet: true }), '')
		window.dispatchEvent(new PopStateEvent('popstate'))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		expect(emitted()['update:selected']).toEqual([['html'], [null]])
	})

	it('свайп вниз по ручке закрывает шторку', async () => {
		const { user, emitted } = await renderRoadmap({ props: { detailsPosition: 'sheet' } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		const dialog = await screen.findByRole('dialog')
		const handle = document.querySelector('.base-drawer__handle') as HTMLElement
		await fireEvent.pointerDown(handle, { button: 0, clientY: 100, pointerId: 1 })
		await fireEvent.pointerMove(dialog, { clientY: 600 })
		await fireEvent.pointerUp(dialog)
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		expect(emitted()['update:selected']).toEqual([['html'], [null]])
	})

	it('при выборе в шторке боковой панели нет', async () => {
		const { user } = await renderRoadmap({ props: { detailsPosition: 'sheet' } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await screen.findByRole('dialog')
		expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
	})

	it('отметка в шторке меняет прогресс, а её закрытие не трогает его', async () => {
		const { user, emitted } = await renderRoadmap({ props: { detailsPosition: 'sheet' } })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		const dialog = await screen.findByRole('dialog')
		await user.click(within(dialog).getByRole('button', { name: 'Отметить изученной' }))
		expect(emitted()['update:progress']).toHaveLength(1)
		expect(within(dialog).getByRole('button', { name: 'Вернуть в работу' })).toBeInTheDocument()
	})
})
