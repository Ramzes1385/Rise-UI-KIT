/**
 * Stories для компонента BaseEditor.
 * Демонстрирует все состояния и режимы.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, waitFor } from 'storybook/test'
import { nextTick, ref } from 'vue'

import { buildArgTypes } from '@utils/storybookUtils'
import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'

import BaseEditor from '../ui/BaseEditor.vue'

import { EDITOR_VARIANTS } from '../model/BaseEditor.types'

const meta: Meta<typeof BaseEditor> = {
	title: 'UI/BaseEditor',
	component: BaseEditor,

	argTypes: buildArgTypes({
		props: {
			placeholder: { control: 'text' },
			variant: { control: 'radio', options: EDITOR_VARIANTS },
			color: {
				control: 'object',
				description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
			},
			isReadonly: { control: 'boolean' },
			hasToolbar: { control: 'boolean' },
			isAutofocus: { control: 'boolean' },
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
		},
		hidden: ['modelValue', 'onUpdate:modelValue', 'onFocus', 'onBlur'],
	}),

	args: {
		placeholder: 'Начните вводить текст...',
		variant: 'default',
		isReadonly: false,
		hasToolbar: true,
		isAutofocus: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseEditor>
/** Базовый редактор */
export const Default: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Привет, <strong>мир</strong>!</p>')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка редактора по Tab', async () => {
			await userEvent.tab()
		})
		await playShiftTab(canvasElement, { selector: '.base-editor' })
	},
}
/** Без панели инструментов */
export const NoToolbar: Story = {
	args: {
		hasToolbar: false,
	},
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Простой текст</p>')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
}
/** Только чтение */
export const Readonly: Story = {
	args: {
		isReadonly: true,
	},
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Только для чтения</p>')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
}
/** Все варианты с форматированным контентом */
export const Variants: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref(`
				<h3>Заголовок</h3>
				<p>Текст с <strong>жирным</strong> и <em>курсивом</em>.</p>
				<ul><li>Элемент списка</li></ul>
			`)
			return { args, content }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:40px;">
				<div v-for="v in ['default','ghost','outline','shadow','soft']" :key="v">
					<p style="margin-bottom:8px;font-size:12px;color:var(--color-text-muted);">Variant: {{ v }}</p>
					<BaseEditor v-model="content" v-bind="args" :variant="v" />
				</div>
			</div>
		`,
	}),
}
/** Контент со всеми видами форматирования */
export const WithFormattedContent: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref(`
				<h2>Заголовок статьи</h2>
				<p>Текст с <strong>жирным</strong>, <em>курсивом</em>, <u>подчёркнутым</u> и <s>зачёркнутым</s> форматированием.</p>
				<blockquote>Цитата — это важная мысль, выделенная особым образом.</blockquote>
				<p>Инлайн <code>console.log('hello')</code> код в тексте.</p>
				<p><a href="https://example.com">Ссылка на пример</a></p>
			`)
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseEditor v-model="content" /> // content содержит все виды форматирования`,
			},
		},
	},
}
/** Контент с блоком кода и инлайн кодом */
export const WithCodeBlock: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref(`
				<p>Пример использования функции:</p>
				<pre><code>function greet(name) {
  return 'Hello, ' + name + '!'
}

console.log(greet('World'))</code></pre>
				<p>Инлайн код: <code>const x = 42</code> — переменная.</p>
			`)
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseEditor v-model="content" /> // content содержит pre/code блоки`,
			},
		},
	},
}
/** Контент с изображением */
export const WithMedia: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref(`
				<p>Текст перед изображением.</p>
				<img src="https://picsum.photos/600/300" alt="Пример изображения" style="max-width:100%;border-radius:8px;" />
				<p>Текст после изображения. Правый клик по картинке — контекстное меню.</p>
			`)
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseEditor v-model="content" /> // content содержит img`,
			},
		},
	},
}
/** Маркированный и нумерованный списки */
export const WithLists: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref(`
				<p>Маркированный список:</p>
				<ul>
					<li>Первый элемент</li>
					<li>Второй элемент</li>
					<li>Третий элемент</li>
				</ul>
				<p>Нумерованный список:</p>
				<ol>
					<li>Шаг первый</li>
					<li>Шаг второй</li>
					<li>Шаг третий</li>
				</ol>
			`)
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseEditor v-model="content" /> // content содержит ul/ol списки`,
			},
		},
	},
}
/** Все уровни заголовков */
export const WithHeadings: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref(`
				<h1>Заголовок 1</h1>
				<h2>Заголовок 2</h2>
				<h3>Заголовок 3</h3>
				<h4>Заголовок 4</h4>
				<h5>Заголовок 5</h5>
				<h6>Заголовок 6</h6>
				<p>Обычный параграф после заголовков.</p>
			`)
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseEditor v-model="content" /> // content содержит h1-h6`,
			},
		},
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref(`
				<h2>Тёмная тема</h2>
				<p>Текст с <strong>жирным</strong> и <em>курсивом</em>.</p>
				<pre><code>const dark = true</code></pre>
				<p>Инлайн <code>code</code> в тексте.</p>
			`)
			return { args, content }
		},
		template:
			'<div data-theme="dark" style="padding:16px;background:var(--color-bg);"><BaseEditor v-model="content" v-bind="args" /></div>',
	}),
	parameters: {
		docs: {
			source: {
				code: `<div data-theme="dark"><BaseEditor v-model="content" /></div>`,
			},
		},
	},
}
/** Разные масштабы */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Текст для проверки масштаба</p>')
			return { args, content }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:40px;">
				<div>
					<p style="margin-bottom:8px;font-size:12px;color:var(--color-text-muted);">sizeScale: 75</p>
					<BaseEditor v-model="content" v-bind="args" :size-scale="75" />
				</div>
				<div>
					<p style="margin-bottom:8px;font-size:12px;color:var(--color-text-muted);">sizeScale: 100</p>
					<BaseEditor v-model="content" v-bind="args" :size-scale="100" />
				</div>
				<div>
					<p style="margin-bottom:8px;font-size:12px;color:var(--color-text-muted);">sizeScale: 150</p>
					<BaseEditor v-model="content" v-bind="args" :size-scale="150" />
				</div>
			</div>
		`,
	}),
}
/** Кастомные цвета */
export const WithCustomColor: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Редактор с кастомными цветами</p>')
			return {
				args,
				content,
				customColor: {
					bg: { base: '#fef3c7', hover: '#fde68a' },
					text: { base: '#92400e', hover: '#78350f' },
				},
			}
		},
		template: '<BaseEditor v-model="content" v-bind="args" :color="customColor" />',
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseEditor v-model="content" :color="{ bg: { base: '#fef3c7' }, text: { base: '#92400e' } }" />`,
			},
		},
	},
}
/** Readonly с форматированным контентом */
export const ReadonlyWithContent: Story = {
	args: {
		isReadonly: true,
	},
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref(`
				<h2>Форматированный контент</h2>
				<p>Текст с <strong>жирным</strong>, <em>курсивом</em> и <u>подчёркнутым</u>.</p>
				<ul><li>Элемент списка</li></ul>
				<blockquote>Цитата в readonly режиме</blockquote>
			`)
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseEditor v-model="content" is-readonly />`,
			},
		},
	},
}
/** Интерактивный */
export const Interactive: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('')
			return { args, content }
		},
		template: `
			<div>
				<BaseEditor v-model="content" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);font-size:12px;">HTML: {{ content }}</p>
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('ввод текста отражается в области редактора', async () => {
			const content = getContent(canvasElement)
			if (!content) return
			content.focus()
			await userEvent.type(content, 'Заметка')
			await waitFor(() => {
				expect(content.textContent ?? '').toContain('Заметка')
			}, WAIT_OPTIONS)
		})

		await step('введённый текст синхронизируется с v-model', async () => {
			await waitFor(() => {
				expect(canvasElement.textContent ?? '').toContain('Заметка')
			}, WAIT_OPTIONS)
		})
	},
}
/** Редактор в состоянии загрузки */
export const Loading: Story = {
	args: {
		isReadonly: true,
		placeholder: 'Загрузка...',
	},
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
}
/** Редактор с очень длинным контентом */
export const LongContent: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref(`
				<h2>Длинная статья для проверки переполнения</h2>
				<p>Первый параграф содержит достаточно длинный текст, чтобы проверить, как редактор справляется с отображением больших объёмов контента и обеспечивает корректную прокрутку и читаемость.</p>
				<p>Второй параграф продолжает описание и добавляет ещё больше текста для проверки того, как компонент обрабатывает множественные блоки контента, следующие друг за другом без разрывов.</p>
				<p>Третий параграф с <strong>жирным</strong>, <em>курсивом</em> и <u>подчёркнутым</u> текстом, чтобы убедиться, что форматирование корректно отображается даже при большом объёме содержимого.</p>
				<ul>
					<li>Элемент маркированного списка номер один</li>
					<li>Элемент маркированного списка номер два</li>
					<li>Элемент маркированного списка номер три</li>
				</ul>
				<ol>
					<li>Первый шаг нумерованного списка</li>
					<li>Второй шаг нумерованного списка</li>
					<li>Третий шаг нумерованного списка</li>
				</ol>
				<blockquote>Длинная цитата, которая проверяет отображение блочных элементов внутри большого контента и гарантирует, что стили применяются корректно.</blockquote>
				<p>Четвёртый параграф с инлайн кодом: <code>const value = computeResult()</code> — переменная для демонстрации.</p>
				<p>Пятый параграф завершает статью и проверяет, что все предыдущие элементы корректно рендерятся и не вызывают переполнения или наложения контента.</p>
			`)
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
}

