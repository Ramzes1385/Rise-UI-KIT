/// <reference types="vitest/globals" />
/** Jest-dom матчеры подключаются в каждом тест-файле отдельно (import '@testing-library/jest-dom/vitest'), а не здесь. */

import { cleanup } from '@testing-library/vue'
import { en } from '@/locales/en'
import { registerLocale, setLocale } from '@/locales/state'

/**
 * Тест без предупреждений и ошибок в консоли: неожиданный `console.warn` или `console.error` — в том числе `[Vue warn]`,
 * предупреждения кита `warn()` и сообщения jsdom («Not implemented: …», «Could not parse CSS») — валит тест.
 * Ожидаемое предупреждение тест перехватывает шпионом и проверяет:
 * `const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)` + `expect(warn).toHaveBeenCalledWith(…)`.
 * Пока на консоли стоит шпион, сторож молчит: вызов уже записан шпионом.
 */
const GUARDED_CONSOLE = ['warn', 'error'] as const
const unexpectedConsole: string[] = []

/** Шум сторонних библиотек, которые от кита не зависят: исключение — с причиной */
const IGNORED_CONSOLE = [
	// Компилятор шаблонов Vue в Node предупреждает о параметре браузерной сборки; историям нужен рантайм-компилятор
	'decodeEntities option is passed but will be ignored in non-browser builds',
]

function formatConsole(args: readonly unknown[]): string {
	return args.map(arg => (arg instanceof Error ? (arg.stack ?? arg.message) : String(arg))).join(' ')
}

for (const method of GUARDED_CONSOLE) {
	const original = console[method].bind(console)
	const guard = (...args: unknown[]): void => {
		if (console[method] !== guard) return
		const text = formatConsole(args)
		if (IGNORED_CONSOLE.some(ignored => text.includes(ignored))) return
		unexpectedConsole.push(`console.${method}: ${text}`)
		original(...args)
	}
	console[method] = guard
}

function assertNoConsole(): void {
	if (!unexpectedConsole.length) return
	const messages = unexpectedConsole.splice(0)
	throw new Error(
		`Тест вывел в консоль ${messages.length} сообщ.: устраните причину или перехватите ожидаемое шпионом vi.spyOn(console, '…').\n${messages.join('\n')}`,
	)
}

/**
 * Ошибки jsdom («Not implemented: …», «Could not parse CSS stylesheet») по умолчанию идут в консоль Node мимо теста:
 * без имени теста и мимо сторожа. Направляем их в `console.error` теста.
 */
const jsdomConsole = (
	globalThis as {
		jsdom?: { virtualConsole: { removeAllListeners(event: string): void; on(event: string, listener: (error: Error) => void): void } }
	}
).jsdom?.virtualConsole
jsdomConsole?.removeAllListeners('jsdomError')
jsdomConsole?.on('jsdomError', error => console.error(`jsdom: ${error.message}`))

/** Английский словарь подключён, как в приложении с `createUiKitPlugin`: тесты переключают язык через `setLocale('en')` */
registerLocale(en)

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
	vi.clearAllMocks()
	// Язык кита — глобальный: тест, переключивший его, не должен менять язык следующих
	setLocale('ru')
	assertNoConsole()
})

/** Сообщения после конца теста (отложенная навигация jsdom, таймеры) валят файл */
afterAll(() => {
	assertNoConsole()
})

/** Мок ResizeObserver — отсутствует в jsdom, нужен для BaseSlider, BaseTree и др. */
globalThis.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

/**
 * Мок getBoundingClientRect — отсутствует в jsdom.
 * По умолчанию возвращает ненулевой размер, чтобы интеракционные story-тесты
 * (рейтинг, range и др.) корректно рассчитывали позицию указателя.
 * Тесты, которым нужна нулевая геометрия, переопределяют значение на элементе.
 */
