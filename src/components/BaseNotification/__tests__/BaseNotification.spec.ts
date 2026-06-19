/**
 * Unit-тесты для BaseNotification.
 * Проверяют рендер контейнера, пропсы type/description/duration, emit close.
 */

import '@testing-library/jest-dom/vitest'
import { render, waitFor } from '@testing-library/vue'
import { vi } from 'vitest'
import BaseNotification from '../ui/BaseNotification.vue'

/** Получить элемент уведомления из teleport */
function getNotification() {
	return document.querySelector('.base-notification-item')
}

describe('BaseNotification unit', () => {
	describe('рендер', () => {
		it('должен рендерить контейнер уведомлений', () => {
			render(BaseNotification)

			expect(document.querySelector('.base-notification')).toBeInTheDocument()
		})

		it('должен рендерить контейнер с title', async () => {
			render(BaseNotification, { props: { title: 'Тест', duration: 0 } })

			await waitFor(() => {
				expect(getNotification()).toBeInTheDocument()
			})
		})
	})

	describe('пропс type', () => {
		it('должен применять класс base-notification-item--info по умолчанию', async () => {
			render(BaseNotification, { props: { title: 'Тест', duration: 0 } })

			await waitFor(() => {
				expect(getNotification()).toHaveClass('base-notification-item--info')
			})
		})

		it('должен применять класс base-notification-item--success', async () => {
			render(BaseNotification, { props: { title: 'Успех', type: 'success', duration: 0 } })

			await waitFor(() => {
				expect(getNotification()).toHaveClass('base-notification-item--success')
			})
		})

		it('должен применять класс base-notification-item--error', async () => {
			render(BaseNotification, { props: { title: 'Ошибка', type: 'error', duration: 0 } })

			await waitFor(() => {
				expect(getNotification()).toHaveClass('base-notification-item--error')
			})
		})

		it('должен применять класс base-notification-item--warning', async () => {
			render(BaseNotification, { props: { title: 'Внимание', type: 'warning', duration: 0 } })

			await waitFor(() => {
				expect(getNotification()).toHaveClass('base-notification-item--warning')
			})
		})
	})

	describe('пропс description', () => {
		it('должен рендерить описание когда передано', async () => {
			render(BaseNotification, { props: { title: 'Тест', description: 'Подробности', duration: 0 } })

			await waitFor(() => {
				const desc = document.querySelector('.base-notification-item__description')
				expect(desc).toBeInTheDocument()
				expect(desc).toHaveTextContent('Подробности')
			})
		})

		it('не должен рендерить описание когда не передано', async () => {
			render(BaseNotification, { props: { title: 'Тест', duration: 0 } })

			await waitFor(() => {
				expect(getNotification()).toBeInTheDocument()
			})

			expect(document.querySelector('.base-notification-item__description')).not.toBeInTheDocument()
		})
	})

	describe('пропс duration', () => {
		it('должен рендерить прогресс-бар при duration=0 (fallback на 3000ms)', async () => {
			render(BaseNotification, { props: { title: 'Тест', duration: 0 } })

			await waitFor(() => {
				expect(getNotification()).toBeInTheDocument()
			})

			const progress = document.querySelector('.base-notification-item__progress') as HTMLElement
			expect(progress).toBeInTheDocument()
			// 0 || 3000 = 3000ms
			expect(progress.style.animationDuration).toBe('3000ms')
		})

		it('должен рендерить прогресс-бар при duration>0', async () => {
			render(BaseNotification, { props: { title: 'Тест', duration: 5000 } })

			await waitFor(() => {
				expect(document.querySelector('.base-notification-item__progress')).toBeInTheDocument()
			})
		})

		it('должен автоматически удалить уведомление после duration', async () => {
			vi.useFakeTimers()
			render(BaseNotification, { props: { title: 'Тест', duration: 2000 } })

			await waitFor(() => {
				expect(getNotification()).toBeInTheDocument()
			})

			vi.advanceTimersByTime(2000)

			await waitFor(() => {
				expect(getNotification()).not.toBeInTheDocument()
			})

			vi.useRealTimers()
		})
	})

	describe('emit close', () => {
		it('должен эмитить close когда последнее уведомление удалено', async () => {
			vi.useFakeTimers()
			const { emitted } = render(BaseNotification, { props: { title: 'Тест', duration: 0 } })

			await waitFor(() => {
				expect(getNotification()).toBeInTheDocument()
			})

			const closeBtn = document.querySelector('.base-notification-item__close') as HTMLElement
			closeBtn.click()

			await vi.advanceTimersByTimeAsync(0)

			await waitFor(() => {
				expect(emitted()).toHaveProperty('close')
			})

			vi.useRealTimers()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу (контейнеру)', () => {
			render(BaseNotification, {
				props: {
					customClass: 'custom-container-class',
				},
			})

			expect(document.querySelector('.base-notification')).toHaveClass('custom-container-class')
		})

		it('должен распределять объект классов по внутренним элементам', async () => {
			render(BaseNotification, {
				props: {
					title: 'Тест',
					description: 'Описание',
					duration: 0,
					customClass: {
						root: 'custom-container',
						notification: 'custom-notification',
						icon: 'custom-icon',
						content: 'custom-content',
						title: 'custom-title',
						description: 'custom-description',
						close: 'custom-close',
						progress: 'custom-progress',
					},
				},
			})

			await waitFor(() => {
				expect(document.querySelector('.base-notification')).toHaveClass('custom-container')
				expect(document.querySelector('.base-notification-item')).toHaveClass('custom-notification')
				expect(document.querySelector('.base-notification-item__icon')).toHaveClass('custom-icon')
				expect(document.querySelector('.base-notification-item__content')).toHaveClass('custom-content')
				expect(document.querySelector('.base-notification-item__title')).toHaveClass('custom-title')
				expect(document.querySelector('.base-notification-item__description')).toHaveClass('custom-description')
				expect(document.querySelector('.base-notification-item__close')).toHaveClass('custom-close')
				expect(document.querySelector('.base-notification-item__progress')).toHaveClass('custom-progress')
			})
		})
	})

	describe('дополнительное покрытие ветвей', () => {
		it('должен использовать тип info по умолчанию если тип уведомления не задан', async () => {
			const { container } = render(BaseNotification, {
				props: {
					title: 'Тест без типа',
					type: undefined,
					duration: 0,
				},
			})

			await waitFor(() => {
				expect(getNotification()).toBeInTheDocument()
			})

			expect(getNotification()).toHaveClass('base-notification-item--info')
		})

		it('не должен эмитить close при удалении уведомления, если в списке еще остаются другие уведомления', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseNotification, {
				props: {
					title: 'Первое',
					duration: 0,
				},
			})

			await waitFor(() => {
				expect(document.querySelector('.base-notification-item')).toBeInTheDocument()
			})

			// Добавляем второе уведомление через метод add
			wrapper.vm.add({ title: 'Второе', duration: 0 })

			await waitFor(() => {
				const notifications = document.querySelectorAll('.base-notification-item')
				expect(notifications.length).toBe(2)
			})

			// Удаляем первое уведомление
			const closeButtons = document.querySelectorAll('.base-notification-item__close')
			const firstCloseBtn = closeButtons[0] as HTMLElement
			firstCloseBtn.click()

			await waitFor(() => {
				const notifications = document.querySelectorAll('.base-notification-item')
				expect(notifications.length).toBe(1)
			})

			expect(wrapper.emitted()).not.toHaveProperty('close')
		})

		it('должен корректно отрабатывать remove для id без активного таймера', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseNotification, {
				props: {
					title: 'Тест',
					duration: 0,
				},
			})

			await waitFor(() => {
				expect(document.querySelector('.base-notification-item')).toBeInTheDocument()
			})

			expect(() => wrapper.vm.remove(999)).not.toThrow()
			expect(document.querySelector('.base-notification-item')).toBeInTheDocument()
		})
	})
})
