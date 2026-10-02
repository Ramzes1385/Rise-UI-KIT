import '@testing-library/jest-dom/vitest'
import BaseFileUpload from '../ui/BaseFileUpload.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

function selectFiles(container: Element, files: File[]) {
	const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
	Object.defineProperty(input, 'files', { value: files, configurable: true })
	return fireEvent.change(input)
}

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0))

describe('BaseFileUpload unit', () => {
	beforeEach(() => {
		vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:preview-mock'), revokeObjectURL: vi.fn() })
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
	})

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
		it('по умолчанию — миниатюра с увеличением; false — иконка файла без objectURL', async () => {
			const { mount } = await import('@vue/test-utils')
			const { BaseImage } = await import('@components/BaseImage')
			const file = new File(['image'], 'photo.png', { type: 'image/png' })
			const wrapper = mount(BaseFileUpload)
			await selectFiles(wrapper.element, [file])

			expect(wrapper.findComponent(BaseImage).props('zoomConfig')).toEqual({ hasZoom: true })

			const withoutPreview = mount(BaseFileUpload, { props: { allowPreview: false } })
			vi.mocked(URL.createObjectURL).mockClear()
			await selectFiles(withoutPreview.element, [file])
			expect(withoutPreview.findComponent(BaseImage).exists()).toBe(false)
			expect(withoutPreview.find('.base-file-upload__file-icon').exists()).toBe(true)
			expect(URL.createObjectURL).not.toHaveBeenCalled()
		})
	})

	describe('пропс previewSize', () => {
		it('размер превью масштабируется sizeScale', async () => {
			const { container } = render(BaseFileUpload, { props: { previewSize: 80, sizeScale: 50 } })
			await selectFiles(container, [new File(['a'], 'a.pdf', { type: 'application/pdf' })])
			expect(container.querySelector<HTMLElement>('.base-file-upload__preview')?.style.width).toBe('40px')
		})
	})

	describe('иконка файла и отключённая зона', () => {
		it('видео — иконка video, прочее — file', async () => {
			const { container } = render(BaseFileUpload, { props: { isMultiple: true } })
			await selectFiles(container, [
				new File(['v'], 'clip.mp4', { type: 'video/mp4' }),
				new File(['d'], 'a.pdf', { type: 'application/pdf' }),
			])
			const icons = [...container.querySelectorAll('.base-file-upload__file-icon use')].map(use => use.getAttribute('href'))
			expect(icons).toEqual(['icons.svg#video', 'icons.svg#file'])
		})

		it('отключённая зона не подсвечивается при перетаскивании', async () => {
			const { container } = render(BaseFileUpload, { props: { isDisabled: true } })
			await fireEvent.dragOver(container.querySelector('.base-file-upload__dropzone')!)
			expect(container.querySelector('.base-file-upload--dragover')).not.toBeInTheDocument()
		})
	})

	describe('пропс emptyText', () => {
		it('по умолчанию — подсказка о перетаскивании, своя строка заменяет её, пустая — убирает', async () => {
			const { container, rerender } = render(BaseFileUpload)
			expect(container.querySelector('.base-file-upload__drop-text')).toHaveTextContent('Перетащите файлы сюда')

			await rerender({ emptyText: 'Или бросьте договор сюда' })
			expect(container.querySelector('.base-file-upload__drop-text')).toHaveTextContent('Или бросьте договор сюда')

			await rerender({ emptyText: '' })
			expect(container.querySelector('.base-file-upload__drop-text')).not.toBeInTheDocument()
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

			expect(container.querySelector('.base-file-upload__error-item')).toHaveTextContent('Ошибка загрузки')
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
			const { container, emitted } = render(BaseFileUpload, { props: { maxCount: 1, isMultiple: true } })

			const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
			Object.defineProperty(input, 'files', { value: [first], configurable: true })
			await fireEvent.change(input)
			await waitFor(() => {
				expect(container.querySelector('.base-file-upload__list')).toBeInTheDocument()
			})

			Object.defineProperty(input, 'files', { value: [second], configurable: true })
			await fireEvent.change(input)

			expect(emitted().error?.at(-1)).toEqual(['Лимит файлов — 1, лишние не добавлены'])
			expect(container.querySelector('.base-file-upload__error-item')).toHaveTextContent('Лимит файлов — 1, лишние не добавлены')
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

			await fireEvent.drop(dropzone, {})

			expect(container.querySelector('.base-file-upload__list')).not.toBeInTheDocument()
		})
	})

	describe('без uploader', () => {
		it('файл только выбран: нет статуса, прогресса и таймеров', async () => {
			vi.useFakeTimers()
			const { container } = render(BaseFileUpload)
			await selectFiles(container, [new File(['img'], 'photo.png', { type: 'image/png' })])
			await vi.advanceTimersByTimeAsync(5000)

			expect(container.querySelector('.base-file-upload__item--selected')).toBeInTheDocument()
			expect(container.querySelector('.base-file-upload__status')).not.toBeInTheDocument()
			expect(container.querySelector('.base-file-upload__progress')).not.toBeInTheDocument()
			expect(vi.getTimerCount()).toBe(0)
		})
	})

	describe('пропс uploader', () => {
		it('прогресс из onProgress, затем «Загружено» и upload-success', async () => {
			let progress!: (percent: number) => void
			let finish!: (value: unknown) => void
			const uploader = vi.fn((_file: File, context: { onProgress: (percent: number) => void }) => {
				progress = context.onProgress
				return new Promise(resolve => {
					finish = resolve
				})
			})
			const { container, emitted } = render(BaseFileUpload, { props: { uploader } })
			await selectFiles(container, [new File(['a'], 'a.pdf', { type: 'application/pdf' })])
			await flush()

			progress(40)
			await waitFor(() => expect(container.querySelector('.base-file-upload__status')).toHaveTextContent('40%'))
			expect(screen.getByRole('progressbar', { name: 'a.pdf' })).toBeInTheDocument()

			finish({ id: 1 })
			await waitFor(() => expect(container.querySelector('.base-file-upload__status')).toHaveTextContent('Загружено'))
			expect((emitted()['upload-success'] as unknown[][])[0][1]).toEqual({ id: 1 })
			expect(screen.getByRole('status')).toHaveTextContent('Файл «a.pdf» загружен')
		})

		it('ошибка: текст под файлом, upload-error, объявление и повтор', async () => {
			const uploader = vi.fn().mockRejectedValueOnce(new Error('Сервер недоступен')).mockResolvedValueOnce('ok')
			const { container, emitted } = render(BaseFileUpload, { props: { uploader } })
			await selectFiles(container, [new File(['a'], 'a.pdf', { type: 'application/pdf' })])

			await waitFor(() => expect(container.querySelector('.base-file-upload__file-error')).toHaveTextContent('Сервер недоступен'))
			expect(container.querySelector('.base-file-upload__status--error')).toHaveTextContent('Ошибка')
			expect((emitted()['upload-error'] as unknown[][])[0][1]).toBe('Сервер недоступен')
			expect(screen.getByRole('status')).toHaveTextContent('Не удалось загрузить «a.pdf»: Сервер недоступен')

			await fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку «a.pdf»' }))
			await waitFor(() => expect(container.querySelector('.base-file-upload__item--done')).toBeInTheDocument())
			expect(uploader).toHaveBeenCalledTimes(2)
			expect(screen.queryByRole('button', { name: 'Повторить загрузку «a.pdf»' })).not.toBeInTheDocument()
		})
	})

	describe('озвучивание ошибок', () => {
		it('ошибки выбора попадают в role="alert"', async () => {
			const { container } = render(BaseFileUpload, { props: { accept: '.pdf' } })
			expect(screen.getByRole('alert')).toHaveTextContent('')

			await selectFiles(container, [new File(['a'], 'a.png', { type: 'image/png' })])
			expect(screen.getByRole('alert')).toHaveTextContent('Формат файла "a.png" не поддерживается')
			expect(screen.getByRole('alert')).toContainElement(container.querySelector('.base-file-upload__error-item'))
		})
	})

	describe('методы через ref', () => {
		it('focus и blur — на зоне загрузки; rootRef — корень', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseFileUpload, { attachTo: document.body })
			const dropzone = wrapper.find('.base-file-upload__dropzone').element

			wrapper.vm.focus()
			expect(document.activeElement).toBe(dropzone)
			wrapper.vm.blur()
			expect(document.activeElement).not.toBe(dropzone)
			expect(wrapper.vm.rootRef).toBe(wrapper.element)
			wrapper.unmount()
		})

		it('isRequired: validate без файлов — false и ошибка, с файлом — true; reset очищает список', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseFileUpload, { props: { isRequired: true, label: 'Договор' } })
			expect(wrapper.find('.base-file-upload__label').text()).toContain('*')

			expect(wrapper.vm.validate()).toBe(false)
			await wrapper.vm.$nextTick()
			expect(wrapper.find('.base-file-upload__error-item').text()).toBe('Обязательное поле')

			await selectFiles(wrapper.element, [new File(['a'], 'a.pdf', { type: 'application/pdf' })])
			expect(wrapper.vm.validate()).toBe(true)

			wrapper.vm.reset()
			await wrapper.vm.$nextTick()
			expect(wrapper.find('.base-file-upload__item').exists()).toBe(false)
			expect(wrapper.emitted('change')?.at(-1)).toEqual([[]])
			expect(wrapper.find('.base-file-upload__error-item').exists()).toBe(false)
		})

		it('retry повторяет загрузку файла с ошибкой', async () => {
			const { mount } = await import('@vue/test-utils')
			const uploader = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce('ok')
			const wrapper = mount(BaseFileUpload, { props: { uploader } })
			await selectFiles(wrapper.element, [new File(['a'], 'a.pdf', { type: 'application/pdf' })])
			await flush()
			await flush()

			const item = wrapper.emitted<[unknown, string]>('upload-error')![0][0]
			wrapper.vm.retry(item as never)
			await flush()
			await flush()
			expect(uploader).toHaveBeenCalledTimes(2)
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
			expect(container.querySelector('.base-file-upload__error-item')?.classList.contains('custom-error-item')).toBe(true)
		})
	})
})