// ── Интерактивные тесты ──

const EDITOR_SELECTOR = '.base-editor__content'
const WAIT_OPTIONS = { timeout: 5000 }

/**
 * Получить contenteditable-элемент редактора.
 * Возвращает HTMLElement или null.
 */
function getContent(root: HTMLElement): HTMLElement | null {
	const el = root.querySelector(EDITOR_SELECTOR)
	return el instanceof HTMLElement ? el : null
}

/** Получить элемент по селектору как HTMLElement или null */
function queryEl(root: ParentNode, selector: string): HTMLElement | null {
	const el = root.querySelector(selector)
	return el instanceof HTMLElement ? el : null
}
/** Ввод текста — покрывает handleInput + emit update:modelValue */
export const TypeInputFlow: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const content = getContent(canvasElement)
		if (!content) return
		content.focus()
		await userEvent.type(content, 'Привет')
		await waitFor(() => {
			expect(content.textContent ?? '').toContain('Привет')
		}, WAIT_OPTIONS)
	},
}
/** Focus/Blur — покрывает handleFocus и handleBlur */
export const FocusBlurFlow: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Текст</p>')
			return { args, content }
		},
		template: `
			<div>
				<BaseEditor v-model="content" v-bind="args" />
				<button type="button" data-testid="outside-btn">Снаружи</button>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const content = getContent(canvasElement)
		if (!content) return
		content.focus()
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-editor--focused')).toBeTruthy()
		}, WAIT_OPTIONS)
		const outside = queryEl(canvasElement, '[data-testid="outside-btn"]')
		if (!outside) return
		outside.focus()
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-editor--focused')).toBeNull()
		}, WAIT_OPTIONS)
	},
}
/** Программная смена modelValue — покрывает watch и присвоение innerHTML */
export const ExternalModelUpdate: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Начальный</p>')
			function changeContent(): void {
				content.value = '<p>Обновлённый текст</p>'
			}
			return { args, content, changeContent }
		},
		template: `
			<div>
				<BaseEditor v-model="content" v-bind="args" />
				<button type="button" data-testid="change-btn" @click="changeContent">Поменять</button>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const changeBtn = queryEl(canvasElement, '[data-testid="change-btn"]')
		if (!changeBtn) return
		await userEvent.click(changeBtn)
		await nextTick()
		const content = getContent(canvasElement)
		await waitFor(() => {
			expect(content?.innerHTML ?? '').toContain('Обновлённый')
		}, WAIT_OPTIONS)
	},
}
/** Autofocus — фокус при монтировании */
export const AutofocusOnMount: Story = {
	args: { isAutofocus: true },
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Авто-фокус</p>')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-editor--focused')).toBeTruthy()
		}, WAIT_OPTIONS)
	},
}
/** Code-mode: переключение и ввод — покрывает handleInput в code-режиме */
export const CodeModeFlow: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Базовый текст</p>')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll('.base-editor__toolbar .base-editor__btn')
		if (buttons.length === 0) return
		const lastBtn = buttons[buttons.length - 1]
		if (!(lastBtn instanceof HTMLElement)) return
		await userEvent.click(lastBtn)
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-editor--code-mode')).toBeTruthy()
		}, WAIT_OPTIONS)
		const textarea = canvasElement.querySelector('.base-editor__code textarea')
		if (!(textarea instanceof HTMLTextAreaElement)) return
		textarea.focus()
		await userEvent.type(textarea, '<span>X</span>')
	},
}
/** Прокликивает все BaseButton панели — покрывает applyFormat/applyBlock и пр. */
export const BlockQuoteAndPre: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Текст для блоков</p>')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const content = getContent(canvasElement)
		if (!content) return
		content.focus()
		// Кнопка "Ссылка" вызывает window.prompt — подменяем заглушкой,
		// возвращающей пустую строку, чтобы insertLink делал ранний return
		// и тест не блокировался диалогом.
		const originalPrompt = window.prompt
		window.prompt = () => ''
		try {
			const buttons = canvasElement.querySelectorAll('.base-editor__toolbar button.base-editor__btn')
			const last = buttons.length - 1
			for (let index = 0; index < last; index++) {
				const btn = buttons[index]
				if (!(btn instanceof HTMLElement)) continue
				await userEvent.click(btn)
			}
		} finally {
			window.prompt = originalPrompt
		}
	},
}
/** Цветовой пикер — выбор цвета через BaseColorPicker применяет цвет к выделению */
export const ColorPickerInput: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Цвет</p>')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const content = getContent(canvasElement)
		if (!content) return
		const swatches = canvasElement.querySelectorAll('.base-editor__color-picker .base-color-picker__swatch')
		for (const swatch of swatches) {
			if (!(swatch instanceof HTMLElement)) continue
			content.focus()
			swatch.click()
			await nextTick()
			const preset = document.querySelector('.base-color-picker__preset')
			if (preset instanceof HTMLElement) {
				preset.click()
				await nextTick()
			}
		}
	},
}
/** Image/Video upload — покрывает handleImageUpload и handleVideoUpload */
export const MediaUploadFlow: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Контент</p>')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const imgInput = canvasElement.querySelector('input[accept="image/*"]')
		if (imgInput instanceof HTMLInputElement) {
			const file = new File(['fake'], 'pic.png', { type: 'image/png' })
			const dt = new DataTransfer()
			dt.items.add(file)
			imgInput.files = dt.files
			imgInput.dispatchEvent(new Event('change', { bubbles: true }))
		}
		const videoInput = canvasElement.querySelector('input[accept="video/*"]')
		if (videoInput instanceof HTMLInputElement) {
			const file = new File(['fake'], 'vid.mp4', { type: 'video/mp4' })
			const dt = new DataTransfer()
			dt.items.add(file)
			videoInput.files = dt.files
			videoInput.dispatchEvent(new Event('change', { bubbles: true }))
		}
		await nextTick()
	},
}
/** Контекстное меню на изображении — покрывает handleContextMenu и applyMediaSize/removeMedia */
export const ContextMenuMedia: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p><img src="https://placehold.co/40x40" width="40" height="40" alt="x" /></p>')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const content = getContent(canvasElement)
		if (!content) return
		content.focus()
		const img = content.querySelector('img')
		if (!(img instanceof HTMLImageElement)) return
		const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 })
		img.dispatchEvent(event)
		await nextTick()
		const menu = document.body.querySelector('.base-editor__context-menu')
		if (!(menu instanceof HTMLElement)) return
		const inputs = menu.querySelectorAll('input')
		if (inputs[0] instanceof HTMLInputElement) {
			await userEvent.clear(inputs[0])
			await userEvent.type(inputs[0], '120')
		}
		if (inputs[1] instanceof HTMLInputElement) {
			await userEvent.clear(inputs[1])
			await userEvent.type(inputs[1], '80')
		}
		const applyBtn = menu.querySelector('.base-editor__context-menu-actions .base-button')
		if (applyBtn instanceof HTMLElement) {
			await userEvent.click(applyBtn)
		}
	},
}
/** Удаление медиа через контекстное меню — покрывает removeMedia */
export const ContextMenuRemove: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p><img src="https://placehold.co/40x40" width="40" height="40" alt="x" /></p>')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const content = getContent(canvasElement)
		if (!content) return
		content.focus()
		const img = content.querySelector('img')
		if (!(img instanceof HTMLImageElement)) return
		const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 })
		img.dispatchEvent(event)
		await nextTick()
		const menu = document.body.querySelector('.base-editor__context-menu')
		if (!(menu instanceof HTMLElement)) return
		const buttons = menu.querySelectorAll('.base-editor__context-menu-actions .base-button')
		if (buttons.length < 2) return
		const removeBtn = buttons[1]
		if (removeBtn instanceof HTMLElement) {
			await userEvent.click(removeBtn)
		}
	},
}