Element.prototype.getBoundingClientRect = function getBoundingClientRect(this: Element): DOMRect {
	const width = this instanceof HTMLElement ? this.offsetWidth || 100 : 100
	const height = this instanceof HTMLElement ? this.offsetHeight || 20 : 20
	return {
		width,
		height,
		top: 0,
		left: 0,
		bottom: height,
		right: width,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	}
}

/** Мок scrollIntoView — отсутствует в jsdom, используется в Chat/Editor/Tour */
Element.prototype.scrollIntoView = vi.fn()

/** Мок window.open — отсутствует в jsdom */
globalThis.window.open = vi.fn()

/** Мок window.prompt — отсутствует в jsdom, нужен для Storybook тестов */
globalThis.window.prompt = vi.fn(() => null)

/** Мок window.confirm — отсутствует в jsdom */
globalThis.window.confirm = vi.fn(() => true)

/**
 * Мок execCommand — отсутствует в jsdom, нужен для BaseEditor. `insertText` в сфокусированном поле ввода ведёт себя
 * как в браузере: заменяет выделение и шлёт `input` (так режим кода редактора пишет в нативную историю поля).
 */
Object.defineProperty(document, 'execCommand', {
	configurable: true,
	value: vi.fn((command: string, _showUi?: boolean, value?: string) => {
		const field = document.activeElement
		if (command === 'insertText' && (field instanceof HTMLTextAreaElement || field instanceof HTMLInputElement)) {
			field.setRangeText(String(value), field.selectionStart ?? 0, field.selectionEnd ?? 0, 'end')
			field.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }))
		}
		return true
	}),
})

/** Мок DataTransfer — отсутствует в jsdom, нужен для FileUpload/Editor/Pin story-тестов */
interface FileListLike {
	length: number
	item(index: number): File | null
	[index: number]: File
}

class MockDataTransferItem {
	kind: 'file' | 'string' = 'file'
	type: string
	file: File | null

	constructor(data: File | string, type?: string) {
		if (data instanceof File) {
			this.kind = 'file'
			this.type = data.type
			this.file = data
		} else {
			this.kind = 'string'
			this.type = type ?? 'text/plain'
			this.file = null
		}
	}

	getAsFile(): File | null {
		return this.file
	}

	/* istanbul ignore next -- string items не используются в story-тестах */
	getAsString(callback: (data: string) => void): void {
		callback('')
	}
}

class MockDataTransfer {
	private itemsList: MockDataTransferItem[] = []
	private strings: Map<string, string> = new Map()

	/** Список элементов: в геттере length `this` — сам объект, поэтому экземпляр берётся из замыкания */
	readonly items = (() => {
		const owner = this
		return {
			add: (data: File | string, type?: string): MockDataTransferItem => {
				const item = new MockDataTransferItem(data, type)
				owner.itemsList.push(item)
				return item
			},
			clear: (): void => {
				owner.itemsList = []
			},
			get length(): number {
				return owner.itemsList.length
			},
		}
	})()

	get files(): FileListLike {
		const fileItems = this.itemsList.filter(item => item.kind === 'file' && item.file)
		const files = fileItems.map(item => item.file!)
		const list: FileListLike = {
			...files,
			length: files.length,
			item: (index: number) => files[index] ?? null,
		}
		return list
	}

	getData(format: string): string {
		return this.strings.get(format) ?? ''
	}

	setData(format: string, data: string): void {
		this.strings.set(format, data)
	}

	clearData(format?: string): void {
		if (format) {
			this.strings.delete(format)
		} else {
			this.strings.clear()
			this.itemsList = []
		}
	}
}

interface DataTransferConstructor {
	new (): DataTransfer
}
globalThis.DataTransfer = MockDataTransfer as unknown as DataTransferConstructor

/** Мок PointerEvent — jsdom требует view Window, ломает userEvent */
interface MockPointerEventInit extends PointerEventInit {
	view?: Window
}

function omitNullView<T extends EventInit>(init: T): T {
	const safe = { ...init }
	if ('view' in safe && safe.view == null) {
		delete safe.view
	}
	return safe
}

