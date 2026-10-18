import '@testing-library/jest-dom/vitest'
import { CSS_UNLOCKED } from '../fixtures/shellFixtures'
import { renderRoadmap } from '../fixtures/renderRoadmap'
import { screen, waitFor, within } from '@testing-library/vue'

describe('BaseRoadmap: клавиатура', () => {
	it('Enter и пробел на заголовке этапа сворачивают и раскрывают его', async () => {
		const { user, emitted } = await renderRoadmap()
		const header = screen.getByRole('button', { name: /Основы/ })
		header.focus()
		await user.keyboard('{Enter}')
		expect(header).toHaveAttribute('aria-expanded', 'false')
		await user.keyboard(' ')
		expect(header).toHaveAttribute('aria-expanded', 'true')
		expect(emitted()['update:expanded']).toEqual([[[]], [['basics']]])
	})

	it('Enter на теме открывает панель, Escape закрывает и возвращает фокус', async () => {
		const { user } = await renderRoadmap()
		screen.getByRole('button', { name: /^HTML/ }).focus()
		await user.keyboard('{Enter}')
		const panel = screen.getByRole('complementary', { name: 'Подробности темы' })
		expect(within(panel).getByRole('heading', { name: 'HTML' })).toBeInTheDocument()
		await user.keyboard('{Escape}')
		expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
		await waitFor(() => expect(screen.getByRole('button', { name: /^HTML/ })).toHaveFocus())
	})

	it('фокус на элементе панели: Escape тоже закрывает её', async () => {
		const { user } = await renderRoadmap({ props: { selected: 'html' } })
		await user.click(within(screen.getByRole('complementary')).getByRole('checkbox', { name: 'Теги' }))
		await user.keyboard('{Escape}')
		expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
		await waitFor(() => expect(screen.getByRole('button', { name: /^HTML/ })).toHaveFocus())
	})

	it('пробел отмечает подтему, Tab доходит до кнопок панели', async () => {
		const { user } = await renderRoadmap({ props: { selected: 'html' } })
		const panel = screen.getByRole('complementary')
		within(panel).getByRole('checkbox', { name: 'Теги' }).focus()
		await user.keyboard(' ')
		expect(within(panel).getByRole('checkbox', { name: 'Теги' })).toBeChecked()
		await user.tab()
		expect(within(panel).getByRole('checkbox', { name: 'Формы' })).toHaveFocus()
	})

	it('Enter на «Отметить изученной» отмечает тему', async () => {
		const { user } = await renderRoadmap({ props: { selected: 'html' } })
		within(screen.getByRole('complementary')).getByRole('button', { name: 'Отметить изученной' }).focus()
		await user.keyboard('{Enter}')
		expect(screen.getByRole('button', { name: /^HTML.*изучена/ })).toBeInTheDocument()
	})

	it('в шторке Tab остаётся внутри диалога', async () => {
		const { user } = await renderRoadmap({ props: { selected: 'css', detailsPosition: 'sheet', progress: CSS_UNLOCKED } })
		const dialog = await screen.findByRole('dialog')
		await user.tab()
		expect(dialog).toContainElement(document.activeElement as HTMLElement)
	})

	it('закрытая тема получает фокус и открывается с клавиатуры', async () => {
		const { user } = await renderRoadmap()
		screen.getByRole('button', { name: /^CSS/ }).focus()
		await user.keyboard('{Enter}')
		expect(within(screen.getByRole('complementary')).getByRole('heading', { name: 'CSS' })).toBeInTheDocument()
	})

	it('закрытый этап не раскрывается с клавиатуры', async () => {
		const { user, emitted } = await renderRoadmap()
		screen.getByRole('button', { name: /Фреймворки/ }).focus()
		await user.keyboard('{Enter}')
		expect(emitted()['update:expanded']).toBeUndefined()
	})
})
