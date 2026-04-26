/**
 * Unit-тесты для BaseFileUpload.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseFileUpload from './BaseFileUpload.vue'

describe('BaseFileUpload unit', () => {
	describe('рендер', () => {
		it('должен рендерить контейнер загрузки', () => {
			const { container } = render(BaseFileUpload, {
				props: {},
			})

			expect(container.querySelector('.base-file-upload')).toBeInTheDocument()
		})

		it('должен рендерить file input', () => {
			const { container } = render(BaseFileUpload, {
				props: {},
			})

			expect(container.querySelector('input[type="file"]')).toBeInTheDocument()
		})

		it('должен рендерить dropzone', () => {
			const { container } = render(BaseFileUpload, {
				props: {},
			})

			expect(container.querySelector('.base-file-upload__dropzone')).toBeInTheDocument()
		})
	})

	describe('пропс label', () => {
		it('должен рендерить лейбл когда передан', () => {
			render(BaseFileUpload, {
				props: { label: 'Загрузите файл' },
			})

			expect(screen.getByText('Загрузите файл')).toBeInTheDocument()
		})

		it('не должен рендерить лейбл когда не передан', () => {
			const { container } = render(BaseFileUpload, {
				props: {},
			})

			expect(container.querySelector('.base-file-upload__label')).not.toBeInTheDocument()
		})
	})

	describe('пропс buttonText', () => {
		it('должен рендерить текст кнопки по умолчанию', () => {
			render(BaseFileUpload, {
				props: {},
			})

			expect(screen.getByText('Выберите файлы')).toBeInTheDocument()
		})

		it('должен рендерить кастомный текст кнопки', () => {
			render(BaseFileUpload, {
				props: { buttonText: 'Загрузить' },
			})

			expect(screen.getByText('Загрузить')).toBeInTheDocument()
		})
	})

	describe('пропс isDisabled', () => {
		it('должен добавлять класс --disabled когда isDisabled=true', () => {
			const { container } = render(BaseFileUpload, {
				props: { isDisabled: true },
			})

			expect(container.querySelector('.base-file-upload')?.classList.contains('base-file-upload--disabled')).toBe(true)
		})

		it('должен устанавливать disabled на file input', () => {
			const { container } = render(BaseFileUpload, {
				props: { isDisabled: true },
			})

			const input = container.querySelector<HTMLInputElement>('input[type="file"]')
			expect(input?.disabled).toBe(true)
		})
	})

	describe('пропс accept', () => {
		it('должен устанавливать accept на file input', () => {
			const { container } = render(BaseFileUpload, {
				props: { accept: 'image/*' },
			})

			const input = container.querySelector<HTMLInputElement>('input[type="file"]')
			expect(input?.accept).toBe('image/*')
		})

		it('должен рендерить подсказку по форматам', () => {
			render(BaseFileUpload, {
				props: { accept: '.pdf,.doc' },
			})

			expect(screen.getByText('.PDF, .DOC')).toBeInTheDocument()
		})
	})

	describe('пропс isMultiple', () => {
		it('должен устанавливать multiple на file input', () => {
			const { container } = render(BaseFileUpload, {
				props: { isMultiple: true },
			})

			const input = container.querySelector<HTMLInputElement>('input[type="file"]')
			expect(input?.multiple).toBe(true)
		})
	})

	describe('пропс maxSize', () => {
		it('должен рендерить подсказку о максимальном размере', () => {
			render(BaseFileUpload, {
				props: { maxSize: 10 },
			})

			expect(screen.getByText('до 10 МБ')).toBeInTheDocument()
		})
	})
})
