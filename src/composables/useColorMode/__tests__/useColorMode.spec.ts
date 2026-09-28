import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import { defineComponent, h, nextTick } from 'vue'
import { COLOR_MODE_STORAGE_KEY, createColorMode } from '../useColorMode'
import type { ColorModeInstance } from '../useColorMode.types'

/** Поддельный MediaQueryList: jsdom не реализует matchMedia */
function mockSystemTheme(isDark: boolean) {
	const listeners = new Set<(event: MediaQueryListEvent) => void>()
	const query = {
		matches: isDark,
		addEventListener: vi.fn((_: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener)),
		removeEventListener: vi.fn((_: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener)),
	}
	vi.stubGlobal('matchMedia', vi.fn(() => query))
	return {
		query,
		change(matches: boolean) {
			listeners.forEach(listener => listener({ matches } as MediaQueryListEvent))
		},
	}
}

function dispatchStorage(key: string, newValue: string | null): void {
	window.dispatchEvent(new StorageEvent('storage', { key, newValue }))
}

let instance: ColorModeInstance | null = null

afterEach(() => {
	// Сначала вернуть window и localStorage: тест SSR подменяет их на undefined
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
	instance?.stop()
	instance = null
	localStorage.clear()
	document.documentElement.removeAttribute('data-theme')
})

describe('createColorMode', () => {
	it('по умолчанию режим system: data-theme="system", светлая тема без matchMedia', () => {
		instance = createColorMode()

		expect(instance.mode.value).toBe('system')
		expect(instance.resolvedMode.value).toBe('light')
		expect(instance.isDark.value).toBe(false)
		expect(document.documentElement).toHaveAttribute('data-theme', 'system')
	})

	it('в режиме system следует за темой системы', () => {
		const system = mockSystemTheme(true)
		instance = createColorMode()
		expect(instance.resolvedMode.value).toBe('dark')

		system.change(false)
		expect(instance.resolvedMode.value).toBe('light')
		expect(system.query.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
	})

	it('берёт сохранённый выбор, неизвестное значение пропускает', () => {
		localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'dark')
		instance = createColorMode()
		expect(instance.mode.value).toBe('dark')
		instance.stop()

		localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'sepia')
		instance = createColorMode({ initialMode: 'light' })
		expect(instance.mode.value).toBe('light')
	})

	it('смена режима ставит data-theme и сохраняет выбор', async () => {
		instance = createColorMode()
		instance.mode.value = 'dark'
		await nextTick()

		expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
		expect(localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe('dark')
		expect(instance.isDark.value).toBe(true)
	})

	it('storageKey: false — выбор не читается и не сохраняется', async () => {
		localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'dark')
		instance = createColorMode({ storageKey: false })
		expect(instance.mode.value).toBe('system')

		instance.mode.value = 'light'
		await nextTick()
		expect(localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe('dark')
		dispatchStorage(COLOR_MODE_STORAGE_KEY, 'dark')
		expect(instance.mode.value).toBe('light')
	})

	it('toggle переключает светлую и тёмную; из system — на противоположную текущей', () => {
		mockSystemTheme(true)
		instance = createColorMode()

		instance.toggle()
		expect(instance.mode.value).toBe('light')
		instance.toggle()
		expect(instance.mode.value).toBe('dark')
	})

	it('подхватывает выбор из другой вкладки', () => {
		instance = createColorMode({ storageKey: 'app-theme' })

		dispatchStorage('app-theme', 'dark')
		expect(instance.mode.value).toBe('dark')
		dispatchStorage('other-key', 'light')
		dispatchStorage('app-theme', 'sepia')
		expect(instance.mode.value).toBe('dark')
	})

	it('target — тема для части интерфейса', async () => {
		const panel = document.createElement('section')
		instance = createColorMode({ target: () => panel, storageKey: false, initialMode: 'dark' })

		expect(panel).toHaveAttribute('data-theme', 'dark')
		expect(document.documentElement).not.toHaveAttribute('data-theme')
		instance.mode.value = 'light'
		await nextTick()
		expect(panel).toHaveAttribute('data-theme', 'light')
	})

	it('stop снимает подписки: система, другие вкладки и смена режима больше не действуют', async () => {
		const system = mockSystemTheme(false)
		instance = createColorMode()
		instance.stop()

		system.change(true)
		dispatchStorage(COLOR_MODE_STORAGE_KEY, 'dark')
		expect(instance.resolvedMode.value).toBe('light')
		instance.mode.value = 'dark'
		await nextTick()
		expect(document.documentElement).toHaveAttribute('data-theme', 'system')
		expect(system.query.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
	})

	it('недоступный localStorage не ломает тему', async () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('SecurityError')
		})
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('QuotaExceededError')
		})
		instance = createColorMode()
		expect(instance.mode.value).toBe('system')

		instance.mode.value = 'dark'
		await nextTick()
		expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
	})

	it('без window и localStorage (SSR) работает с режимом по умолчанию', async () => {
		vi.stubGlobal('window', undefined)
		vi.stubGlobal('localStorage', undefined)
		instance = createColorMode({ initialMode: 'dark' })

		expect(instance.resolvedMode.value).toBe('dark')
		instance.mode.value = 'light'
		await nextTick()
		expect(instance.resolvedMode.value).toBe('light')
	})
})

describe('useColorMode', () => {
	it('возвращает одно управление на всё приложение и переживает размонтирование компонента', async () => {
		vi.resetModules()
		const { useColorMode } = await import('../useColorMode')
		let fromComponent!: ReturnType<typeof useColorMode>
		const { unmount } = render(
			defineComponent({
				setup() {
					fromComponent = useColorMode({ storageKey: 'shared-theme' })
					return () => h('div')
				},
			}),
		)
		unmount()

		const again = useColorMode({ storageKey: 'ignored' })
		expect(again).toBe(fromComponent)
		again.mode.value = 'dark'
		await nextTick()
		expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
		expect(localStorage.getItem('shared-theme')).toBe('dark')
	})
})
