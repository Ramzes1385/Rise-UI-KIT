/**
 * Unit-тесты для BaseNotification.
 * Проверяют рендер контейнера, пропсы type/description/duration, emit close.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { vi } from 'vitest'
import BaseNotification from '../ui/BaseNotification.vue'

/** Получить элемент уведомления из teleport */
function getNotification() {
	return document.querySelector('.base-notification-item')
}

/** Область уведомлений — на ней пауза автозакрытия */
function getRegion() {
	return screen.getByRole('region', { name: 'Уведомления' })
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

	describe('вариант оформления', () => {
		it('проп variant задаёт класс уведомления', async () => {
			render(BaseNotification, { props: { title: 'Сохранено', variant: 'soft', duration: 0 } })

			await waitFor(() => {
				expect(getNotification()).toHaveClass('base-notification-item--soft')
			})
		})

		it('variant из add() оформляет только это уведомление, остальные берут проп компонента', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseNotification, { props: { variant: 'outline' } })

			wrapper.vm.add({ title: 'Обычное', duration: 60000 })
			wrapper.vm.add({ title: 'Мягкое', variant: 'soft', duration: 60000 })

			await waitFor(() => {
				expect(document.querySelectorAll('.base-notification-item')).toHaveLength(2)
			})
			const [soft, regular] = Array.from(document.querySelectorAll('.base-notification-item'))
			expect(soft).toHaveClass('base-notification-item--soft')
			expect(soft).not.toHaveClass('base-notification-item--outline')
			expect(regular).toHaveClass('base-notification-item--outline')
			wrapper.unmount()
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

	describe('доступность', () => {
		it('контейнер — регион «Уведомления», ошибка объявляется как alert', async () => {
			render(BaseNotification, { props: { title: 'Не удалось воспроизвести видео', type: 'error' } })

			expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось воспроизвести видео')
			expect(screen.getByRole('region', { name: 'Уведомления' })).toBeInTheDocument()
			expect(screen.queryByRole('status')).not.toBeInTheDocument()
		})

		it('остальные типы объявляются вежливо как status', async () => {
			render(BaseNotification, { props: { title: 'Сохранено', type: 'success' } })

			expect(await screen.findByRole('status')).toHaveTextContent('Сохранено')
			expect(screen.queryByRole('alert')).not.toBeInTheDocument()
		})

		it('кнопка закрытия имеет доступное имя', async () => {
			render(BaseNotification, { props: { title: 'Сохранено' } })

			expect(await screen.findByRole('button', { name: 'Закрыть' })).toBeInTheDocument()
		})
	})

	describe('длительность показа: единая семантика для таймера и прогресс-бара', () => {
		afterEach(() => {
			vi.useRealTimers()
		})

		it('duration=0 заменяется значением по умолчанию: через 100 мс уведомление на месте, через 3000 мс удалено', async () => {
			vi.useFakeTimers()
			const { emitted } = render(BaseNotification, { props: { title: 'Тест', duration: 0 } })

			await vi.advanceTimersByTimeAsync(100)
			expect(getNotification()).toBeInTheDocument()
			expect(emitted()).not.toHaveProperty('close')
			const progress = document.querySelector('.base-notification-item__progress') as HTMLElement
			expect(progress.style.animationDuration).toBe('3000ms')

			await vi.advanceTimersByTimeAsync(2900)
			expect(emitted()).toHaveProperty('close')
			await waitFor(() => {
				expect(getNotification()).not.toBeInTheDocument()
			})
		})

		it.each([Number.POSITIVE_INFINITY, -500, Number.NaN])(
			'некорректная длительность %s заменяется значением по умолчанию',
			async duration => {
				vi.useFakeTimers()
				const { emitted } = render(BaseNotification, { props: { title: 'Тест', duration } })

				await vi.advanceTimersByTimeAsync(100)
				expect(emitted()).not.toHaveProperty('close')
				expect((document.querySelector('.base-notification-item__progress') as HTMLElement).style.animationDuration).toBe(
					'3000ms',
				)

				await vi.advanceTimersByTimeAsync(2900)
				expect(emitted()).toHaveProperty('close')
			},
		)

		it('add() без своей длительности берёт duration компонента', async () => {
			vi.useFakeTimers()
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseNotification, { props: { duration: 5000 } })
			wrapper.vm.add({ title: 'Без своей длительности' })
			await vi.advanceTimersByTimeAsync(0)

			expect((document.querySelector('.base-notification-item__progress') as HTMLElement).style.animationDuration).toBe('5000ms')
			await vi.advanceTimersByTimeAsync(4999)
			expect(getNotification()).toBeInTheDocument()
			await vi.advanceTimersByTimeAsync(1)
			expect(wrapper.emitted().close).toHaveLength(1)
			wrapper.unmount()
		})

		it('длительность больше предела setTimeout ограничивается им, а не срабатывает сразу', async () => {
			vi.useFakeTimers()
			const { emitted } = render(BaseNotification, { props: { title: 'Надолго', duration: 1e12 } })

			await vi.advanceTimersByTimeAsync(1000)
			expect(emitted()).not.toHaveProperty('close')
			expect((document.querySelector('.base-notification-item__progress') as HTMLElement).style.animationDuration).toBe('2147483647ms')
		})

		it('положительная длительность одинаково задаёт таймер и прогресс-бар', async () => {
			vi.useFakeTimers()
			const { emitted } = render(BaseNotification, { props: { title: 'Тест', duration: 5000 } })

			await vi.advanceTimersByTimeAsync(100)
			expect((document.querySelector('.base-notification-item__progress') as HTMLElement).style.animationDuration).toBe(
				'5000ms',
			)
			await vi.advanceTimersByTimeAsync(4800)
			expect(emitted()).not.toHaveProperty('close')
			await vi.advanceTimersByTimeAsync(100)
			expect(emitted()).toHaveProperty('close')
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
			// Телепортированный контейнер не должен оставаться в body для следующих тестов
			wrapper.unmount()
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
			wrapper.unmount()
		})
	})

	describe('управляемый список items', () => {
		afterEach(() => {
			vi.useRealTimers()
		})

		it('показывает только items, а закрытие отдаёт родителю событием remove', async () => {
			const { emitted } = render(BaseNotification, {
				props: { title: 'Не показывается', items: [{ id: 'saved', title: 'Сохранено' }] },
			})

			expect(document.querySelectorAll('.base-notification-item')).toHaveLength(1)
			await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))

			expect(emitted().remove).toEqual([['saved']])
			expect(emitted().close).toBeUndefined()
			// Список ведёт родитель: пока он не убрал уведомление, оно на месте
			expect(screen.getByRole('status')).toHaveTextContent('Сохранено')
		})

		it('смена длительности перезапускает таймер, а убранное родителем уведомление таймер не держит', async () => {
			vi.useFakeTimers()
			const { emitted, rerender } = render(BaseNotification, {
				props: {
					items: [
						{ id: 'a', title: 'A', duration: 1000 },
						{ id: 'b', title: 'B', duration: 1000 },
					],
				},
			})

			await vi.advanceTimersByTimeAsync(800)
			await rerender({ items: [{ id: 'a', title: 'A', duration: 2000 }] })
			await vi.advanceTimersByTimeAsync(1999)
			expect(emitted().remove).toBeUndefined()

			await vi.advanceTimersByTimeAsync(1)
			expect(emitted().remove).toEqual([['a']])
		})

		it('постоянное уведомление без прогресса и автозакрытия; снятие флага запускает таймер', async () => {
			vi.useFakeTimers()
			const { emitted, rerender } = render(BaseNotification, {
				props: { items: [{ id: 'upload', title: 'Загрузка…', isPersistent: true }] },
			})

			expect(document.querySelector('.base-notification-item__progress')).not.toBeInTheDocument()
			await vi.advanceTimersByTimeAsync(60000)
			expect(emitted().remove).toBeUndefined()

			await rerender({ items: [{ id: 'upload', title: 'Загружено', type: 'success', duration: 1000 }] })
			expect(document.querySelector('.base-notification-item__progress')).toBeInTheDocument()
			await vi.advanceTimersByTimeAsync(1000)
			expect(emitted().remove).toEqual([['upload']])
		})
	})

	describe('действия', () => {
		it('кнопка действия вызывает onClick и закрывает уведомление', async () => {
			const onUndo = vi.fn()
			const { emitted } = render(BaseNotification, {
				props: {
					items: [{ id: 7, title: 'Файл удалён', actions: [{ label: 'Отменить', onClick: onUndo }, { label: 'Скрыть' }] }],
					customClass: { actions: 'custom-actions' },
				},
			})

			expect(document.querySelector('.base-notification-item__actions')).toHaveClass('custom-actions')
			await fireEvent.click(screen.getByRole('button', { name: 'Отменить' }))
			expect(onUndo).toHaveBeenCalledOnce()
			expect(emitted().remove).toEqual([[7]])

			await fireEvent.click(screen.getByRole('button', { name: 'Скрыть' }))
			expect(emitted().remove).toEqual([[7], [7]])
		})

		it('без действий блок кнопок не рендерится', async () => {
			render(BaseNotification, { props: { items: [{ id: 1, title: 'Сохранено', actions: [] }] } })

			expect(document.querySelector('.base-notification-item__actions')).not.toBeInTheDocument()
		})
	})

	describe('пауза автозакрытия (WCAG 2.2.1)', () => {
		afterEach(() => {
			vi.useRealTimers()
		})

		it('пока указатель над уведомлениями, таймер стоит, после ухода досчитывает остаток', async () => {
			vi.useFakeTimers()
			const { emitted, rerender } = render(BaseNotification, { props: { items: [{ id: 'a', title: 'A', duration: 3000 }] } })

			await vi.advanceTimersByTimeAsync(1000)
			await fireEvent.mouseEnter(getRegion())
			expect(getRegion()).toHaveClass('base-notification--paused')
			// Пришедшее во время паузы уведомление тоже ждёт
			await rerender({
				items: [
					{ id: 'b', title: 'B', duration: 500 },
					{ id: 'a', title: 'A', duration: 3000 },
				],
			})
			await vi.advanceTimersByTimeAsync(10000)
			expect(emitted().remove).toBeUndefined()

			await fireEvent.mouseLeave(getRegion())
			expect(getRegion()).not.toHaveClass('base-notification--paused')
			await vi.advanceTimersByTimeAsync(500)
			expect(emitted().remove).toEqual([['b']])
			await vi.advanceTimersByTimeAsync(1499)
			expect(emitted().remove).toEqual([['b']])
			await vi.advanceTimersByTimeAsync(1)
			expect(emitted().remove).toEqual([['b'], ['a']])
		})

		it('пока фокус внутри, таймер стоит; переход между кнопками паузу не снимает', async () => {
			vi.useFakeTimers()
			const { emitted } = render(BaseNotification, {
				props: { items: [{ id: 'a', title: 'A', duration: 3000, actions: [{ label: 'Повторить' }] }] },
			})
			const action = screen.getByRole('button', { name: 'Повторить' })
			const close = screen.getByRole('button', { name: 'Закрыть' })

			await fireEvent.focusIn(action)
			await fireEvent.focusOut(action, { relatedTarget: close })
			await vi.advanceTimersByTimeAsync(5000)
			expect(emitted().remove).toBeUndefined()

			await fireEvent.focusOut(close, { relatedTarget: document.body })
			await vi.advanceTimersByTimeAsync(3000)
			expect(emitted().remove).toEqual([['a']])
		})

		it('после того как список опустел, новые уведомления не стартуют на паузе', async () => {
			vi.useFakeTimers()
			const { emitted, rerender } = render(BaseNotification, { props: { items: [{ id: 'a', title: 'A' }] } })

			await fireEvent.mouseEnter(getRegion())
			await fireEvent.focusIn(screen.getByRole('button', { name: 'Закрыть' }))
			await rerender({ items: [] })
			await rerender({ items: [{ id: 'b', title: 'B', duration: 1000 }] })

			expect(getRegion()).not.toHaveClass('base-notification--paused')
			await vi.advanceTimersByTimeAsync(1000)
			expect(emitted().remove).toEqual([['b']])
		})

		it('закрыли уведомление с фокусом — пауза снимается, фокус на соседнем — остаётся', async () => {
			vi.useFakeTimers()
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseNotification)
			const firstId = wrapper.vm.add({ title: 'Первое', duration: 1000 })
			wrapper.vm.add({ title: 'Второе', duration: 1000 })
			wrapper.vm.add({ title: 'Третье', duration: 1000 })
			await vi.advanceTimersByTimeAsync(0)
			expect(firstId).toBe(0)

			// Список: Третье, Второе, Первое. Фокус на «Первом», закрываем «Третье» — фокус внутри, пауза остаётся
			const [third, , first] = Array.from(document.querySelectorAll<HTMLElement>('.base-notification-item__close'))
			first.focus()
			await fireEvent.focusIn(first)
			await fireEvent.click(third)
			await vi.advanceTimersByTimeAsync(5000)
			expect(document.querySelectorAll('.base-notification-item')).toHaveLength(2)

			// Закрываем «Первое» с фокусом: кнопка исчезла без focusout — пауза снимается
			await fireEvent.click(first)
			await vi.advanceTimersByTimeAsync(0)
			expect(getRegion()).not.toHaveClass('base-notification--paused')
			await vi.advanceTimersByTimeAsync(1000)
			expect(document.querySelectorAll('.base-notification-item')).toHaveLength(0)
			expect(wrapper.emitted().close).toHaveLength(1)
			wrapper.unmount()
		})

		it('постоянное уведомление из add() не закрывается само', async () => {
			vi.useFakeTimers()
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseNotification)
			wrapper.vm.add({ title: 'Нет сети', type: 'warning', isPersistent: true })

			await vi.advanceTimersByTimeAsync(60000)
			expect(getNotification()).toBeInTheDocument()
			expect(document.querySelector('.base-notification-item__progress')).not.toBeInTheDocument()
			wrapper.unmount()
		})
	})
})
