/**
 * Unit-тесты для BaseFileUpload.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

import BaseFileUpload from './BaseFileUpload.vue'

vi.mock('@utils/fileUtils', async importOriginal => {
	const actual = await importOriginal<typeof import('@utils/fileUtils')>()
	return {
		...actual,
		createImagePreview: vi.fn(() => Promise.resolve('blob:preview-mock')),
	}
})

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

	describe('пропс allowPreview', () => {
		it('должен вернуть preview zoom после сброса allowPreview=false', async () => {
			const { mount } = await import('@vue/test-utils')
			const { BaseImage } = await import('@components/BaseImage')
			const file = new File(['image'], 'photo.png', { type: 'image/png' })
			const wrapper = mount(BaseFileUpload, {
				props: { allowPreview: false },
			})

			const input = wrapper.find<HTMLInputElement>('input[type="file"]').element
			Object.defineProperty(input, 'files', { value: [file], configurable: true })
			await fireEvent.change(input)

			await waitFor(() => {
				expect(wrapper.findComponent(BaseImage).exists()).toBe(true)
			})
			expect(wrapper.findComponent(BaseImage).props('hasZoom')).toBe(false)

			await wrapper.setProps({ allowPreview: undefined })

			expect(wrapper.findComponent(BaseImage).props('hasZoom')).toBe(true)
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

	describe('пропс error', () => {
		it('должен рендерить элемент ошибки когда передан', () => {
			const { container } = render(BaseFileUpload, {
				props: { error: 'Ошибка загрузки' },
			})

			expect(container.querySelector('.base-file-upload__error-item')).toBeInTheDocument()
			expect(screen.getByText('1. Ошибка загрузки')).toBeInTheDocument()
		})

		it('должен добавлять класс --error когда error передан', () => {
			const { container } = render(BaseFileUpload, {
				props: { error: 'Ошибка загрузки' },
			})

			expect(container.querySelector('.base-file-upload')?.classList.contains('base-file-upload--error')).toBe(true)
		})

		it('не должен добавлять класс --error когда error не передан', () => {
			const { container } = render(BaseFileUpload, {
				props: {},
			})

			expect(container.querySelector('.base-file-upload')?.classList.contains('base-file-upload--error')).toBe(false)
		})
	})

	describe('эвенты', () => {
		it('должен эмитить remove при удалении файла', async () => {
			const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
			const { container, emitted } = render(BaseFileUpload, {
				props: {},
			})

			const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
			Object.defineProperty(input, 'files', {
				value: [file],
				configurable: true,
			})

			await fireEvent.change(input)

			await waitFor(() => {
				expect(container.querySelector('.base-file-upload__list')).toBeInTheDocument()
			})

			const removeBtn = container.querySelector('.base-file-upload__remove')!
			await fireEvent.click(removeBtn)

			expect(emitted()).toHaveProperty('remove')
		})
	})

	describe('ограничение количества файлов', () => {
		it('должен эмитить error при превышении maxCount', async () => {
			const first = new File(['a'], 'a.pdf', { type: 'application/pdf' })
			const second = new File(['b'], 'b.pdf', { type: 'application/pdf' })
			const { container, emitted } = render(BaseFileUpload, { props: { maxCount: 1 } })

			const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
			Object.defineProperty(input, 'files', { value: [first], configurable: true })
			await fireEvent.change(input)
			await waitFor(() => {
				expect(container.querySelector('.base-file-upload__list')).toBeInTheDocument()
			})

			Object.defineProperty(input, 'files', { value: [second], configurable: true })
			await fireEvent.change(input)

			expect(emitted().error?.at(-1)).toEqual(['Максимум файлов: 1'])
			expect(screen.getByText('1. Максимум файлов: 1')).toBeInTheDocument()
		})
	})

	describe('эмит change при удалении', () => {
		it('должен эмитить change с оставшимися файлами после удаления одного', async () => {
			const first = new File(['x'], 'a.pdf', { type: 'application/pdf' })
			const second = new File(['y'], 'b.pdf', { type: 'application/pdf' })
			const { container, emitted } = render(BaseFileUpload, { props: { isMultiple: true, maxCount: 5 } })

			const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
			Object.defineProperty(input, 'files', { value: [first, second], configurable: true })
			await fireEvent.change(input)
			await waitFor(() => {
				expect(container.querySelectorAll('.base-file-upload__remove')).toHaveLength(2)
			})

			await fireEvent.click(container.querySelectorAll('.base-file-upload__remove')[0] as HTMLElement)
			const lastChange = emitted().change?.at(-1) as [File[]]
			expect(lastChange[0]).toHaveLength(1)
			expect(lastChange[0][0].name).toBe('b.pdf')
		})
	})

	describe('прерывание прогресса при удалении файла', () => {
		it('должен очищать интервал, если файл удалён во время загрузки', async () => {
			vi.useFakeTimers()
			const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

			const file = new File(['img'], 'photo.png', { type: 'image/png' })
			const { container } = render(BaseFileUpload, { props: {} })

			const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
			Object.defineProperty(input, 'files', { value: [file], configurable: true })
			await fireEvent.change(input)
			await vi.advanceTimersByTimeAsync(0)

			const removeBtn = container.querySelector('.base-file-upload__remove')
			expect(removeBtn).toBeInTheDocument()

			await fireEvent.click(removeBtn as HTMLElement)
			await vi.advanceTimersByTimeAsync(200 * 3)
			expect(container.querySelector('.base-file-upload__item')).not.toBeInTheDocument()

			randomSpy.mockRestore()
			vi.useRealTimers()
		})
	})

	describe('защитные ветки обработчиков', () => {
		it('не добавляет файлы, когда у input нет files', async () => {
			const { container, emitted } = render(BaseFileUpload, { props: {} })
			const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
			Object.defineProperty(input, 'files', { value: null, configurable: true })

			await fireEvent.change(input)

			expect(container.querySelector('.base-file-upload__list')).not.toBeInTheDocument()
			expect(emitted().change).toBeUndefined()
		})

		it('не добавляет файлы при drop без dataTransfer', async () => {
			const { container } = render(BaseFileUpload, { props: {} })
			const dropzone = container.querySelector('.base-file-upload__dropzone')!

			await fireEvent.drop(dropzone, { dataTransfer: null })

			expect(container.querySelector('.base-file-upload__list')).not.toBeInTheDocument()
		})
	})

	describe('имитация прогресса загрузки', () => {
		it('должен завершать загрузку изображения со статусом done при достижении 100%', async () => {
			vi.useFakeTimers()
			const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99)

			const file = new File(['img'], 'photo.png', { type: 'image/png' })
			const { container } = render(BaseFileUpload, { props: {} })

			const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
			Object.defineProperty(input, 'files', { value: [file], configurable: true })

			await fireEvent.change(input)
			await vi.advanceTimersByTimeAsync(0)

			await vi.advanceTimersByTimeAsync(200 * 6)

			const item = container.querySelector('.base-file-upload__item')
			expect(item).toBeInTheDocument()
			expect(container.querySelector('.base-file-upload__item--done')).toBeInTheDocument()

			randomSpy.mockRestore()
			vi.useRealTimers()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseFileUpload, {
				props: { customClass: 'custom-upload-class' },
			})

			expect(container.querySelector('.base-file-upload')?.classList.contains('custom-upload-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseFileUpload, {
				props: {
					label: 'Загрузите файл',
					error: 'Ошибка',
					customClass: {
						root: 'custom-root',
						label: 'custom-label',
						dropzone: 'custom-dropzone',
						text: 'custom-text',
						hint: 'custom-hint',
						errors: 'custom-errors',
						errorItem: 'custom-error-item',
					},
				},
			})

			expect(container.querySelector('.base-file-upload')?.classList.contains('custom-root')).toBe(true)
			expect(container.querySelector('.base-file-upload__label')?.classList.contains('custom-label')).toBe(true)
			expect(container.querySelector('.base-file-upload__dropzone')?.classList.contains('custom-dropzone')).toBe(true)
			expect(container.querySelector('.base-file-upload__text')?.classList.contains('custom-text')).toBe(true)
			expect(container.querySelector('.base-file-upload__hint')?.classList.contains('custom-hint')).toBe(true)
			expect(container.querySelector('.custom-errors')).toBeInTheDocument()
			expect(container.querySelector('.base-file-upload__error-item')?.classList.contains('custom-error-item')).toBe(
				true,
			)
		})
	})
})
