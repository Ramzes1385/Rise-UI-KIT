/**
 * Unit-тесты для useDropdownPosition.
 * Проверяют позиционирование выпадающей панели.
 */

import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'

import { useDropdownPosition } from './useDropdownPosition'

/** Обёртка для вызова composable внутри Vue-контекста */
function withSetup<T>(composable: () => T): T {
	let result: T
	mount({
		setup() {
			result = composable()
			return () => null
		},
	})
	return result!
}

/** Обёртка с доступом к wrapper для unmount */
function withSetupFull<T>(composable: () => T): { result: T; wrapper: ReturnType<typeof mount> } {
	let result: T
	const wrapper = mount({
		setup() {
			result = composable()
			return () => null
		},
	})
	return { result: result!, wrapper }
}

/** Создать мок-элемент с getBoundingClientRect */
function createMockElement(rect: DOMRect): HTMLElement {
	const el = document.createElement('div')
	el.getBoundingClientRect = () => rect
	return el
}

/** Создать мок DOMRect */
function createRect(options: Partial<DOMRect> = {}): DOMRect {
	return {
		x: 0,
		y: 0,
		width: 200,
		height: 40,
		top: 100,
		right: 200,
		bottom: 140,
		left: 0,
		...options,
	} as DOMRect
}

describe('useDropdownPosition', () => {
	it('должен возвращать panelStyle и updatePosition', () => {
		const wrapperRef = ref<HTMLElement | null>(document.createElement('div'))
		const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

		const { panelStyle, updatePosition } = withSetup(() =>
			useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => 'bottom-start',
				gap: () => 8,
				matchWidth: () => false,
				maxHeight: () => '300px',
				isOpen: () => false,
			}),
		)

		expect(panelStyle).toBeDefined()
		expect(updatePosition).toBeTypeOf('function')
	})

	it('должен позиционировать bottom-start', () => {
		const triggerRect = createRect({ top: 100, bottom: 140, left: 50 })
		const wrapper = document.createElement('div')
		const trigger = createMockElement(triggerRect)
		wrapper.appendChild(trigger)
		const wrapperRef = ref<HTMLElement | null>(wrapper)
		const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

		const { panelStyle, updatePosition } = withSetup(() =>
			useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => 'bottom-start',
				gap: () => 8,
				matchWidth: () => false,
				maxHeight: () => '300px',
				isOpen: () => true,
			}),
		)

		updatePosition()
		const style = panelStyle.value
		expect(style.top).toBe('148px')
		expect(style.left).toBe('50px')
	})

	it('должен позиционировать top-start', () => {
		const triggerRect = createRect({ top: 200, bottom: 240, left: 50 })
		const wrapper = document.createElement('div')
		const trigger = createMockElement(triggerRect)
		wrapper.appendChild(trigger)
		const wrapperRef = ref<HTMLElement | null>(wrapper)
		const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

		const { panelStyle, updatePosition } = withSetup(() =>
			useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => 'top-start',
				gap: () => 8,
				matchWidth: () => false,
				maxHeight: () => '300px',
				isOpen: () => true,
			}),
		)

		updatePosition()
		const style = panelStyle.value
		expect(style.bottom).toBeDefined()
		expect(style.left).toBe('50px')
	})

	it('должен применять matchWidth', () => {
		const triggerRect = createRect({ width: 250 })
		const wrapper = document.createElement('div')
		const trigger = createMockElement(triggerRect)
		wrapper.appendChild(trigger)
		const wrapperRef = ref<HTMLElement | null>(wrapper)
		const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

		const { panelStyle, updatePosition } = withSetup(() =>
			useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => 'bottom-start',
				gap: () => 8,
				matchWidth: () => true,
				maxHeight: () => '300px',
				isOpen: () => true,
			}),
		)

		updatePosition()
		expect(panelStyle.value.width).toBe('250px')
	})

	it('не должен обновлять позицию когда isOpen=false', () => {
		const wrapperRef = ref<HTMLElement | null>(document.createElement('div'))
		const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

		const { panelStyle, updatePosition } = withSetup(() =>
			useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => 'bottom-start',
				gap: () => 8,
				matchWidth: () => false,
				maxHeight: () => '300px',
				isOpen: () => false,
			}),
		)

		updatePosition()
		expect(panelStyle.value.top).toBe('0px')
	})

	it('должен учитывать gap при позиционировании', () => {
		const triggerRect = createRect({ top: 100, bottom: 140, left: 0 })
		const wrapper = document.createElement('div')
		const trigger = createMockElement(triggerRect)
		wrapper.appendChild(trigger)
		const wrapperRef = ref<HTMLElement | null>(wrapper)
		const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

		const { panelStyle, updatePosition } = withSetup(() =>
			useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => 'bottom-start',
				gap: () => 16,
				matchWidth: () => false,
				maxHeight: () => '300px',
				isOpen: () => true,
			}),
		)

		updatePosition()
		expect(panelStyle.value.top).toBe('156px')
	})

	describe('позиции bottom', () => {
		it('должен позиционировать bottom-end', () => {
			const triggerRect = createRect({ top: 100, bottom: 140, left: 50, right: 250 })
			const wrapper = document.createElement('div')
			const trigger = createMockElement(triggerRect)
			wrapper.appendChild(trigger)
			const wrapperRef = ref<HTMLElement | null>(wrapper)
			const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

			const { panelStyle, updatePosition } = withSetup(() =>
				useDropdownPosition({
					wrapperRef,
					dropdownRef,
					position: () => 'bottom-end',
					gap: () => 8,
					matchWidth: () => false,
					maxHeight: () => '300px',
					isOpen: () => true,
				}),
			)

			updatePosition()
			expect(panelStyle.value.top).toBe('148px')
			expect(panelStyle.value.right).toBeDefined()
		})

		it('должен позиционировать bottom (по центру)', () => {
			const triggerRect = createRect({ top: 100, bottom: 140, left: 50, width: 200 })
			const wrapper = document.createElement('div')
			const trigger = createMockElement(triggerRect)
			wrapper.appendChild(trigger)
			const wrapperRef = ref<HTMLElement | null>(wrapper)
			const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

			const { panelStyle, updatePosition } = withSetup(() =>
				useDropdownPosition({
					wrapperRef,
					dropdownRef,
					position: () => 'bottom',
					gap: () => 8,
					matchWidth: () => false,
					maxHeight: () => '300px',
					isOpen: () => true,
				}),
			)

			updatePosition()
			expect(panelStyle.value.top).toBe('148px')
			expect(panelStyle.value.left).toBe('150px')
			expect(panelStyle.value.translate).toBe('-50% 0')
		})
	})

	describe('позиции top', () => {
		it('должен позиционировать top-end', () => {
			const triggerRect = createRect({ top: 200, bottom: 240, left: 50, right: 250 })
			const wrapper = document.createElement('div')
			const trigger = createMockElement(triggerRect)
			wrapper.appendChild(trigger)
			const wrapperRef = ref<HTMLElement | null>(wrapper)
			const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

			const { panelStyle, updatePosition } = withSetup(() =>
				useDropdownPosition({
					wrapperRef,
					dropdownRef,
					position: () => 'top-end',
					gap: () => 8,
					matchWidth: () => false,
					maxHeight: () => '300px',
					isOpen: () => true,
				}),
			)

			updatePosition()
			expect(panelStyle.value.bottom).toBeDefined()
			expect(panelStyle.value.right).toBeDefined()
		})

		it('должен позиционировать top (по центру)', () => {
			const triggerRect = createRect({ top: 200, bottom: 240, left: 50, width: 200 })
			const wrapper = document.createElement('div')
			const trigger = createMockElement(triggerRect)
			wrapper.appendChild(trigger)
			const wrapperRef = ref<HTMLElement | null>(wrapper)
			const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

			const { panelStyle, updatePosition } = withSetup(() =>
				useDropdownPosition({
					wrapperRef,
					dropdownRef,
					position: () => 'top',
					gap: () => 8,
					matchWidth: () => false,
					maxHeight: () => '300px',
					isOpen: () => true,
				}),
			)

			updatePosition()
			expect(panelStyle.value.bottom).toBeDefined()
			expect(panelStyle.value.left).toBe('150px')
			expect(panelStyle.value.translate).toBe('-50% 0')
		})
	})

	describe('позиции left', () => {
		it('должен позиционировать left-start', () => {
			const triggerRect = createRect({ top: 100, bottom: 140, left: 200 })
			const wrapper = document.createElement('div')
			const trigger = createMockElement(triggerRect)
			wrapper.appendChild(trigger)
			const wrapperRef = ref<HTMLElement | null>(wrapper)
			const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

			const { panelStyle, updatePosition } = withSetup(() =>
				useDropdownPosition({
					wrapperRef,
					dropdownRef,
					position: () => 'left-start',
					gap: () => 8,
					matchWidth: () => false,
					maxHeight: () => '300px',
					isOpen: () => true,
				}),
			)

			updatePosition()
			expect(panelStyle.value.top).toBe('100px')
			expect(panelStyle.value.right).toBeDefined()
		})

		it('должен позиционировать left-end', () => {
			const triggerRect = createRect({ top: 100, bottom: 140, left: 200 })
			const wrapper = document.createElement('div')
			const trigger = createMockElement(triggerRect)
			wrapper.appendChild(trigger)
			const wrapperRef = ref<HTMLElement | null>(wrapper)
			const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

			const { panelStyle, updatePosition } = withSetup(() =>
				useDropdownPosition({
					wrapperRef,
					dropdownRef,
					position: () => 'left-end',
					gap: () => 8,
					matchWidth: () => false,
					maxHeight: () => '300px',
					isOpen: () => true,
				}),
			)

			updatePosition()
			expect(panelStyle.value.bottom).toBeDefined()
			expect(panelStyle.value.right).toBeDefined()
		})

		it('должен позиционировать left (по центру)', () => {
			const triggerRect = createRect({ top: 100, bottom: 140, left: 200, height: 40 })
			const wrapper = document.createElement('div')
			const trigger = createMockElement(triggerRect)
			wrapper.appendChild(trigger)
			const wrapperRef = ref<HTMLElement | null>(wrapper)
			const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

			const { panelStyle, updatePosition } = withSetup(() =>
				useDropdownPosition({
					wrapperRef,
					dropdownRef,
					position: () => 'left',
					gap: () => 8,
					matchWidth: () => false,
					maxHeight: () => '300px',
					isOpen: () => true,
				}),
			)

			updatePosition()
			expect(panelStyle.value.top).toBe('120px')
			expect(panelStyle.value.right).toBeDefined()
			expect(panelStyle.value.translate).toBe('0 -50%')
		})
	})

	describe('позиции right', () => {
		it('должен позиционировать right-start', () => {
			const triggerRect = createRect({ top: 100, bottom: 140, left: 0, right: 200 })
			const wrapper = document.createElement('div')
			const trigger = createMockElement(triggerRect)
			wrapper.appendChild(trigger)
			const wrapperRef = ref<HTMLElement | null>(wrapper)
			const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

			const { panelStyle, updatePosition } = withSetup(() =>
				useDropdownPosition({
					wrapperRef,
					dropdownRef,
					position: () => 'right-start',
					gap: () => 8,
					matchWidth: () => false,
					maxHeight: () => '300px',
					isOpen: () => true,
				}),
			)

			updatePosition()
			expect(panelStyle.value.top).toBe('100px')
			expect(panelStyle.value.left).toBe('208px')
		})

		it('должен позиционировать right-end', () => {
			const triggerRect = createRect({ top: 100, bottom: 140, left: 0, right: 200 })
			const wrapper = document.createElement('div')
			const trigger = createMockElement(triggerRect)
			wrapper.appendChild(trigger)
			const wrapperRef = ref<HTMLElement | null>(wrapper)
			const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

			const { panelStyle, updatePosition } = withSetup(() =>
				useDropdownPosition({
					wrapperRef,
					dropdownRef,
					position: () => 'right-end',
					gap: () => 8,
					matchWidth: () => false,
					maxHeight: () => '300px',
					isOpen: () => true,
				}),
			)

			updatePosition()
			expect(panelStyle.value.bottom).toBeDefined()
			expect(panelStyle.value.left).toBe('208px')
		})

		it('должен позиционировать right (по центру)', () => {
			const triggerRect = createRect({ top: 100, bottom: 140, left: 0, right: 200, height: 40 })
			const wrapper = document.createElement('div')
			const trigger = createMockElement(triggerRect)
			wrapper.appendChild(trigger)
			const wrapperRef = ref<HTMLElement | null>(wrapper)
			const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

			const { panelStyle, updatePosition } = withSetup(() =>
				useDropdownPosition({
					wrapperRef,
					dropdownRef,
					position: () => 'right',
					gap: () => 8,
					matchWidth: () => false,
					maxHeight: () => '300px',
					isOpen: () => true,
				}),
			)

			updatePosition()
			expect(panelStyle.value.top).toBe('120px')
			expect(panelStyle.value.left).toBe('208px')
			expect(panelStyle.value.translate).toBe('0 -50%')
		})
	})

	it('должен обновлять позицию при открытии через watch', async () => {
		const isOpen = ref(false)
		const triggerRect = createRect({ top: 100, bottom: 140, left: 50 })
		const wrapper = document.createElement('div')
		const trigger = createMockElement(triggerRect)
		wrapper.appendChild(trigger)
		const wrapperRef = ref<HTMLElement | null>(wrapper)
		const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

		const { panelStyle } = withSetup(() =>
			useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => 'bottom-start',
				gap: () => 8,
				matchWidth: () => false,
				maxHeight: () => '300px',
				isOpen: () => isOpen.value,
			}),
		)

		expect(panelStyle.value.top).toBe('0px')

		isOpen.value = true
		await nextTick()
		expect(panelStyle.value.top).toBe('148px')

		isOpen.value = false
		await nextTick()
		// Не должно меняться
		expect(panelStyle.value.top).toBe('148px')
	})

	it('должен пересчитывать позицию при изменении gap', async () => {
		const gap = ref(8)
		const triggerRect = createRect({ top: 100, bottom: 140, left: 50 })
		const wrapper = document.createElement('div')
		const trigger = createMockElement(triggerRect)
		wrapper.appendChild(trigger)
		const wrapperRef = ref<HTMLElement | null>(wrapper)
		const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

		const { panelStyle } = withSetup(() =>
			useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => 'bottom-start',
				gap: () => gap.value,
				matchWidth: () => false,
				maxHeight: () => '300px',
				isOpen: () => true,
			}),
		)

		expect(panelStyle.value.top).toBe('148px')

		gap.value = 16
		await nextTick()
		expect(panelStyle.value.top).toBe('156px')
	})

	it('watch gap не вызывает updatePosition если isOpen=false', async () => {
		const gap = ref(8)
		const wrapperRef = ref<HTMLElement | null>(document.createElement('div'))
		const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

		const { panelStyle } = withSetup(() =>
			useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => 'bottom-start',
				gap: () => gap.value,
				matchWidth: () => false,
				maxHeight: () => '300px',
				isOpen: () => false,
			}),
		)

		gap.value = 16
		await nextTick()
		expect(panelStyle.value.top).toBe('0px')
	})

	it('должен обновлять позицию при скролле когда isOpen=true', () => {
		const triggerRect = createRect({ top: 100, bottom: 140, left: 50 })
		const wrapper = document.createElement('div')
		const trigger = createMockElement(triggerRect)
		wrapper.appendChild(trigger)
		const wrapperRef = ref<HTMLElement | null>(wrapper)
		const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

		const { panelStyle } = withSetup(() =>
			useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => 'bottom-start',
				gap: () => 8,
				matchWidth: () => false,
				maxHeight: () => '300px',
				isOpen: () => true,
			}),
		)

		window.dispatchEvent(new Event('scroll', { bubbles: true }))
		expect(panelStyle.value.top).toBe('148px')
	})

	it('должен устанавливать начальную позицию при монтировании если isOpen=true', () => {
		const triggerRect = createRect({ top: 100, bottom: 140, left: 50 })
		const wrapper = document.createElement('div')
		const trigger = createMockElement(triggerRect)
		wrapper.appendChild(trigger)
		const wrapperRef = ref<HTMLElement | null>(wrapper)
		const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

		const { panelStyle } = withSetup(() =>
			useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => 'bottom-start',
				gap: () => 8,
				matchWidth: () => false,
				maxHeight: () => '300px',
				isOpen: () => true,
			}),
		)

		expect(panelStyle.value.top).toBe('148px')
	})

	it('должен удалять слушатели при размонтировании', () => {
		const removeSpy = vi.spyOn(window, 'removeEventListener')
		const wrapperRef = ref<HTMLElement | null>(document.createElement('div'))
		const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

		const { wrapper } = withSetupFull(() =>
			useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => 'bottom-start',
				gap: () => 8,
				matchWidth: () => false,
				maxHeight: () => '300px',
				isOpen: () => false,
			}),
		)

		wrapper.unmount()
		expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true)
		expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
		removeSpy.mockRestore()
	})

	it('должен возвращать null если wrapperRef не установлен', () => {
		const wrapperRef = ref<HTMLElement | null>(null)
		const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

		const { updatePosition, coords } = withSetup(() =>
			useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => 'bottom-start',
				gap: () => 8,
				matchWidth: () => false,
				maxHeight: () => '300px',
				isOpen: () => true,
			}),
		)

		updatePosition()
		expect(coords.value.top).toBe(0)
	})

	it('должен использовать getBoundingClientRect самого wrapperRef если нет дочерних элементов', () => {
		const wrapper = document.createElement('div')
		const rect = createRect({ top: 100, bottom: 140, left: 50 })
		wrapper.getBoundingClientRect = () => rect
		const wrapperRef = ref<HTMLElement | null>(wrapper)
		const dropdownRef = ref<HTMLElement | null>(document.createElement('div'))

		const { updatePosition, panelStyle } = withSetup(() =>
			useDropdownPosition({
				wrapperRef,
				dropdownRef,
				position: () => 'bottom-start',
				gap: () => 8,
				matchWidth: () => false,
				maxHeight: () => '300px',
				isOpen: () => true,
			}),
		)

		updatePosition()
		expect(panelStyle.value.top).toBe('148px')
	})
})
