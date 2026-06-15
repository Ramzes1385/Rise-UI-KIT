/// <reference types="vitest/globals" />
/**
 * Глобальная настройка Vitest.
 * Очистка DOM и восстановление моков после каждого теста.
 * Матчеры jest-dom подключаются в каждом тест-файле индивидуально
 * через import '@testing-library/jest-dom/vitest'.
 */

import { cleanup } from '@testing-library/vue'

// Подавление неинформативных логов и предупреждений в консоли тестов
const originalLog = console.log
console.log = (...args: unknown[]) => {
	if (typeof args[0] === 'string' && args[0].includes('storybookTest transform')) return
	originalLog(...args)
}

const originalWarn = console.warn
console.warn = (...args: unknown[]) => {
	if (
		typeof args[0] === 'string' &&
		args[0].includes('decodeEntities option is passed but will be ignored in non-browser builds')
	) {
		return
	}
	originalWarn(...args)
}

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
	vi.clearAllMocks()
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

/** Мок execCommand — отсутствует в jsdom, нужен для BaseEditor */
Object.defineProperty(document, 'execCommand', {
	configurable: true,
	value: vi.fn(() => true),
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

	readonly items = {
		add: (data: File | string, type?: string): MockDataTransferItem => {
			const item = new MockDataTransferItem(data, type)
			this.itemsList.push(item)
			return item
		},
		clear: (): void => {
			this.itemsList = []
		},
		get length(): number {
			return this.itemsList.length
		},
	}

	get files(): FileListLike {
		const fileItems = this.itemsList.filter(item => item.kind === 'file' && item.file)
		const files = fileItems.map(item => item.file!)
		const list: FileListLike = {
			length: files.length,
			item: (index: number) => files[index] ?? null,
			...files,
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
}

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
}

/** Мок HTMLInputElement.files setter — принимает file-like список из mocked DataTransfer */
const originalFilesDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'files')
Object.defineProperty(HTMLInputElement.prototype, 'files', {
	configurable: true,
	get() {
		return originalFilesDescriptor?.get?.call(this)
	},
	set(value: unknown) {
		const looksLikeFileList =
			value !== null &&
			typeof value === 'object' &&
			'length' in value &&
			typeof (value as { length: unknown }).length === 'number'

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
}

/** Мок scrollHeight для textarea — в jsdom всегда 0, ломает autosize story */
Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
	configurable: true,
	get(this: HTMLTextAreaElement): number {
		const lines = Math.max(1, (this.value?.split('\n').length ?? 1))
		return lines * 20
	},
})
