/**
 * BaseEditor — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (варианты, размеры, цвет) →
 * состояния (пусто, только чтение, загрузка, длинный документ) → содержимое (типографика, режимы тулбара) →
 * сценарии (форматирование через тулбар, ссылки и медиа, режим HTML-кода) → клавиатура.
 */

import { expect, fn, screen, spyOn, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, STORY_IMAGES, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { EDITOR_VARIANTS } from '../model/BaseEditor.types'
import BaseEditor from '../ui/BaseEditor.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

// ─── Данные ────────────────────────────────────────────────────────────────────

/** Короткая заметка: песочница и витрины. */
const NOTE_HTML = [
	'<h3>План релиза 1.4</h3>',
	'<p>Обновить <strong>дизайн компонентов</strong> и переписать <em>stories</em>: из примера должно быть понятно, что за что отвечает.</p>',
].join('')

/** Все элементы содержимого, которые оформляет редактор. */
const ARTICLE_HTML = [
	'<h1>Редизайн библиотеки</h1>',
	'<p>Компоненты переходят на <strong>токены</strong> и единую высоту контролов. В тексте встречаются <em>курсив</em>, ',
	'<u>подчёркнутый</u> и <s>зачёркнутый</s> фрагменты, <a href="#tokens">ссылка на раздел</a> и код <code>sizeScale</code> в строке.</p>',
	'<h2>Что меняется</h2>',
	'<ul><li>Нейтральные поверхности и тонкие рамки</li><li>Кольцо фокуса основного цвета</li></ul>',
	'<h3>Порядок работ</h3>',
	'<ol><li>Токены и миксины</li><li>Компоненты по группам</li><li>Stories и visual-тесты</li></ol>',
	'<blockquote>Стили правильные и масштабируемые: без HEX-цветов и ручных отступов.</blockquote>',
	'<pre><code>&lt;BaseEditor v-model="html" variant="outline" /&gt;</code></pre>',
	'<hr>',
	`<p><img src="${STORY_IMAGES[1].src}" alt="${STORY_IMAGES[1].alt}" width="200"></p>`,
].join('')

/** Длинный документ: прокрутка внутри области текста и перенос длинных слов. */
const LONG_HTML = [
	'<h2>Регламент подготовки релиза</h2>',
	...Array.from({ length: 12 }, (_, index) =>
		`<p>Шаг ${index + 1}. Проверьте изменения в ветке, обновите changelog и убедитесь, что visual-тесты и e2e проходят ` +
		'в обеих темах. Замечания фиксируйте в задаче, а не в личных сообщениях: так их увидит вся команда.</p>',
	),
	'<p>Путь без пробелов переносится по символам: src/components/BaseEditor/styles/BaseEditor.style.scss/typography/long-content</p>',
	'<ul><li>Сборка пакета</li><li>Публикация документации</li><li>Анонс в канале команды</li></ul>',
].join('')

/** Иллюстрация в виде SVG-файла: её «загружает» сценарий вставки медиа. */
function storyImageFile(): File {
	const svg = decodeURIComponent(STORY_IMAGES[0].src.split(',')[1])
	return new File([svg], 'mountains.svg', { type: 'image/svg+xml' })
}

// Витрины показывают несколько редакторов: область текста пониже, чтобы примеры помещались на экран
const COMPACT_STYLE = '--editor-min-height: 72px'

const meta = {
	title: 'Editor/BaseEditor',
	component: BaseEditor,
	parameters: {
		docs: {
			description: {
				component: [
					'Визуальный редактор форматированного текста: заметки, описания задач, статьи. Значение — HTML-строка через `v-model`.',
					'',
					'- Тулбар: начертание, выравнивание, списки, цитата и блок кода, цвет текста и фона, формат абзаца,',
					'  ссылка, изображение и видео, очистка форматирования, разделитель, режим HTML-кода.',
					'- Горячие клавиши: `Ctrl+B`, `Ctrl+I`, `Ctrl+U` (⌘ на macOS). Правый клик по медиа открывает меню размера.',
					'- `hasToolbar: false` — поле без тулбара; слот `toolbar` заменяет стандартные кнопки своими.',
					'- Область текста — `role="textbox"` с `aria-multiline`; кнопки тулбара озвучиваются названием и состоянием (`aria-pressed`).',
					'- Высота области текста — CSS-переменные `--editor-min-height` (160px) и `--editor-max-height` (600px) на корне;',
					'  длинный текст прокручивается внутри. Проп `color` красит область текста, тулбар остаётся нейтральным.',
					'',
					'**Безопасность.** HTML из `modelValue` вставляется как есть, без санитизации (сработают `<img onerror>`, `<svg onload>`,',
					'в том числе при `isReadonly`). Недоверенный HTML санитизируйте на сервере до сохранения и до передачи в редактор.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: EDITOR_VARIANTS }),
		modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
		placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
		hasToolbar: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isAutofocus: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		toolbar: { control: false },
	},
	args: {
		modelValue: NOTE_HTML,
		placeholder: 'Начните писать…',
		variant: 'default',
		sizeScale: 100,
		hasToolbar: true,
		isReadonly: false,
		isAutofocus: false,
		'onUpdate:modelValue': fn(),
		onFocus: fn(),
		onBlur: fn(),
	},
	// Значение хранится в args: ввод в редакторе обновляет Controls, а изменение в Controls — редактор.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseEditor },
			setup: () => ({ props: useArgsWithoutSlots(args, ['toolbar']), onUpdate }),
			template: '<BaseEditor v-bind="props" @update:model-value="onUpdate" />',
		}
	},
} satisfies Meta<typeof BaseEditor>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Render сценариев: значение живёт в локальном ref (обычный синхронный v-model), а не в args. Play-функции меняют текст
 * несколько раз подряд, а args Storybook обновляются асинхронно и могли бы вернуть в редактор устаревший HTML.
 */
const renderWithLocalModel: Story['render'] = args => ({
	components: { BaseEditor },
	setup: () => ({ props: useArgsWithoutSlots(args, ['toolbar', 'modelValue']), html: ref(args.modelValue ?? '') }),
	template: '<BaseEditor v-bind="props" v-model="html" />',
})

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: печатайте в редакторе или меняйте props в Controls — HTML в `modelValue` синхронизирован
 * (событие `update:modelValue` видно в панели Actions).
 */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await userEvent.type(textbox, ' Готово к ревью.')
		await expect(textbox).toHaveFocus()
		await expect(textbox).toHaveTextContent('отвечает. Готово к ревью.')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов. `default` — основной; `outline` — на цветном фоне; `soft` и `ghost` — внутри карточек и панелей,
 * где рамка лишняя; `shadow` — с лёгкой тенью. Фокус в тексте во всех вариантах — рамка и кольцо основного цвета.
 */
export const Variants: Story = {
	argTypes: { variant: { control: false } },
	parameters: {
		controls: { include: ['sizeScale', 'hasToolbar', 'isReadonly'] },
		docs: { source: { code: EDITOR_VARIANTS.map(variant => `<BaseEditor v-model="html" variant="${variant}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseEditor },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['toolbar', 'modelValue', 'variant', 'onUpdate:modelValue']),
			variants: EDITOR_VARIANTS,
			values: ref<Record<string, string>>(Object.fromEntries(EDITOR_VARIANTS.map(variant => [variant, `<p>Вариант <strong>${variant}</strong>: рамка, фон и тулбар.</p>`]))),
			compactStyle: COMPACT_STYLE,
		}),
		template: `
			<div class="story-stack">
				<div v-for="variant in variants" :key="variant" class="story-stack" style="gap: 6px;">
					<span class="story-label">{{ variant }}</span>
					<BaseEditor v-bind="props" v-model="values[variant]" :variant="variant" :style="compactStyle" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: кнопки тулбара 21–35px (28px при 100), текст 10.5–17.5px, отступы масштабируются пропорционально. */
export const Sizes: Story = {
	argTypes: { sizeScale: { control: false } },
	parameters: {
		controls: { include: ['variant', 'hasToolbar'] },
		docs: { source: { code: SIZE_PRESETS.map(p => `<BaseEditor v-model="html" :size-scale="${p.sizeScale}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseEditor },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['toolbar', 'modelValue', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string>>(Object.fromEntries(SIZE_PRESETS.map(p => [p.name, `<p>Размер <strong>${p.name}</strong> — sizeScale ${p.sizeScale}.</p>`]))),
			compactStyle: COMPACT_STYLE,
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-stack" style="gap: 6px;">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseEditor v-bind="props" v-model="values[preset.name]" :size-scale="preset.sizeScale" :style="compactStyle" />
				</div>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: `bg.base` — фон области текста, `text.base` — цвет текста и заголовков.
 * Тулбар остаётся на фоне варианта, его кнопки — нейтральные вложенные компоненты, их цвет не меняется в любой теме.
 */
export const CustomColor: Story = {
	args: {
		modelValue: '<h3>Заметки к встрече</h3><p>Фон и текст задаёт проп <code>color</code>, кнопки тулбара остаются нейтральными.</p>',
		color: { bg: { base: '#fffbeb' }, text: { base: '#78350f' } },
	},
	play: async ({ canvas }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await expect(getComputedStyle(textbox).backgroundColor).toBe('rgb(255, 251, 235)')
		await expect(getComputedStyle(textbox).color).toBe('rgb(120, 53, 15)')
		// Тулбар лежит на фоне варианта (корень редактора), а не на кастомном фоне
		const root = textbox.closest('.base-editor') as HTMLElement
		await expect(getComputedStyle(root).backgroundColor).not.toBe('rgb(255, 251, 235)')
		// Кнопки тулбара не наследуют цвет редактора: фон прозрачный, текст — нейтральный токен темы
		const bold = canvas.getByRole('button', { name: 'Жирный' })
		await expect(getComputedStyle(bold).backgroundColor).toBe('rgba(0, 0, 0, 0)')
		await expect(getComputedStyle(bold).color).not.toBe('rgb(120, 53, 15)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Пустой редактор: виден плейсхолдер, скринридер получает его через `aria-placeholder`. */
export const Empty: Story = {
	args: { modelValue: '', placeholder: 'Опишите задачу: что сделать и к какому сроку' },
	play: async ({ canvas }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await expect(textbox.textContent).toBe('')
		await expect(textbox).toHaveAttribute('aria-placeholder', 'Опишите задачу: что сделать и к какому сроку')
	},
}

/**
 * Только чтение: тулбара нет, фон приглушён. Текст можно выделить и скопировать, но не изменить;
 * меню размера медиа по правому клику не открывается (остаётся меню браузера).
 */
export const Readonly: Story = {
	args: {
		isReadonly: true,
		modelValue: [
			'<h3>Итоги спринта</h3>',
			'<p>Выпущены <strong>BaseEditor</strong> и <strong>BaseChat</strong>, закрыто 18 задач. Подробности — в <a href="#report">отчёте</a>.</p>',
			`<p><img src="${STORY_IMAGES[2].src}" alt="${STORY_IMAGES[2].alt}" width="240"></p>`,
		].join(''),
	},
	play: async ({ canvas, userEvent }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await expect(textbox).toHaveAttribute('aria-readonly', 'true')
		await expect(textbox).toHaveAttribute('contenteditable', 'false')
		await expect(canvas.queryByRole('toolbar')).toBeNull()
		await userEvent.pointer({ keys: '[MouseRight]', target: within(textbox).getByRole('img', { name: STORY_IMAGES[2].alt }) })
		await expect(screen.queryByRole('dialog', { name: 'Размер медиа' })).toBeNull()
	},
}

/**
 * Загрузка документа. Отдельного состояния загрузки у редактора нет: пока HTML не пришёл, покажите редактор
 * только для чтения с плейсхолдером «Загрузка…», после ответа сервера передайте HTML и снимите `isReadonly`.
 */
export const Loading: Story = {
	args: { modelValue: '', isReadonly: true, placeholder: 'Загрузка документа…' },
	parameters: { docs: { source: { code: '<BaseEditor v-model="html" :is-readonly="isLoading" :placeholder="isLoading ? \'Загрузка документа…\' : \'\'" />' } } },
	play: async ({ canvas }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await expect(textbox).toHaveAttribute('aria-readonly', 'true')
		await expect(textbox).toHaveAttribute('aria-placeholder', 'Загрузка документа…')
	},
}

/**
 * Длинный документ прокручивается внутри области текста (до 600px при sizeScale = 100, переменная `--editor-max-height`),
 * тулбар остаётся на месте. Слова без пробелов переносятся и не растягивают редактор.
 */
export const LongContent: Story = {
	args: { modelValue: LONG_HTML },
	play: async ({ canvas }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await expect(textbox.scrollHeight).toBeGreaterThan(textbox.clientHeight)
		await expect(textbox.scrollWidth).toBeLessThanOrEqual(textbox.clientWidth)
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/**
 * Типографика содержимого: заголовки трёх уровней, начертания, ссылка, код в строке и блок кода, списки, цитата,
 * разделитель и изображение. Стили элементов заданы с нулевой специфичностью — `customClass.content` их перекрывает.
 */
export const FormattedContent: Story = {
	args: { modelValue: ARTICLE_HTML },
}

/**
 * Режимы тулбара. Стандартный — все инструменты. `hasToolbar: false` — поле без тулбара, например для комментариев.
 * Слот `toolbar` заменяет стандартные кнопки своими: клик по ним не уводит фокус и выделение из текста.
 */
export const ToolbarModes: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseEditor v-model="html" />',
					'<BaseEditor v-model="comment" :has-toolbar="false" placeholder="Напишите комментарий…" />',
					'<BaseEditor v-model="reply">',
					'  <template #toolbar>',
					'    <BaseButton variant="ghost" @click="insertSnippet(\'Добрый день!\')">Приветствие</BaseButton>',
					'  </template>',
					'</BaseEditor>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseEditor, BaseButton },
		setup: () => {
			const snippets = ['Добрый день!', 'Спасибо за обращение.', 'С уважением, служба поддержки.']
			// Свой тулбар вставляет фрагмент в позицию каретки: фокус остаётся в тексте, поэтому команда применяется к нему
			function insertSnippet(text: string): void {
				document.execCommand('insertText', false, ` ${text}`)
			}
			return {
				props: useArgsWithoutSlots(args, ['toolbar', 'modelValue', 'hasToolbar', 'placeholder', 'onUpdate:modelValue']),
				full: ref(NOTE_HTML),
				comment: ref(''),
				reply: ref('<p>Здравствуйте, Анна.</p>'),
				snippets,
				insertSnippet,
				compactStyle: COMPACT_STYLE,
			}
		},
		template: `
			<div class="story-stack">
				<div class="story-stack" style="gap: 6px;">
					<span class="story-label">Стандартный тулбар</span>
					<BaseEditor v-bind="props" v-model="full" :style="compactStyle" />
				</div>
				<div class="story-stack" style="gap: 6px;">
					<span class="story-label">Без тулбара — hasToolbar: false</span>
					<BaseEditor v-bind="props" v-model="comment" :has-toolbar="false" placeholder="Напишите комментарий…" :style="compactStyle" />
				</div>
				<div class="story-stack" style="gap: 6px;">
					<span class="story-label">Свой тулбар — слот toolbar</span>
					<BaseEditor v-bind="props" v-model="reply" :style="compactStyle">
						<template #toolbar>
							<BaseButton v-for="snippet in snippets" :key="snippet" variant="ghost" :size-scale="87.5" @click="insertSnippet(snippet)">
								{{ snippet }}
							</BaseButton>
						</template>
					</BaseEditor>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const reply = canvas.getAllByRole('textbox', { name: 'Текстовый редактор' })[2]
		await userEvent.click(within(reply).getByText('Здравствуйте, Анна.'))
		await userEvent.click(canvas.getByRole('button', { name: 'Спасибо за обращение.' }))
		await expect(reply).toHaveTextContent('Здравствуйте, Анна. Спасибо за обращение.')
		await expect(reply).toHaveFocus()
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Форматирование через тулбар: выделите текст и нажмите кнопку. Кнопка включённого формата подсвечена
 * и озвучивается как нажатая (`aria-pressed`).
 */
export const ToolbarFormatting: Story = {
	render: renderWithLocalModel,
	args: { modelValue: '<p>Сроки сдвигаются на неделю.</p><p>Ответственный — Иван Петров.</p>' },
	play: async ({ canvas, userEvent, args }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		const bold = canvas.getByRole('button', { name: 'Жирный' })
		await expect(bold).toHaveAttribute('aria-pressed', 'false')

		await userEvent.tripleClick(within(textbox).getByText('Сроки сдвигаются на неделю.'))
		await userEvent.click(bold)
		await waitFor(() => expect(bold).toHaveAttribute('aria-pressed', 'true'))
		await expect(within(textbox).getByText('Сроки сдвигаются на неделю.').closest('b, strong')).not.toBeNull()

		await userEvent.tripleClick(within(textbox).getByText('Ответственный — Иван Петров.'))
		await userEvent.click(canvas.getByRole('button', { name: 'Маркированный список' }))
		await expect(within(textbox).getByRole('listitem')).toHaveTextContent('Ответственный — Иван Петров.')
		await expect(args['onUpdate:modelValue']).toHaveBeenLastCalledWith(expect.stringContaining('<ul>'))
	},
}

/**
 * Ссылки и медиа. «Ссылка» спрашивает адрес (`window.prompt`) и превращает выделение в ссылку; «Изображение»
 * и «Видео» вставляют выбранный файл в позицию каретки. Правый клик по изображению открывает меню размера:
 * фокус переходит в поле «Ширина», Enter или «Применить» задают размер, «Удалить» убирает медиа, Escape закрывает меню.
 */
export const MediaAndLinks: Story = {
	render: renderWithLocalModel,
	args: { modelValue: '<p>Макеты главной страницы</p><p>Фото стенда: </p>' },
	play: async ({ canvas, userEvent }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })

		// Адрес ссылки вместо диалога браузера
		spyOn(window, 'prompt').mockReturnValue('/docs/design')
		await userEvent.tripleClick(within(textbox).getByText('Макеты главной страницы'))
		await userEvent.click(canvas.getByRole('button', { name: 'Ссылка' }))
		await expect(within(textbox).getByRole('link', { name: 'Макеты главной страницы' })).toHaveAttribute('href', '/docs/design')

		await userEvent.click(within(textbox).getByText('Фото стенда:'))
		await userEvent.upload(canvas.getByLabelText('Изображение'), storyImageFile())
		// Изображение без описания вставляется как оформление (alt=""), поэтому роли img у него нет
		const image = textbox.querySelector('img') as HTMLImageElement
		await expect(image).toHaveAttribute('alt', '')

		await userEvent.pointer({ keys: '[MouseRight]', target: image })
		const menu = await screen.findByRole('dialog', { name: 'Размер медиа' })
		const width = within(menu).getByLabelText('Ширина')
		await waitFor(() => expect(width).toHaveFocus())
		await userEvent.clear(width)
		await userEvent.type(width, '240')
		const height = within(menu).getByLabelText('Высота')
		await userEvent.clear(height)
		await userEvent.type(height, '150{Enter}')
		await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Размер медиа' })).toBeNull())
		await expect(image.style.width).toBe('240px')
		await expect(image.style.height).toBe('150px')
	},
}

/**
 * Режим HTML-кода: кнопка «Режим кода» показывает разметку в текстовом поле, правки видны в визуальном режиме
 * после повторного нажатия. Кнопки тулбара в режиме кода оборачивают выделенный фрагмент в теги.
 */
export const CodeMode: Story = {
	render: renderWithLocalModel,
	args: { modelValue: '<p>Текст с <strong>жирным</strong> словом.</p>' },
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('button', { name: 'Режим кода' })
		await userEvent.click(toggle)
		await expect(toggle).toHaveAttribute('aria-pressed', 'true')

		const code = canvas.getByRole('textbox', { name: 'HTML-код' })
		await expect(code).toHaveValue('<p>Текст с <strong>жирным</strong> словом.</p>')
		await userEvent.clear(code)
		await userEvent.type(code, '<h3>Итоги</h3><p>Все задачи закрыты.</p>')

		await userEvent.click(toggle)
		await expect(toggle).toHaveAttribute('aria-pressed', 'false')
		const textbox = await canvas.findByRole('textbox', { name: 'Текстовый редактор' })
		await waitFor(() => expect(within(textbox).getByRole('heading', { name: 'Итоги' })).toBeVisible())
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab проходит по кнопкам тулбара и попадает в текст (видно кольцо фокуса), Shift+Tab возвращает
 * к последней кнопке. Ctrl+B / Ctrl+I / Ctrl+U (⌘ на macOS) переключают начертание выделенного текста.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	render: renderWithLocalModel,
	args: { modelValue: '<p>Проверка клавиатуры</p>' },
	play: async ({ canvas, userEvent }) => {
		const bold = canvas.getByRole('button', { name: 'Жирный' })
		await userEvent.tab()
		await expect(bold).toHaveFocus()

		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await tabTo(textbox, userEvent, 30)
		await expect(getComputedStyle(textbox.closest('.base-editor') as HTMLElement).boxShadow).not.toBe('none')

		await userEvent.tripleClick(within(textbox).getByText('Проверка клавиатуры'))
		await userEvent.keyboard('{Control>}b{/Control}')
		await waitFor(() => expect(bold).toHaveAttribute('aria-pressed', 'true'))
		await userEvent.keyboard('{Control>}i{/Control}')
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Курсив' })).toHaveAttribute('aria-pressed', 'true'))

		await userEvent.tab({ shift: true })
		await expect(canvas.getByRole('button', { name: 'Режим кода' })).toHaveFocus()
	},
}
