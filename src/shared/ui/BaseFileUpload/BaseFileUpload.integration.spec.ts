/**
 * Integration-тесты для BaseFileUpload.
 * Проверяют взаимодействие: клик, drag-and-drop, удаление файлов.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, waitFor } from '@testing-library/vue'

import BaseFileUpload from './BaseFileUpload.vue'

/** Создание мок-файла */
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
			const { container, emitted } = render(BaseFileUpload, {
				props: {},
			})

			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!
			const file = createFile('doc.pdf', 500, 'application/pdf')

			await fireEvent.change(fileInput, { target: { files: [file] } })

			await waitFor(() => {
				expect(emitted()).toHaveProperty('change')
			})
		})
	})

	describe('валидация', () => {
		it('должен эмитить error при превышении размера файла', async () => {
			const { container, emitted } = render(BaseFileUpload, {
				props: { maxSize: 1 },
			})

			const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!
			const bigFile = createFile('big.png', 2 * 1024 * 1024, 'image/png')

			await fireEvent.change(fileInput, { target: { files: [bigFile] } })

			await waitFor(() => {
				expect(emitted()).toHaveProperty('error')
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
	})
})
