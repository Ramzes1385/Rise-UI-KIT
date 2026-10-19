import { enableAutoUnmount } from '@vue/test-utils'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { liveText, mountEditor } from '../fixtures/renderEditor'
import { fireEvent, screen, within } from '@testing-library/vue'

vi.setConfig({ testTimeout: 60_000 })
enableAutoUnmount(afterEach)

const handle = (title: string) => screen.getByRole('button', { name: new RegExp(`Перетащить (тему|этап) «${title}»`) })
const order = (list: string) =>
	within(screen.getByRole('list', { name: list }))
		.getAllByRole('listitem')
		.map(item => item.getAttribute('data-roadmap-topic'))
		.filter(Boolean)
const stages = () => Array.from(document.querySelectorAll('[data-roadmap-stage]')).map(item => item.getAttribute('data-roadmap-stage'))

describe('перестановка с клавиатуры', () => {
	it('Alt+↓ и Alt+↑ двигают тему, фокус остаётся на рукояти, перемещение объявляется', async () => {
		const { user } = await mountEditor()
		handle('Тема a').focus()
		await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
		await vi.waitFor(() => expect(order('Этап s1')).toEqual(['b', 'a', 'c']))
		expect(liveText()).toContain('Тема «Тема a» перемещена: этап «Этап s1», место 2 из 3')
		await vi.waitFor(() => expect(handle('Тема a')).toHaveFocus())
		await user.keyboard('{Alt>}{ArrowUp}{/Alt}')
		await vi.waitFor(() => expect(order('Этап s1')).toEqual(['a', 'b', 'c']))
		await user.keyboard('{Alt>}{ArrowUp}{/Alt}')
		expect(order('Этап s1')).toEqual(['a', 'b', 'c'])
	})

	it('Alt+↓ у последней темы переносит её в начало следующего этапа', async () => {
		const { user } = await mountEditor()
		handle('Тема c').focus()
		await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
		await vi.waitFor(() => expect(order('Этап s2')).toEqual(['c', 'd', 'e']))
	})

	it('Alt+стрелки двигают этап', async () => {
		const { user } = await mountEditor()
		handle('Этап s1').focus()
		await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
		await vi.waitFor(() => expect(stages()).toEqual(['s2', 's1', 's3']))
		expect(liveText()).toContain('Этап «Этап s1» перемещён на место 2 из 3')
		await vi.waitFor(() => expect(handle('Этап s1')).toHaveFocus())
	})

	it('пробел берёт тему, стрелка двигает на предпросмотре, пробел кладёт одним шагом', async () => {
		const { user } = await mountEditor()
		handle('Тема a').focus()
		await user.keyboard(' ')
		expect(handle('Тема a')).toHaveAttribute('aria-pressed', 'true')
		expect(liveText()).toContain('Тема «Тема a» взята')
		await user.keyboard('{ArrowDown}')
		await vi.waitFor(() => expect(order('Этап s1')).toEqual(['b', 'a', 'c']))
		expect(screen.getByLabelText(UI_ROADMAP_EDIT.STATUS_LABEL)).toHaveTextContent(/Изменений\s*0/)
		await user.keyboard(' ')
		await vi.waitFor(() => expect(handle('Тема a')).toHaveAttribute('aria-pressed', 'false'))
		expect(order('Этап s1')).toEqual(['b', 'a', 'c'])
		expect(screen.getByLabelText(UI_ROADMAP_EDIT.STATUS_LABEL)).toHaveTextContent(/Изменений\s*1/)
		await vi.waitFor(() => expect(handle('Тема a')).toHaveFocus())
	})

	it('Escape возвращает порядок, ничего не записывая в историю', async () => {
		const { user } = await mountEditor()
		handle('Тема b').focus()
		await user.keyboard(' {ArrowUp}')
		await vi.waitFor(() => expect(order('Этап s1')).toEqual(['b', 'a', 'c']))
		await user.keyboard('{Escape}')
		await vi.waitFor(() => expect(order('Этап s1')).toEqual(['a', 'b', 'c']))
		expect(handle('Тема b')).toHaveAttribute('aria-pressed', 'false')
		expect(screen.getByLabelText(UI_ROADMAP_EDIT.STATUS_LABEL)).toHaveTextContent(/Изменений\s*0/)
	})

	it('этап берётся пробелом и ложится на новое место', async () => {
		const { user } = await mountEditor()
		handle('Этап s3').focus()
		await user.keyboard(' ')
		expect(liveText()).toContain('Этап «Этап s3» взят')
		await user.keyboard('{Home}')
		await vi.waitFor(() => expect(stages()).toEqual(['s3', 's1', 's2']))
		await user.keyboard('{Enter}')
		await vi.waitFor(() => expect(handle('Этап s3')).toHaveAttribute('aria-pressed', 'false'))
		expect(stages()).toEqual(['s3', 's1', 's2'])
	})

	it('посторонняя клавиша на рукояти и ввод через IME ничего не делают', async () => {
		const { user } = await mountEditor()
		handle('Тема a').focus()
		await user.keyboard('x')
		await fireEvent.keyDown(handle('Тема a'), { key: ' ', isComposing: true })
		await fireEvent.keyDown(handle('Тема a'), { key: 'ArrowDown', altKey: true, isComposing: true })
		expect(handle('Тема a')).toHaveAttribute('aria-pressed', 'false')
		expect(order('Этап s1')).toEqual(['a', 'b', 'c'])
	})

	it('клавиша Delete и Ctrl+D работают над выбранной темой, F2 переводит фокус на название', async () => {
		const { user } = await mountEditor()
		await user.click(screen.getByRole('button', { name: /^Тема b/ }))
		await user.keyboard('{F2}')
		await vi.waitFor(() =>
			expect(
				within(screen.getByLabelText(UI_ROADMAP_EDIT.INSPECTOR_LABEL)).getByRole('textbox', { name: UI_ROADMAP_EDIT.F_TITLE }),
			).toHaveFocus(),
		)
		;(document.activeElement as HTMLElement).blur()
		await user.click(screen.getByRole('button', { name: /^Тема b/ }))
		await user.keyboard('{Control>}d{/Control}')
		await vi.waitFor(() => expect(screen.getByText(/Тема b \(копия\)/)).toBeInTheDocument())
		await user.keyboard('{Delete}')
		await vi.waitFor(() => expect(screen.queryByRole('button', { name: /^Тема b$/ })).not.toBeInTheDocument())
	})

	it('Ctrl+Z отменяет перемещение, а «v» и «c» переключают инструмент', async () => {
		const { user } = await mountEditor()
		handle('Тема a').focus()
		await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
		await vi.waitFor(() => expect(order('Этап s1')).toEqual(['b', 'a', 'c']))
		await user.keyboard('{Control>}z{/Control}')
		await vi.waitFor(() => expect(order('Этап s1')).toEqual(['a', 'b', 'c']))
		handle('Тема a').focus()
		await user.keyboard('c')
		expect(screen.getByRole('radio', { name: UI_ROADMAP_EDIT.TOOL_LINK })).toBeChecked()
		await user.keyboard('v')
		expect(screen.getByRole('radio', { name: UI_ROADMAP_EDIT.TOOL_SELECT })).toBeChecked()
	})
})