globalThis.PointerEvent = class MockPointerEvent extends MouseEvent {
	pointerId: number
	pointerType: string
	width: number
	height: number
	isPrimary: boolean

	constructor(type: string, init: MockPointerEventInit = {}) {
		super(type, omitNullView(init))
		this.pointerId = init.pointerId ?? 0
		this.pointerType = init.pointerType ?? 'mouse'
		this.width = init.width ?? 1
		this.height = init.height ?? 1
		this.isPrimary = init.isPrimary ?? true
	}
} as unknown as typeof PointerEvent

/** Мок DragEvent — отсутствует в jsdom, нужен для FileUpload story-тестов */
interface MockDragEventInit extends DragEventInit {
	view?: Window
	dataTransfer?: DataTransfer | null
}

globalThis.DragEvent = class MockDragEvent extends MouseEvent {
	dataTransfer: DataTransfer | null

	constructor(type: string, init: MockDragEventInit = {}) {
		super(type, omitNullView(init))
		this.dataTransfer = init.dataTransfer ?? null
	}
} as unknown as typeof DragEvent

/** Мок HTMLInputElement.files setter — принимает file-like список из mocked DataTransfer */
const originalFilesDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'files')
Object.defineProperty(HTMLInputElement.prototype, 'files', {
	configurable: true,
	get() {
		return originalFilesDescriptor?.get?.call(this)
	},
	set(value: unknown) {
		const looksLikeFileList =
			value !== null && typeof value === 'object' && 'length' in value && typeof (value as { length: unknown }).length === 'number'

		if (looksLikeFileList) {
			Object.defineProperty(this, 'files', {
				value,
				configurable: true,
				writable: true,
			})
		} else {
			originalFilesDescriptor?.set?.call(this, value as FileList | null)
		}
	},
})

/** Мок Touch — отсутствует в jsdom, нужен для BaseRange/BaseSlider story-тестов */
interface MockTouchInit {
	identifier?: number
	target: EventTarget
	clientX?: number
	clientY?: number
	screenX?: number
	screenY?: number
	pageX?: number
	pageY?: number
	radiusX?: number
	radiusY?: number
	rotationAngle?: number
	force?: number
}
globalThis.Touch = class MockTouch implements Touch {
	identifier: number
	target: EventTarget
	clientX: number
	clientY: number
	screenX: number
	screenY: number
	pageX: number
	pageY: number
	radiusX: number
	radiusY: number
	rotationAngle: number
	force: number

	constructor(init: MockTouchInit) {
		this.identifier = init.identifier ?? 0
		this.target = init.target
		this.clientX = init.clientX ?? 0
		this.clientY = init.clientY ?? 0
		this.screenX = init.screenX ?? 0
		this.screenY = init.screenY ?? 0
		this.pageX = init.pageX ?? 0
		this.pageY = init.pageY ?? 0
		this.radiusX = init.radiusX ?? 0
		this.radiusY = init.radiusY ?? 0
		this.rotationAngle = init.rotationAngle ?? 0
		this.force = init.force ?? 0
	}
}

/** Мок ClipboardEvent — отсутствует в jsdom, нужен для BasePin story-тестов */
interface MockClipboardEventInit extends EventInit {
	clipboardData?: DataTransfer
}
globalThis.ClipboardEvent = class MockClipboardEvent extends Event implements ClipboardEvent {
	clipboardData: DataTransfer | null

	constructor(type: string, init?: MockClipboardEventInit) {
		super(type, init)
		this.clipboardData = init?.clipboardData ?? null
	}
} as unknown as typeof ClipboardEvent

/** Мок scrollHeight для textarea — в jsdom всегда 0, ломает autosize story */
Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
	configurable: true,
	get(this: HTMLTextAreaElement): number {
		const lines = Math.max(1, this.value?.split('\n').length ?? 1)
		return lines * 20
	},
})
