/**
 * BaseFileUpload — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты, размеры, цвет) → состояния (пусто, ошибка, disabled, загрузка) →
 * сценарии (несколько файлов, только изображения, перетаскивание) → клавиатура.
 */

import { expect, fireEvent, fn, waitFor } from 'storybook/test'
import {
	ARG_GROUP,
	baseArgTypes,
	hiddenArgTypes,
	placeholderImage,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	STORY_WAIT_TIMEOUT,
	tabTo,
	useArgsWithoutSlots,
} from '@/stories/helpers'
import { FILE_UPLOAD_VARIANTS } from '../model/BaseFileUpload.types'
import BaseFileUpload from '../ui/BaseFileUpload.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Изображение для загрузки: SVG-иллюстрация из фикстур stories (детерминированная, без сети). */
function imageFile(name: string, hue = 200): File {
	const svg = decodeURIComponent(placeholderImage({ width: 400, height: 250, hue }).split(',')[1]!)
	return new File([svg], name, { type: 'image/svg+xml' })
}

/** Документ заданного размера (КБ): содержимое не важно, важны имя, тип и размер. */
function documentFile(name: string, sizeKb: number, type = 'application/pdf'): File {
	return new File([new Uint8Array(sizeKb * 1024)], name, { type })
}

/**
 * Данные перетаскивания для fireEvent: браузер принимает в DragEvent только настоящий DataTransfer, а fireEvent
 * пересобирает его из собственных свойств объекта — поэтому files делаем собственным свойством.
 */
function dropData(files: File[]): DataTransfer {
	const data = new DataTransfer()
	for (const file of files) data.items.add(file)
	Object.defineProperty(data, 'files', { value: data.files })
	return data
}

/** Имитация прогресса (FU-2) занимает до ~4 с: ждём статус «Загружено» с запасом. */
const UPLOAD_TIMEOUT = 6000

const meta = {
	title: 'Form/BaseFileUpload',
	component: BaseFileUpload,
	parameters: {
		docs: {
			description: {
				component: [
					'Загрузка файлов: зона, куда файлы перетаскивают или где их выбирают, и список выбранных файлов.',
					'',
					'- Зона — кнопка: клик, Enter и Space открывают системный выбор файла; подпись `label` связана с полем.',
					'- `accept` и `maxSize` (МБ) проверяют файл при выборе; ошибки проверки и проп `error` выводятся под зоной',
					'  и связаны с ней через `aria-describedby`.',
					'- Без `isMultiple` новый файл заменяет выбранный (`change` отдаёт один файл); с `isMultiple` — до `maxCount` файлов.',
					'- В строке файла — превью изображения (по клику открывается просмотр) или иконка типа, размер и статус.',
					'  Прогресс загрузки пока имитируется компонентом (аудит FU-2).',
					'',
					'Для полей, которые валидирует форма, используйте `BaseForm` + `BaseFormField`.',
				].join('\n'),
			},
		},
	},
	// Ширина примера — 560px; витрины с несколькими зонами задают parameters.maxWidth
	decorators: [
		(_, { parameters }) => ({ template: `<div style="width: 100%; max-width: ${parameters.maxWidth ?? 560}px;"><story /></div>` }),
	],
	argTypes: {
		...baseArgTypes({ variants: FILE_UPLOAD_VARIANTS }),
		// emptyText и слот default компонент не выводит (аудит FU-10)
		...hiddenArgTypes('emptyText', 'default'),
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		buttonText: { control: 'text', table: propGroup(ARG_GROUP.content) },
		previewSize: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		accept: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
		isMultiple: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		maxSize: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		maxCount: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		allowPreview: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		trigger: { control: false },
	},
	args: {
		label: 'Вложения',
		accept: '.pdf,.docx,image/*',
		maxSize: 10,
		variant: 'default',
		isMultiple: false,
		isDisabled: false,
		allowPreview: true,
		sizeScale: 100,
		onChange: fn(),
		onError: fn(),
		onRemove: fn(),
	},
} satisfies Meta<typeof BaseFileUpload>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: выберите файл кликом по зоне или перетащите его. Выбранный файл появляется в списке, `change` отдаёт его. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		// Подпись связана с полем выбора файла
		await userEvent.upload(canvas.getByLabelText('Вложения'), documentFile('Отчёт за май.pdf', 248))
		await expect(await canvas.findByText('Отчёт за май.pdf')).toBeVisible()
		await expect(canvas.getByText('248,0 КБ')).toBeVisible()
		await expect(args.onChange).toHaveBeenCalledOnce()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Варианты зоны: `default` — пунктир; `outline` — сплошная рамка на прозрачном фоне; `soft` — мягкий фон без рамки;
 * `ghost` — без рамки и фона (для плотных интерфейсов); `shadow` — приподнятая с тенью.
 */
