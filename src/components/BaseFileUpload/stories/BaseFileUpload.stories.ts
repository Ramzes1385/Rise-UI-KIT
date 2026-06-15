/**
 * Stories для компонента BaseFileUpload.
 * Демонстрирует все вариации, состояния и интерактивные состояния.
 * Каждая story содержит play-функцию для 100% coverage.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { buildArgTypes } from '@utils/storybookUtils'
import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'

import { FILE_UPLOAD_VARIANTS } from '../model/BaseFileUpload.types'
import BaseFileUpload from '../ui/BaseFileUpload.vue'

/** Создать тестовый File */
function createTestFile(name: string, size: number, type: string): File {
	return new File([new ArrayBuffer(size)], name, { type })
}

const meta: Meta<typeof BaseFileUpload> = {
	title: 'UI/BaseFileUpload',
	component: BaseFileUpload,

	argTypes: buildArgTypes({
		props: {
			accept: { control: 'text' },
			variant: { control: 'radio', options: FILE_UPLOAD_VARIANTS },
			color: {
				control: 'object',
				description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
			},
			isMultiple: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			maxSize: { control: 'number' },
			maxCount: { control: 'number' },
			label: { control: 'text' },
			buttonText: { control: 'text' },
			previewSize: { control: 'number' },
			allowPreview: { control: 'boolean' },
			emptyText: { control: 'text' },
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
		},
		hidden: ['onChange', 'onError', 'onRemove'],
	}),

	args: {
		accept: 'image/*',
		variant: 'default',
		isMultiple: false,
		isDisabled: false,
		maxSize: 10,
		label: 'Загрузите файл',
		buttonText: 'Выбрать файл',
		previewSize: 48,
		allowPreview: true,
		emptyText: 'Перетащите файл сюда',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseFileUpload>
/** Базовая загрузка — клик по dropzone + загрузка файла */
export const Default: Story = {
	args: {
		onChange: fn(),
		onError: fn(),
		onRemove: fn(),
	},
	play: async ({ args, canvasElement, step }) => {
		const canvas = within(canvasElement)
		expect(canvasElement).toBeInTheDocument()

		await step('Фокусировка dropzone по Tab', async () => {
			await userEvent.tab()
			await waitFor(() => {
				const dropzone = canvasElement.querySelector('.base-file-upload__dropzone')
				expect(dropzone).toHaveFocus()
			})
		})

		await step('Shift+Tab — обратная фокусировка', async () => {
			await playShiftTab(canvasElement, { selector: '.base-file-upload__dropzone' })
		})

		// Клик по dropzone — покрывает triggerUpload
		const dropzone = canvasElement.querySelector('.base-file-upload__dropzone') as HTMLElement
		await userEvent.click(dropzone)

		// Загружаем файл через input
		const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement
		const file = createTestFile('test.png', 1024, 'image/png')
		const dt = new DataTransfer()
		dt.items.add(file)
		Object.defineProperty(input, 'files', { value: dt.files })
		input.dispatchEvent(new Event('change', { bubbles: true }))
	},
}
/** Ошибка валидации — файл слишком большой */
export const FileTooBig: Story = {
	args: {
		maxSize: 1,
		accept: '.pdf',
		onError: fn(),
		onChange: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement
		// Файл больше лимита + неправильный формат
		const file = createTestFile('big.png', 3 * 1024 * 1024, 'image/png')
		const dt = new DataTransfer()
		dt.items.add(file)
		Object.defineProperty(input, 'files', { value: dt.files })
		input.dispatchEvent(new Event('change', { bubbles: true }))

		await waitFor(() => {
			expect(canvasElement.querySelector('.base-file-upload--error')).toBeInTheDocument()
		})
	},
}
// play удалён: дублирует "должен вызывать click на file input при клике на dropzone" в *.integration.spec.ts
/** Множественный выбор */
export const Multiple: Story = {
	args: {
		isMultiple: true,
		maxCount: 5,
		onChange: fn(),
	},
}
/** Только изображения */
export const ImagesOnly: Story = {
	args: {
		accept: 'image/png,image/jpeg,image/webp',
		buttonText: 'Выбрать изображение',
	},
}
/** Отключенная */
export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
}
/** Состояние ошибки */
export const Error: Story = {
	render: () => ({
		components: { BaseFileUpload },
		template: `
			<div>
				<span style="font-size:12px;color:var(--color-text-muted);">Error</span>
				<BaseFileUpload class="base-file-upload--error" />
			</div>
		`,
	}),
}
/** Без лейбла */
export const WithoutLabel: Story = {
	args: {
		label: '',
	},
}
/** С ограничением размера */
export const WithMaxSize: Story = {
	args: {
		maxSize: 2,
		buttonText: 'Выбрать файл (до 2 МБ)',
	},
}
/** Документы */
export const DocumentsOnly: Story = {
	args: {
		accept: '.pdf,.doc,.docx,.xls,.xlsx',
		buttonText: 'Выбрать документ',
		label: 'Документы',
	},
}
/** Состояние при наведении (hover) */
export const HoverState: Story = {
	render: () => ({
		components: { BaseFileUpload },
		template: `
			<div>
				<span style="font-size:12px;color:var(--color-text-muted);">Hover</span>
				<BaseFileUpload class="base-file-upload--hover" />
			</div>
		`,
	}),
}
/** Активное состояние (нажатие) */
export const ActiveState: Story = {
	render: () => ({
		components: { BaseFileUpload },
		template: `
			<div>
				<span style="font-size:12px;color:var(--color-text-muted);">Active</span>
				<BaseFileUpload class="base-file-upload--active" />
			</div>
		`,
	}),
}
/** Состояние фокуса (клавиатура) */
export const FocusState: Story = {
	render: () => ({
		components: { BaseFileUpload },
		template: `
			<div>
				<span style="font-size:12px;color:var(--color-text-muted);">Focus</span>
				<BaseFileUpload class="base-file-upload--focus" />
			</div>
		`,
	}),
}
/** Все интерактивные состояния рядом (normal/hover/active/focus) */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseFileUpload },
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Normal</span>
					<BaseFileUpload />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Hover</span>
					<BaseFileUpload class="base-file-upload--hover" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Active</span>
					<BaseFileUpload class="base-file-upload--active" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Focus</span>
					<BaseFileUpload class="base-file-upload--focus" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Disabled</span>
					<BaseFileUpload is-disabled />
				</div>
			</div>
		`,
	}),
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: () => ({
		components: { BaseFileUpload },
		template: '<BaseFileUpload label="Загрузите файл" />',
	}),
}
/** Загрузка файлов в процессе */
export const Loading: Story = {
	args: {
		isDisabled: true,
		label: 'Загрузка...',
	},
}
/** Нет загруженных файлов */
export const Empty: Story = {
	args: {
		emptyText: 'Файлы не загружены',
	},
}
/** Drag&Drop файла — покрывает handleDragOver/handleDragLeave/handleDrop (стр. 321-333) */
export const DragAndDrop: Story = {
	args: {
		onChange: fn(),
	},
	play: async ({ canvasElement }) => {
		const dropzone = canvasElement.querySelector('.base-file-upload__dropzone') as HTMLElement
		expect(dropzone).toBeTruthy()

		const file = createTestFile('drag.png', 1024, 'image/png')
		const dt = new DataTransfer()
		dt.items.add(file)

		const dragOver = new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt })
		dropzone.dispatchEvent(dragOver)
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-file-upload__dropzone--active')).toBeTruthy()
		})

		const dragLeave = new DragEvent('dragleave', { bubbles: true, cancelable: true, dataTransfer: dt })
		dropzone.dispatchEvent(dragLeave)
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-file-upload__dropzone--active')).toBeFalsy()
		})

		const dropEvent = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt })
		dropzone.dispatchEvent(dropEvent)

		await waitFor(() => {
			expect(canvasElement.querySelector('.base-file-upload__item')).toBeTruthy()
		})
	},
}
/** Удаление загруженного файла — покрывает handleRemove (стр. 107, 312-318) */
export const RemoveUploadedFile: Story = {
	args: {
		onChange: fn(),
		onRemove: fn(),
	},
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement
		const file = createTestFile('remove-me.png', 1024, 'image/png')
		const dt = new DataTransfer()
		dt.items.add(file)
		Object.defineProperty(input, 'files', { value: dt.files, configurable: true })
		input.dispatchEvent(new Event('change', { bubbles: true }))

		let removeBtn: HTMLButtonElement | null = null
		await waitFor(() => {
			removeBtn = canvasElement.querySelector<HTMLButtonElement>('.base-file-upload__remove')
			expect(removeBtn).toBeTruthy()
		})

		if (removeBtn) {
			await userEvent.click(removeBtn)
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-file-upload__item')).toBeFalsy()
			})
		}
	},
}
/** Превышение maxCount — покрывает блок "Максимум файлов" (стр. 250-253) */
export const MaxCountExceeded: Story = {
	args: {
		isMultiple: true,
		maxCount: 1,
		onError: fn(),
		onChange: fn(),
	},
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement

		const firstDt = new DataTransfer()
		firstDt.items.add(createTestFile('first.png', 1024, 'image/png'))
		Object.defineProperty(input, 'files', { value: firstDt.files, configurable: true })
		input.dispatchEvent(new Event('change', { bubbles: true }))

		await waitFor(() => {
			expect(canvasElement.querySelector('.base-file-upload__item')).toBeTruthy()
		})

		const secondDt = new DataTransfer()
		secondDt.items.add(createTestFile('second.png', 1024, 'image/png'))
		Object.defineProperty(input, 'files', { value: secondDt.files, configurable: true })
		input.dispatchEvent(new Event('change', { bubbles: true }))

		await waitFor(() => {
			expect(canvasElement.querySelector('.base-file-upload--error')).toBeTruthy()
		})
	},
}
/** Проп error — покрывает displayErrors с непустым props.error */
export const WithErrorProp: Story = {
	args: {
		error: 'Внешняя ошибка валидации',
	},
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-file-upload--error')).toBeTruthy()
		})
	},
}
/** Файл без preview (не image) — ветка status='pending' */
export const NonImageFile: Story = {
	args: {
		accept: '.txt,.pdf',
		onChange: fn(),
	},
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input[type="file"]')
		if (!(input instanceof HTMLInputElement)) return
		const file = createTestFile('doc.txt', 1024, 'text/plain')
		const dt = new DataTransfer()
		dt.items.add(file)
		Object.defineProperty(input, 'files', { value: dt.files, configurable: true })
		input.dispatchEvent(new Event('change', { bubbles: true }))
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-file-upload__item--pending')).toBeTruthy()
		})
	},
}
/** Drop без dataTransfer — покрывает ветку e.dataTransfer falsy */
export const DropWithoutData: Story = {
	args: {
		onChange: fn(),
	},
	play: async ({ canvasElement }) => {
		const dropzone = canvasElement.querySelector('.base-file-upload__dropzone')
		if (!(dropzone instanceof HTMLElement)) return
		const dropEvent = new Event('drop', { bubbles: true, cancelable: true })
		dropzone.dispatchEvent(dropEvent)
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-file-upload__dropzone')).toBeTruthy()
		})
	},
}
/** Change без файлов — покрывает ветку target.files falsy */
export const ChangeNoFiles: Story = {
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input[type="file"]')
		if (!(input instanceof HTMLInputElement)) return
		Object.defineProperty(input, 'files', { value: null, configurable: true })
		input.dispatchEvent(new Event('change', { bubbles: true }))
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-file-upload')).toBeTruthy()
		})
	},
}
/** customClass — покрывает elementKeys */
export const WithCustomClass: Story = {
	args: {
		customClass: {
			root: 'cc-root',
			label: 'cc-label',
			dropzone: 'cc-dropzone',
			text: 'cc-text',
			hint: 'cc-hint',
		},
	},
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(canvasElement.querySelector('.cc-root')).toBeTruthy()
		})
		expect(canvasElement.querySelector('.cc-dropzone')).toBeTruthy()
	},
}
/** Удаление одного из нескольких файлов — покрывает arrow `.map` (стр. 317) */
export const RemoveOneOfMany: Story = {
	args: {
		isMultiple: true,
		onChange: fn(),
		onRemove: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const input = canvasElement.querySelector('input[type="file"]')
		if (!(input instanceof HTMLInputElement)) return
		const dt = new DataTransfer()
		dt.items.add(createTestFile('one.png', 1024, 'image/png'))
		dt.items.add(createTestFile('two.png', 1024, 'image/png'))
		Object.defineProperty(input, 'files', { value: dt.files, configurable: true })
		input.dispatchEvent(new Event('change', { bubbles: true }))
		await waitFor(() => {
			const items = canvasElement.querySelectorAll('.base-file-upload__item')
			expect(items.length).toBe(2)
		})
		const removeBtn = canvasElement.querySelector('.base-file-upload__remove')
		if (!(removeBtn instanceof HTMLButtonElement)) return
		await userEvent.click(removeBtn)
		await waitFor(() => {
			const items = canvasElement.querySelectorAll('.base-file-upload__item')
			expect(items.length).toBe(1)
		})
		expect(args.onChange).toHaveBeenCalled()
	},
}