describe('перетаскивание мышью', () => {
	const original = document.elementsFromPoint

	afterEach(() => {
		document.elementsFromPoint = original
	})

	function point(extra: Record<string, unknown>) {
		return { clientX: 0, clientY: 0, pointerId: 1, pointerType: 'mouse', button: 0, ...extra }
	}

	it('тема перетаскивается на другую тему и кладётся на её место', async () => {
		await mountEditor()
		const target = document.querySelector('[data-roadmap-topic="c"]') as HTMLElement
		document.elementsFromPoint = () => [target]
		await fireEvent.pointerDown(handle('Тема a'), point({ clientX: 5, clientY: 5 }))
		await fireEvent.pointerMove(window, point({ clientX: 40, clientY: 80 }))
		await vi.waitFor(() => expect(order('Этап s1')).toEqual(['b', 'c', 'a']))
		expect(document.querySelector('.base-roadmap__edit-ghost')).toHaveTextContent('Тема a')
		await fireEvent.pointerUp(window, point({ clientX: 40, clientY: 80 }))
		await vi.waitFor(() => expect(screen.getByLabelText(UI_ROADMAP_EDIT.STATUS_LABEL)).toHaveTextContent(/Изменений\s*1/))
		expect(order('Этап s1')).toEqual(['b', 'c', 'a'])
		await vi.waitFor(() => expect(document.querySelector('.base-roadmap__edit-ghost')).not.toBeInTheDocument())
	})

	it('тема уходит на заголовок другого этапа — в конец; этап перетаскивается на другой этап', async () => {
		await mountEditor()
		const stage = document.querySelector('[data-roadmap-stage="s3"]') as HTMLElement
		document.elementsFromPoint = () => [stage]
		await fireEvent.pointerDown(handle('Тема d'), point({ clientX: 5, clientY: 5 }))
		await fireEvent.pointerMove(window, point({ clientX: 50, clientY: 90 }))
		await fireEvent.pointerUp(window, point({ clientX: 50, clientY: 90 }))
		await vi.waitFor(() => expect(order('Этап s3')).toEqual(['d']))
		document.elementsFromPoint = () => [document.querySelector('[data-roadmap-stage="s2"]') as HTMLElement]
		await fireEvent.pointerDown(handle('Этап s1'), point({ clientX: 5, clientY: 5 }))
		await fireEvent.pointerMove(window, point({ clientX: 60, clientY: 90 }))
		await fireEvent.pointerUp(window, point({ clientX: 60, clientY: 90 }))
		await vi.waitFor(() => expect(stages()).toEqual(['s2', 's1', 's3']))
	})

	it('Escape во время перетаскивания отменяет его; короткий сдвиг и правая кнопка перетаскивания не начинают', async () => {
		await mountEditor()
		const target = document.querySelector('[data-roadmap-topic="c"]') as HTMLElement
		document.elementsFromPoint = () => [target]
		await fireEvent.pointerDown(handle('Тема a'), point({ clientX: 5, clientY: 5, button: 2 }))
		await fireEvent.pointerMove(window, point({ clientX: 60, clientY: 90 }))
		expect(document.querySelector('.base-roadmap__edit-ghost')).not.toBeInTheDocument()
		await fireEvent.pointerDown(handle('Тема a'), point({ clientX: 5, clientY: 5 }))
		await fireEvent.pointerMove(window, point({ clientX: 6, clientY: 6 }))
		expect(document.querySelector('.base-roadmap__edit-ghost')).not.toBeInTheDocument()
		await fireEvent.pointerMove(window, point({ clientX: 60, clientY: 90 }))
		await vi.waitFor(() => expect(order('Этап s1')).toEqual(['b', 'c', 'a']))
		await fireEvent.keyDown(window, { key: 'Escape' })
		await vi.waitFor(() => expect(order('Этап s1')).toEqual(['a', 'b', 'c']))
		expect(screen.getByLabelText(UI_ROADMAP_EDIT.STATUS_LABEL)).toHaveTextContent(/Изменений\s*0/)
	})
})
