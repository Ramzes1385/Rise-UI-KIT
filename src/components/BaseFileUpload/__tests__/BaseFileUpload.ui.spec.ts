import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseFileUpload from '../ui/BaseFileUpload.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

function selectFiles(container: Element, files: File[]) {
	const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
	Object.defineProperty(input, 'files', { value: files, configurable: true })
	return fireEvent.change(input)
}

const pdf = (name: string): File => new File(['x'], name, { type: 'application/pdf' })
const motionGlobal = { stubs: { 'transition-group': false } }
const PARTS = ['label', 'dropzone', 'icon', 'text', 'drop-text', 'hint', 'list', 'item', 'preview', 'info', 'name', 'meta', 'remove']

describe('BaseFileUpload: проп ui', () => {
	beforeEach(() => {
		vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:preview-mock'), revokeObjectURL: vi.fn() })
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', async () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...[...PARTS, 'errors', 'error-item'].map(part => [part, `u-${part}`])])
		const { container } = render(BaseFileUpload, {
			props: { label: 'Вложения', accept: '.pdf', error: 'Ошибка', ui, customClass: { item: 'own-item' } },
		})
		await selectFiles(container, [pdf('Отчёт.pdf')])
		const root = container.querySelector('.base-file-upload')!
		expect(root).toHaveClass('base-file-upload', 'u-root')
		for (const part of [...PARTS, 'errors', 'error-item'])
			expect(root.querySelector(`.base-file-upload__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-file-upload__item')).toHaveClass('own-item', 'base-file-upload__item--selected')
	})

	it('статус, прогресс, ошибка файла и повтор получают классы ui', async () => {
		let fail!: (error: Error) => void
		const uploader = vi.fn(() => new Promise<void>((_, reject) => (fail = reject)))
		const ui = { status: 'u-status', progress: 'u-progress', 'file-error': 'u-file-error', retry: 'u-retry' }
		const { container } = render(BaseFileUpload, { props: { uploader, ui } })
		await selectFiles(container, [pdf('Отчёт.pdf')])
		expect(container.querySelector('.base-file-upload__status')).toHaveClass('u-status')
		expect(container.querySelector('.base-file-upload__progress')).toHaveClass('u-progress')
		fail(new Error('Сеть недоступна'))
		await waitFor(() => expect(container.querySelector('.base-file-upload__file-error')).toHaveClass('u-file-error'))
		expect(container.querySelector('.base-file-upload__retry')).toHaveClass('u-retry')
	})

	it('классы плагина и экземпляра склеиваются; без ui — только классы кита', () => {
		const { container } = render(BaseFileUpload, {
			props: { ui: { dropzone: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseFileUpload: { ui: { dropzone: 'app', root: 'app-root' } } } })] },
		})
		expect(container.querySelector('.base-file-upload')).toHaveClass('app-root')
		expect(container.querySelector('.base-file-upload__dropzone')).toHaveAttribute('class', 'base-file-upload__dropzone app own')
		expect(container.querySelector('.base-file-upload__text')).toHaveAttribute('class', 'base-file-upload__text')
	})
})

describe('BaseFileUpload: движение списка', () => {
	beforeEach(() => {
		vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:preview-mock'), revokeObjectURL: vi.fn() })
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('новая строка появляется переходом base-file-upload-item', async () => {
		const { container } = render(BaseFileUpload, { props: { isMultiple: true }, global: motionGlobal })
		await selectFiles(container, [pdf('Первый.pdf')])
		await waitFor(() =>
			expect(container.querySelector('.base-file-upload__item')).not.toHaveClass('base-file-upload-item-enter-active'),
		)
		await selectFiles(container, [pdf('Второй.pdf')])
		const items = container.querySelectorAll('.base-file-upload__item')
		expect(items).toHaveLength(2)
		expect(items[1]).toHaveClass('base-file-upload-item-enter-active')
	})

	it('удалённая строка закреплена на месте и скрыта от скринридера; список живёт, пока строка уходит', async () => {
		const { container } = render(BaseFileUpload, { props: { isMultiple: true }, global: motionGlobal })
		await selectFiles(container, [pdf('Первый.pdf')])
		const item = container.querySelector<HTMLElement>('.base-file-upload__item')!

		await fireEvent.click(screen.getByRole('button', { name: /Первый\.pdf/ }))
		expect(item).toHaveClass('base-file-upload-item-leave-active')
		expect(item).toHaveAttribute('aria-hidden', 'true')
		expect(item.style.top).toBe('0px')
		expect(container.querySelector('.base-file-upload__list')).toBeInTheDocument()
		expect(screen.queryByRole('listitem')).not.toBeInTheDocument()

		await waitFor(() => expect(container.querySelector('.base-file-upload__list')).not.toBeInTheDocument())
		expect(item).not.toBeInTheDocument()
	})
})