export const Variants: Story = {
	parameters: {
		maxWidth: 760,
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: { source: { code: FILE_UPLOAD_VARIANTS.map(variant => `<BaseFileUpload variant="${variant}" label="${variant}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseFileUpload },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label']), variants: FILE_UPLOAD_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 220px;">
				<BaseFileUpload v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: отступы, шрифт и иконки зоны и строк файлов масштабируются вместе. */
export const Sizes: Story = {
	parameters: {
		maxWidth: 760,
		controls: { include: ['variant'] },
		docs: { source: { code: SIZE_PRESETS.map(preset => `<BaseFileUpload :size-scale="${preset.sizeScale}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseFileUpload },
		setup: () => ({ props: useArgsWithoutSlots(args, ['sizeScale', 'label']), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-grid" style="--story-grid-min: 280px; align-items: end;">
				<BaseFileUpload v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" />
			</div>
		`,
	}),
}

/**
 * Кастомный цвет зоны через `color`: фон (с наведением) и цвет заголовка — например, под брендовую форму.
 * Строки файлов и их кнопки цветом компонента не перекрашиваются.
 */
export const CustomColor: Story = {
	args: {
		label: 'Логотип компании',
		accept: 'image/*',
		color: { bg: { base: '#f5f3ff', hover: '#ede9fe' }, text: { base: '#6d28d9' } },
	},
	play: async ({ canvas, userEvent }) => {
		const dropzone = canvas.getByRole('button', { name: /Выберите файлы/ })
		await expect(getComputedStyle(dropzone).backgroundColor).toBe('rgb(245, 243, 255)')
		await expect(getComputedStyle(canvas.getByText('Выберите файлы')).color).toBe('rgb(109, 40, 217)')
		// Подпись поля — вне зоны: цвет компонента её не перекрашивает
		await expect(getComputedStyle(canvas.getByText('Логотип компании')).color).not.toBe('rgb(109, 40, 217)')

		await userEvent.upload(canvas.getByLabelText('Логотип компании'), imageFile('Логотип.svg', 270))
		const remove = await canvas.findByRole('button', { name: 'Удалить Логотип.svg' })
		await expect(getComputedStyle(remove).color).not.toBe('rgb(109, 40, 217)')
		await expect(await canvas.findByText('Загружено', {}, { timeout: UPLOAD_TIMEOUT })).toBeVisible()
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Файлы ещё не выбраны: только зона загрузки с подсказкой о форматах и размере, списка нет. */
export const Empty: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByText('.PDF, .DOCX, IMAGE/*')).toBeVisible()
		await expect(canvas.getByText('до 10 МБ')).toBeVisible()
		await expect(canvas.queryByRole('list')).not.toBeInTheDocument()
	},
}

/** Ошибка: рамка зоны цвета ошибки, текст под ней; зона описана текстом ошибки (`aria-describedby`). */
export const WithError: Story = {
	args: { error: 'Прикрепите хотя бы один документ' },
	play: async ({ canvas }) => {
		await waitFor(() => expect(canvas.getByText('Прикрепите хотя бы один документ')).toBeVisible())
		await expect(canvas.getByRole('button', { name: /Выберите файлы/ })).toHaveAccessibleDescription('Прикрепите хотя бы один документ')
	},
}

/** Отключённая зона: приглушена, не получает фокус, не открывает выбор файла и не принимает перетаскивание. */
export const Disabled: Story = {
	args: { isDisabled: true },
	play: async ({ canvas, userEvent, args }) => {
		const dropzone = canvas.getByRole('button', { name: /Выберите файлы/ })
		await expect(dropzone).toHaveAttribute('aria-disabled', 'true')
		await expect(canvas.getByLabelText('Вложения')).toBeDisabled()

		await userEvent.tab()
		await expect(dropzone).not.toHaveFocus()
		await fireEvent.drop(dropzone, { dataTransfer: dropData([documentFile('Отчёт.pdf', 12)]) })
		await expect(args.onChange).not.toHaveBeenCalled()
	},
}

/**
 * Загрузка: пока файл отправляется, в строке — процент и полоса `BaseProgress` с именем файла, после — «Загружено».
 * Сейчас прогресс имитируется компонентом (аудит FU-2), для документов статус остаётся «Ожидание».
 */
export const Loading: Story = {
	args: { label: 'Обложка', accept: 'image/*' },
	play: async ({ canvas, userEvent }) => {
		await userEvent.upload(canvas.getByLabelText('Обложка'), imageFile('Обложка.svg', 24))
		await expect(await canvas.findByRole('progressbar', { name: 'Обложка.svg' })).toBeVisible()
		await expect(await canvas.findByText('Загружено', {}, { timeout: UPLOAD_TIMEOUT })).toBeVisible()
		await expect(canvas.queryByRole('progressbar')).not.toBeInTheDocument()
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Несколько файлов (`isMultiple`, до `maxCount`): новые файлы добавляются в список, крестик удаляет файл
 * (`remove`, затем `change` с оставшимися). Длинное имя обрезается многоточием, полное — в подсказке.
 */
export const Multiple: Story = {
	args: { isMultiple: true, maxCount: 5, label: 'Документы по сделке' },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.upload(canvas.getByLabelText('Документы по сделке'), [
			documentFile('Договор аренды офиса на 2025 год — финальная версия с правками юриста.pdf', 1840),
			documentFile('Смета.docx', 36, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
			imageFile('План этажа.svg', 150),
		])
		await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(3))

		await userEvent.click(canvas.getByRole('button', { name: 'Удалить Смета.docx' }))
		await expect(args.onRemove).toHaveBeenCalledOnce()
		await expect(canvas.getAllByRole('listitem')).toHaveLength(2)
		await expect(args.onChange).toHaveBeenLastCalledWith([expect.any(File), expect.any(File)])
		await expect(await canvas.findByText('Загружено', {}, { timeout: UPLOAD_TIMEOUT })).toBeVisible()
	},
}

/**
 * Только изображения (`accept`): файл другого типа не принимается — под зоной ошибка. Выбранное изображение
 * показывается превью; клик по превью открывает просмотр (`allowPreview`). Новый файл заменяет прежний.
 */
export const ImagesOnly: Story = {
	args: { label: 'Фото товара', accept: '.png,.jpg,.jpeg,.svg', buttonText: 'Выберите изображение', maxSize: 5 },
	play: async ({ canvas, userEvent, args }) => {
		const dropzone = canvas.getByRole('button', { name: /Выберите изображение/ })
		await fireEvent.drop(dropzone, { dataTransfer: dropData([documentFile('Счёт.pdf', 90)]) })
		const error = await canvas.findByText(/Формат файла "Счёт\.pdf" не поддерживается/)
		await waitFor(() => expect(error).toBeVisible())
		await expect(args.onError).toHaveBeenCalledOnce()

		await userEvent.upload(canvas.getByLabelText('Фото товара'), imageFile('Товар.svg', 340))
		await expect(await canvas.findByRole('button', { name: 'Товар.svg' })).toBeVisible()
		await expect(canvas.queryByText(/не поддерживается/)).not.toBeInTheDocument()
		await expect(await canvas.findByText('Загружено', {}, { timeout: UPLOAD_TIMEOUT })).toBeVisible()
	},
}

/** Перетаскивание: над зоной файл подсвечивает её (фон и рамка основного цвета), после отпускания файл попадает в список. */
export const DragAndDrop: Story = {
	play: async ({ canvas, args }) => {
		const dropzone = canvas.getByRole('button', { name: /Выберите файлы/ })
		const idleBorder = getComputedStyle(dropzone).borderTopColor
		const dataTransfer = dropData([documentFile('Акт сверки.pdf', 64)])

		await fireEvent.dragOver(dropzone, { dataTransfer })
		await waitFor(() => expect(getComputedStyle(dropzone).borderTopColor).not.toBe(idleBorder))
		await fireEvent.dragLeave(dropzone, { dataTransfer })
		await waitFor(() => expect(getComputedStyle(dropzone).borderTopColor).toBe(idleBorder))

		await fireEvent.drop(dropzone, { dataTransfer })
		await expect(await canvas.findByText('Акт сверки.pdf')).toBeVisible()
		await expect(args.onChange).toHaveBeenCalledOnce()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/** Клавиатура: Tab до зоны (кольцо фокуса), Enter и Space открывают системный выбор файла. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const dropzone = canvas.getByRole('button', { name: /Выберите файлы/ })
		const openPicker = fn()
		canvas.getByLabelText('Вложения').addEventListener('click', openPicker)

		await tabTo(dropzone, userEvent)
		await expect(getComputedStyle(dropzone).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await waitFor(() => expect(openPicker).toHaveBeenCalledTimes(2), { timeout: STORY_WAIT_TIMEOUT })
	},
}
