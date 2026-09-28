import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import BaseFileUpload from '../ui/BaseFileUpload.vue'
import type { UploadedFile } from '../types/BaseFileUpload.types'

function createFile(name: string, size: number, type: string): File {
	const file = new File(['x'.repeat(size)], name, { type })
	return file
}

describe('BaseFileUpload integration', () => {
	describe('клик по dropzone', () => {
		it('должен вызывать click на file input при клике на dropzone', async () => {
			const { container } = render(BaseFileUpload, {
				props: {},
			})

			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')
			const clickSpy = vi.spyOn(fileInput!, 'click')

			await userEvent.setup().click(container.querySelector('.base-file-upload__dropzone')!)

			expect(clickSpy).toHaveBeenCalled()
		})
	})

	describe('drag-and-drop', () => {
		it('должен добавлять класс --dragover при dragover', async () => {
			const { container } = render(BaseFileUpload, {
				props: {},
			})

			const dropzone = container.querySelector('.base-file-upload__dropzone')!
			await fireEvent.dragOver(dropzone)

			expect(container.querySelector('.base-file-upload')?.classList.contains('base-file-upload--dragover')).toBe(true)
		})

		it('должен удалять класс --dragover при dragleave', async () => {
			const { container } = render(BaseFileUpload, {
				props: {},
			})

			const dropzone = container.querySelector('.base-file-upload__dropzone')!
			await fireEvent.dragOver(dropzone)
			await fireEvent.dragLeave(dropzone)

			expect(container.querySelector('.base-file-upload')?.classList.contains('base-file-upload--dragover')).toBe(false)
		})

		it('должен эмитить change при drop файлов', async () => {
			const { container, emitted } = render(BaseFileUpload, {
				props: {},
			})

			const dropzone = container.querySelector('.base-file-upload__dropzone')!
			const file = createFile('test.png', 100, 'image/png')

			const dataTransfer = { files: [file] }
			await fireEvent.drop(dropzone, { dataTransfer })

			await waitFor(() => {
				expect(emitted()).toHaveProperty('change')
			})
		})
	})

	describe('загрузка через input', () => {
		it('должен эмитить change при выборе файлов через input', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseFileUpload, {
				props: {},
			})

			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!
			const file = createFile('doc.pdf', 500, 'application/pdf')

			await user.upload(fileInput, file)

			await waitFor(() => {
				expect(emitted()).toHaveProperty('change')
			})
		})
	})

	describe('валидация', () => {
		it('должен эмитить error при превышении размера файла', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseFileUpload, {
				props: { maxSize: 1 },
			})

			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!
			const bigFile = createFile('big.png', 2 * 1024 * 1024, 'image/png')

			await user.upload(fileInput, bigFile)

			await waitFor(() => {
				expect(emitted()).toHaveProperty('error')
			})
		})

		it('должен отображать внутреннюю ошибку при превышении размера файла', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseFileUpload, {
				props: { maxSize: 1 },
			})

			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!
			const bigFile = createFile('big.png', 2 * 1024 * 1024, 'image/png')

			await user.upload(fileInput, bigFile)

			await waitFor(() => {
				const errorItem = container.querySelector('.base-file-upload__error-item')
				expect(errorItem).toBeInTheDocument()
			})
		})

		it('должен добавлять класс --error при превышении размера файла', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseFileUpload, {
				props: { maxSize: 1 },
			})

			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!
			const bigFile = createFile('big.png', 2 * 1024 * 1024, 'image/png')

			await user.upload(fileInput, bigFile)

			await waitFor(() => {
				expect(container.querySelector('.base-file-upload')?.classList.contains('base-file-upload--error')).toBe(true)
			})
		})

		it('должен отображать ошибку из пропа error', () => {
			const { container } = render(BaseFileUpload, {
				props: { error: 'Внешняя ошибка' },
			})

			expect(container.querySelector('.base-file-upload__error-item')).toHaveTextContent('Внешняя ошибка')
			expect(container.querySelector('.base-file-upload')?.classList.contains('base-file-upload--error')).toBe(true)
		})

		it('должен отображать несколько ошибок при нескольких невалидных файлах', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseFileUpload, {
				props: { maxSize: 1, isMultiple: true },
			})

			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!
			const bigFile1 = createFile('big1.png', 2 * 1024 * 1024, 'image/png')
			const bigFile2 = createFile('big2.png', 3 * 1024 * 1024, 'image/png')

			await user.upload(fileInput, [bigFile1, bigFile2])

			await waitFor(() => {
				const errorItems = container.querySelectorAll('.base-file-upload__error-item')
				expect(errorItems.length).toBe(2)
			})
		})
	})

	describe('отключённая загрузка', () => {
		it('не должен вызывать click на file input когда isDisabled', async () => {
			const { container } = render(BaseFileUpload, {
				props: { isDisabled: true },
			})

			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!
			expect(fileInput.disabled).toBe(true)
		})

		it('не принимает перетаскиваемые файлы и не открывает выбор файла', async () => {
			const { container, emitted } = render(BaseFileUpload, {
				props: { isDisabled: true },
			})
			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!
			const clickSpy = vi.spyOn(fileInput, 'click')
			const dropzone = screen.getByRole('button', { name: /Выберите файлы/ })

			await fireEvent.drop(dropzone, { dataTransfer: { files: [createFile('a.png', 10, 'image/png')] } })
			await fireEvent.click(dropzone)
			await fireEvent.keyDown(dropzone, { key: 'Enter' })

			expect(dropzone).toHaveAttribute('aria-disabled', 'true')
			expect(clickSpy).not.toHaveBeenCalled()
			expect(emitted().change).toBeUndefined()
			expect(container.querySelector('.base-file-upload__item')).not.toBeInTheDocument()
		})
	})

	describe('клавиатурная доступность', () => {
		it('зона загрузки — кнопка, открывающая выбор файла по Enter и Space', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseFileUpload, { props: {} })
			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!
			const clickSpy = vi.spyOn(fileInput, 'click')
			const dropzone = screen.getByRole('button', { name: /Выберите файлы/ })

			await user.tab()
			expect(dropzone).toHaveFocus()

			await user.keyboard('{Enter}')
			await user.keyboard(' ')

			expect(clickSpy).toHaveBeenCalledTimes(2)
		})

		it('подпись связана с полем выбора файла', () => {
			const { container } = render(BaseFileUpload, { props: { label: 'Документы' } })

			expect(screen.getByLabelText('Документы')).toBe(container.querySelector('input[type="file"]'))
		})

		it('отключённая зона загрузки исключена из порядка табуляции', async () => {
			const user = userEvent.setup()
			render(BaseFileUpload, { props: { isDisabled: true } })

			await user.tab()

			expect(screen.getByRole('button', { name: /Выберите файлы/ })).not.toHaveFocus()
		})
	})

	describe('доступность списка и ошибок', () => {
		it('ошибки связаны с зоной загрузки через aria-describedby', () => {
			render(BaseFileUpload, { props: { error: 'Прикрепите документ' } })

			expect(screen.getByRole('button', { name: /Выберите файлы/ })).toHaveAccessibleDescription('Прикрепите документ')
		})

		it('без ошибок у зоны нет aria-describedby', () => {
			render(BaseFileUpload, { props: {} })

			expect(screen.getByRole('button', { name: /Выберите файлы/ })).not.toHaveAttribute('aria-describedby')
		})

		it('кнопка удаления и полоса прогресса называют файл', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseFileUpload, { props: { isMultiple: true } })
			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!

			await user.upload(fileInput, [createFile('photo.png', 10, 'image/png'), createFile('report.pdf', 10, 'application/pdf')])

			expect(await screen.findByRole('button', { name: 'Удалить report.pdf' })).toBeInTheDocument()
			expect(await screen.findByRole('progressbar', { name: 'photo.png' })).toBeInTheDocument()
		})

		it('в отключённом состоянии кнопки удаления выбранных файлов недоступны', async () => {
			const user = userEvent.setup()
			const { container, emitted, rerender } = render(BaseFileUpload, { props: {} })
			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!
			await user.upload(fileInput, createFile('report.pdf', 10, 'application/pdf'))
			await rerender({ isDisabled: true })

			const remove = await screen.findByRole('button', { name: 'Удалить report.pdf' })
			expect(remove).toBeDisabled()
			await user.click(remove)
			expect(emitted().remove).toBeUndefined()
		})
	})

	describe('одиночный режим (isMultiple=false)', () => {
		it('повторный выбор заменяет файл, а не добавляет второй', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseFileUpload, { props: {} })
			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!

			await user.upload(fileInput, createFile('first.pdf', 10, 'application/pdf'))
			await waitFor(() => expect(screen.getByText('first.pdf')).toBeInTheDocument())
			await user.upload(fileInput, createFile('second.pdf', 10, 'application/pdf'))
			await waitFor(() => expect(screen.getByText('second.pdf')).toBeInTheDocument())

			expect(screen.queryByText('first.pdf')).not.toBeInTheDocument()
			expect(container.querySelectorAll('.base-file-upload__item')).toHaveLength(1)
			const lastChange = emitted().change?.at(-1) as [File[]]
			expect(lastChange[0].map(file => file.name)).toEqual(['second.pdf'])
			const lastRemove = emitted().remove?.at(-1) as [UploadedFile]
			expect(lastRemove[0].name).toBe('first.pdf')
		})

		it('из перетащенных нескольких файлов оставляет один', async () => {
			const { container, emitted } = render(BaseFileUpload, { props: {} })
			const dropzone = container.querySelector('.base-file-upload__dropzone')!
			const files = [createFile('a.pdf', 10, 'application/pdf'), createFile('b.pdf', 10, 'application/pdf')]

			await fireEvent.drop(dropzone, { dataTransfer: { files } })

			await waitFor(() => expect(emitted()).toHaveProperty('change'))
			expect(container.querySelectorAll('.base-file-upload__item')).toHaveLength(1)
			const lastChange = emitted().change?.at(-1) as [File[]]
			expect(lastChange[0].map(file => file.name)).toEqual(['a.pdf'])
		})

		it('невалидный файл не заменяет уже выбранный', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseFileUpload, { props: { accept: '.pdf' } })
			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!

			await user.upload(fileInput, createFile('first.pdf', 10, 'application/pdf'))
			await waitFor(() => expect(screen.getByText('first.pdf')).toBeInTheDocument())
			await fireEvent.drop(container.querySelector('.base-file-upload__dropzone')!, {
				dataTransfer: { files: [createFile('bad.exe', 10, 'application/x-msdownload')] },
			})

			expect(screen.getByText('first.pdf')).toBeInTheDocument()
			expect(emitted().remove).toBeUndefined()
			expect(container.querySelector('.base-file-upload__error-item')).toBeInTheDocument()
		})
	})
})
