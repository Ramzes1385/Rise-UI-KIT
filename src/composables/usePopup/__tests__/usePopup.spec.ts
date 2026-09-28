import '@testing-library/jest-dom/vitest'
import { fireEvent, render } from '@testing-library/vue'
import { defineComponent, h, nextTick, shallowRef } from 'vue'
import { usePopup } from '../usePopup'
import type { Ref } from 'vue'

/** Создать тестовый компонент с usePopup */
function createTestComponent(options: {
	isOpenRef: Ref<boolean>
	closeOnOverlay: () => boolean
	closeOnEscape: () => boolean
	onClose: () => void
	lockScroll?: () => boolean
}) {
	return defineComponent({
		setup() {
			const { handleOverlayClick } = usePopup({
				isOpen: () => options.isOpenRef.value,
				closeOnOverlay: options.closeOnOverlay,
				closeOnEscape: options.closeOnEscape,
				onClose: options.onClose,
				lockScroll: options.lockScroll,
			})
			return () => h('div', { onClick: handleOverlayClick, 'data-testid': 'overlay' })
		},
	})
}

describe('usePopup', () => {
	const onClose = vi.fn<() => void>()
	let isOpenRef: Ref<boolean>

	beforeEach(() => {
		onClose.mockClear()
		isOpenRef = shallowRef<boolean>(true)
		document.body.style.overflow = ''
		document.body.style.paddingRight = ''
	})

	describe('handleOverlayClick', () => {
		it('должен закрыть popup при клике на оверлей когда closeOnOverlay=true', async () => {
			const { getByTestId } = render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => true,
					closeOnEscape: () => false,
					onClose,
				}),
			)

			await fireEvent.click(getByTestId('overlay'))

			expect(onClose).toHaveBeenCalledTimes(1)
		})

		it('не должен закрывать popup при клике на оверлей когда closeOnOverlay=false', async () => {
			const { getByTestId } = render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => false,
					onClose,
				}),
			)

			await fireEvent.click(getByTestId('overlay'))

			expect(onClose).not.toHaveBeenCalled()
		})
	})

	describe('close', () => {
		it('должен вызвать onClose при вызове close', () => {
			let closeFn: () => void = () => {}

			const TestComponent = defineComponent({
				setup() {
					const result = usePopup({
						isOpen: () => isOpenRef.value,
						closeOnOverlay: () => false,
						closeOnEscape: () => false,
						onClose,
					})
					closeFn = result.close
					return () => h('div')
				},
			})

			render(TestComponent)
			closeFn()

			expect(onClose).toHaveBeenCalledTimes(1)
		})

		it('должен разблокировать скролл при закрытии когда lockScroll=true', async () => {
			let closeFn: () => void = () => {}

			const TestComponent = defineComponent({
				setup() {
					const result = usePopup({
						isOpen: () => isOpenRef.value,
						closeOnOverlay: () => false,
						closeOnEscape: () => false,
						// Родитель с v-model закрывает popup в ответ на onClose
						onClose: () => {
							onClose()
							isOpenRef.value = false
						},
						lockScroll: () => true,
					})
					closeFn = result.close
					return () => h('div')
				},
			})

			render(TestComponent)
			expect(document.body.style.overflow).toBe('hidden')

			closeFn()
			await nextTick()

			expect(onClose).toHaveBeenCalledTimes(1)
			expect(document.body.style.overflow).toBe('')
		})
	})

	describe('Блокировка скролла', () => {
		it('должен заблокировать скролл при открытии когда lockScroll=true', () => {
			isOpenRef.value = true

			render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => false,
					onClose,
					lockScroll: () => true,
				}),
			)

			expect(document.body.style.overflow).toBe('hidden')
		})

		it('не должен блокировать скролл когда lockScroll=false', () => {
			isOpenRef.value = true

			render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => false,
					onClose,
					lockScroll: () => false,
				}),
			)

			expect(document.body.style.overflow).toBe('')
		})

		it('должен разблокировать скролл при закрытии через watch', async () => {
			isOpenRef.value = true

			render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => false,
					onClose,
					lockScroll: () => true,
				}),
			)

			expect(document.body.style.overflow).toBe('hidden')

			isOpenRef.value = false
			await nextTick()

			expect(document.body.style.overflow).toBe('')
		})
	})

	describe('Закрытие по Escape', () => {
		it('должен закрыть popup по Escape когда closeOnEscape=true', () => {
			render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => true,
					onClose,
				}),
			)

			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

			expect(onClose).toHaveBeenCalledTimes(1)
		})

		it('не должен закрывать popup по Escape когда closeOnEscape=false', () => {
			render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => false,
					onClose,
				}),
			)

			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

			expect(onClose).not.toHaveBeenCalled()
		})

		it('не должен закрывать popup по Escape когда isOpen=false', () => {
			isOpenRef.value = false

			render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => true,
					onClose,
				}),
			)

			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

			expect(onClose).not.toHaveBeenCalled()
		})
	})

	describe('Покрытие оставшихся веток', () => {
		it('не должен разблокировать скролл при close когда lockScroll=false', () => {
			let closeFn: () => void = () => {}

			const TestComponent = defineComponent({
				setup() {
					const result = usePopup({
						isOpen: () => isOpenRef.value,
						closeOnOverlay: () => false,
						closeOnEscape: () => false,
						onClose,
						lockScroll: () => false,
					})
					closeFn = result.close
					return () => h('div')
				},
			})

			render(TestComponent)
			closeFn()

			expect(onClose).toHaveBeenCalledTimes(1)
			// При lockScroll=false скролл не должен разблокироваться в close
			expect(document.body.style.overflow).toBe('')
		})

		it('должен блокировать скролл по умолчанию когда lockScroll не передан', () => {
			isOpenRef.value = true

			render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => false,
					onClose,
					// lockScroll не передан — по умолчанию true
				}),
			)

			expect(document.body.style.overflow).toBe('hidden')
		})

		it('не должен блокировать скролл при начальном isOpen=false', () => {
			isOpenRef.value = false

			render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => false,
					onClose,
					lockScroll: () => true,
				}),
			)

			expect(document.body.style.overflow).toBe('')
		})

		it('должен разблокировать скролл при закрытии когда lockScroll не передан', async () => {
			isOpenRef.value = true

			render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => false,
					onClose,
					// lockScroll не передан — по умолчанию true
				}),
			)

			expect(document.body.style.overflow).toBe('hidden')

			isOpenRef.value = false
			await nextTick()

			expect(document.body.style.overflow).toBe('')
		})

		it('должен разблокировать скролл при unmount когда lockScroll=true', () => {
			isOpenRef.value = true

			const { unmount } = render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => false,
					onClose,
					lockScroll: () => true,
				}),
			)

			expect(document.body.style.overflow).toBe('hidden')

			unmount()

			expect(document.body.style.overflow).toBe('')
		})

		it('не должен разблокировать скролл при unmount когда lockScroll=false', () => {
			isOpenRef.value = true

			const { unmount } = render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => false,
					onClose,
					lockScroll: () => false,
				}),
			)

			// Скролл не был заблокирован (lockScroll=false)
			expect(document.body.style.overflow).toBe('')

			unmount()

			// После unmount скролл всё ещё не заблокирован
			expect(document.body.style.overflow).toBe('')
		})
	})

	describe('блокировка следует фактическому состоянию isOpen', () => {
		it('не снимает блокировку по Escape, пока родитель не закрыл popup', async () => {
			render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => true,
					onClose,
					lockScroll: () => true,
				}),
			)

			// Родитель игнорирует запрос закрытия (например, подтверждение несохранённых изменений)
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
			await nextTick()

			expect(onClose).toHaveBeenCalledTimes(1)
			expect(document.body.style.overflow).toBe('hidden')

			isOpenRef.value = false
			await nextTick()

			expect(document.body.style.overflow).toBe('')
		})

		it('снимает блокировку при закрытии, если lockScroll стал false пока popup открыт', async () => {
			const lockScrollRef = shallowRef(true)
			render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => false,
					onClose,
					lockScroll: () => lockScrollRef.value,
				}),
			)
			expect(document.body.style.overflow).toBe('hidden')

			lockScrollRef.value = false
			isOpenRef.value = false
			await nextTick()

			expect(document.body.style.overflow).toBe('')
		})

		it('снимает блокировку при размонтировании, если lockScroll стал false пока popup открыт', () => {
			const lockScrollRef = shallowRef(true)
			const { unmount } = render(
				createTestComponent({
					isOpenRef,
					closeOnOverlay: () => false,
					closeOnEscape: () => false,
					onClose,
					lockScroll: () => lockScrollRef.value,
				}),
			)
			expect(document.body.style.overflow).toBe('hidden')

			lockScrollRef.value = false
			unmount()

			expect(document.body.style.overflow).toBe('')
		})

		it('держит блокировку, пока открыт хотя бы один из двух popup (закрытие не в порядке LIFO)', async () => {
			const firstOpen = shallowRef(true)
			const secondOpen = shallowRef(true)
			render(createTestComponent({ isOpenRef: firstOpen, closeOnOverlay: () => false, closeOnEscape: () => false, onClose }))
			render(createTestComponent({ isOpenRef: secondOpen, closeOnOverlay: () => false, closeOnEscape: () => false, onClose }))

			firstOpen.value = false
			await nextTick()
			expect(document.body.style.overflow).toBe('hidden')

			secondOpen.value = false
			await nextTick()
			expect(document.body.style.overflow).toBe('')
		})
	})
})
