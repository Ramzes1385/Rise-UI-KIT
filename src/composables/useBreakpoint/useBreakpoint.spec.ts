import '@testing-library/jest-dom/vitest'

import { render } from '@testing-library/vue'
import { defineComponent, h, nextTick } from 'vue'

import { getViewportWidth, useBreakpoint } from './useBreakpoint'
import { BREAKPOINTS } from './useBreakpoint.types'
import type { UseBreakpointReturn } from './useBreakpoint.types'

function mountComposable(): { api: UseBreakpointReturn; unmount: () => void } {
	let api!: UseBreakpointReturn
	const TestComponent = defineComponent({
		setup() {
			api = useBreakpoint()
			return () => h('div')
		},
	})
	const { unmount } = render(TestComponent)

	return { api, unmount }
}

function setViewportWidth(width: number): void {
	Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true })
	window.dispatchEvent(new Event('resize'))
}

describe('useBreakpoint', () => {
	afterEach(() => {
		setViewportWidth(1024)
	})

	it('определяет начальную ширину из window.innerWidth', () => {
		setViewportWidth(800)
		const { api } = mountComposable()
		expect(api.width.value).toBe(800)
	})

	it('реагирует на событие resize', async () => {
		setViewportWidth(1024)
		const { api } = mountComposable()

		setViewportWidth(500)
		await nextTick()
		expect(api.width.value).toBe(500)
	})

	it('вычисляет наибольший активный брейкпоинт', () => {
		setViewportWidth(800)
		const { api } = mountComposable()
		expect(api.current.value).toBe('md')
	})

	it('возвращает xs для очень узкого экрана', () => {
		setViewportWidth(320)
		const { api } = mountComposable()
		expect(api.current.value).toBe('xs')
	})

	it('isMobile=true когда ширина меньше md', () => {
		setViewportWidth(640)
		const { api } = mountComposable()
		expect(api.isMobile.value).toBe(true)
	})

	it('isMobile=false когда ширина >= md', () => {
		setViewportWidth(768)
		const { api } = mountComposable()
		expect(api.isMobile.value).toBe(false)
	})

	it('isGreaterOrEqual сравнивает с границей брейкпоинта', () => {
		setViewportWidth(1024)
		const { api } = mountComposable()
		expect(api.isGreaterOrEqual('lg')).toBe(true)
		expect(api.isGreaterOrEqual('xl')).toBe(false)
	})

	it('isSmallerThan сравнивает с границей брейкпоинта', () => {
		setViewportWidth(500)
		const { api } = mountComposable()
		expect(api.isSmallerThan('md')).toBe(true)
		expect(api.isSmallerThan('sm')).toBe(false)
	})

	it('снимает слушатель resize при размонтировании', () => {
		const removeSpy = vi.spyOn(window, 'removeEventListener')
		const { unmount } = mountComposable()
		unmount()
		expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
		removeSpy.mockRestore()
	})

	it('отдаёт дефолтную ширину lg при отсутствии window (SSR)', () => {
		vi.stubGlobal('window', undefined)
		try {
			expect(getViewportWidth()).toBe(BREAKPOINTS.lg)
		} finally {
			vi.unstubAllGlobals()
		}
	})
})
