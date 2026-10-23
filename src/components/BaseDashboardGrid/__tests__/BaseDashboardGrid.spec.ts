import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { setLocale } from '@/locales/state'
import { createUiKitPlugin } from '@/plugin'
import { render, screen } from '@testing-library/vue'
import BaseDashboardGrid from '../ui/BaseDashboardGrid.vue'
import type { DashboardLayoutItem } from '../types/BaseDashboardGrid.types'
import { GRID_PROPS, makeLayout, mockGridWidth } from './dashboardGrid.test-utils'

const itemOf = (container: Element, id: string): HTMLElement => container.querySelector(`[data-item-id="${id}"]`) as HTMLElement

describe('BaseDashboardGrid unit', () => {
	beforeEach(() => mockGridWidth(400))
	afterEach(() => {
		vi.restoreAllMocks()
		setLocale('ru')
	})

	describe('разметка и геометрия', () => {
		it('кладёт виджеты по клеткам через transform и считает высоту сетки', async () => {
			const { container } = render(BaseDashboardGrid, { props: { ...GRID_PROPS, layout: makeLayout() } })
			await nextTick()

			expect(itemOf(container, 'a').style.transform).toBe('translate3d(0px, 0px, 0)')
			expect(itemOf(container, 'a').style.width).toBe('200px')
			expect(itemOf(container, 'b').style.transform).toBe('translate3d(200px, 0px, 0)')
			expect(screen.getByRole('group', { name: 'Сетка виджетов' })).toHaveStyle({ height: '200px' })
		})

		it('помечает виджеты первой строки: над сеткой зона ручки не нужна', async () => {
			const layout: DashboardLayoutItem[] = [...makeLayout(), { id: 'c', x: 0, y: 2, w: 1, h: 1 }]
			const { container } = render(BaseDashboardGrid, { props: { ...GRID_PROPS, layout } })
			await nextTick()

			expect(itemOf(container, 'a')).toHaveClass('base-dashboard-grid__item--first-row')
			expect(itemOf(container, 'b')).toHaveClass('base-dashboard-grid__item--first-row')
			expect(itemOf(container, 'c')).not.toHaveClass('base-dashboard-grid__item--first-row')
		})

		it('учитывает промежуток и sizeScale', async () => {
			const { container } = render(BaseDashboardGrid, {
				props: {
					cols: 2,
					gap: 20,
					rowHeight: 50,
					sizeScale: 200,
					compactType: 'none',
					layout: [{ id: 'a', x: 1, y: 1, w: 1, h: 1 }],
				},
			})

			await nextTick()
			expect(itemOf(container, 'a').style.transform).toBe('translate3d(220px, 140px, 0)')
			expect(itemOf(container, 'a').style.width).toBe('180px')
			expect((container.querySelector('.base-dashboard-grid') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('2')
		})

		it('слот item получает виджет, по умолчанию показывает название или id', () => {
			const layout: DashboardLayoutItem[] = [...makeLayout(), { id: 'c', x: 0, y: 2, w: 1, h: 1 }]
			render(BaseDashboardGrid, {
				props: { ...GRID_PROPS, layout },
				slots: {
					item: '<template #item="{ item, isDragging, isGrabbed }">{{ item.id }}:{{ isDragging }}:{{ isGrabbed }}</template>',
				},
			})

			expect(screen.getByText('a:false:false')).toBeInTheDocument()
			expect(screen.getByText('c:false:false')).toBeInTheDocument()
		})

		it('без слота item выводит label, а без label — id', () => {
			render(BaseDashboardGrid, { props: { ...GRID_PROPS, layout: [...makeLayout(), { id: 'c', x: 0, y: 2, w: 1, h: 1 }] } })

			expect(screen.getByText('Выручка')).toBeInTheDocument()
			expect(screen.getByText('c')).toBeInTheDocument()
		})

		it('называет виджеты: label или «Виджет N»', () => {
			const layout: DashboardLayoutItem[] = [
				{ id: 'a', x: 0, y: 0, w: 1, h: 1, label: 'Выручка' },
				{ id: 'c', x: 1, y: 0, w: 1, h: 1 },
			]
			render(BaseDashboardGrid, { props: { ...GRID_PROPS, layout } })

			expect(screen.getByRole('group', { name: 'Выручка' })).toBeInTheDocument()
			expect(screen.getByRole('group', { name: 'Виджет 2' })).toBeInTheDocument()
		})

		it('имя сетки: label или значение из словаря на текущем языке', async () => {
			setLocale('en')
			const { rerender } = render(BaseDashboardGrid, { props: { layout: [] } })
			expect(screen.getByRole('group', { name: 'Widget grid' })).toBeInTheDocument()

			await rerender({ layout: [], ariaLabel: 'Показатели' })
			expect(screen.getByRole('group', { name: 'Показатели' })).toBeInTheDocument()
		})
	})

	describe('раскладка', () => {
		it('исправляет пересечения и выход за сетку на экране, ничего не отправляя', async () => {
			const layout: DashboardLayoutItem[] = [
				{ id: 'a', x: 0, y: 0, w: 9, h: 1 },
				{ id: 'b', x: 1, y: 0, w: 2, h: 1 },
			]
			const { container, emitted } = render(BaseDashboardGrid, { props: { ...GRID_PROPS, layout } })
			await nextTick()

			expect(itemOf(container, 'a').style.width).toBe('400px')
			expect(itemOf(container, 'b').style.transform).toBe('translate3d(100px, 100px, 0)')
			expect(emitted()).toEqual({})
		})

		it('повторяющийся id пропускает с предупреждением', () => {
			const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
			const { container } = render(BaseDashboardGrid, { props: { ...GRID_PROPS, layout: [...makeLayout(), ...makeLayout()] } })

			expect(container.querySelectorAll('[data-item-id]')).toHaveLength(2)
			expect(spy).toHaveBeenCalled()
		})

		it('обновляется при замене layout и compactType', async () => {
			const { container, rerender } = render(BaseDashboardGrid, {
				props: { ...GRID_PROPS, layout: [{ id: 'a', x: 0, y: 3, w: 1, h: 1 }] },
			})
			expect(itemOf(container, 'a').style.transform).toBe('translate3d(0px, 0px, 0)')

			await rerender({ compactType: 'none' })
			expect(itemOf(container, 'a').style.transform).toBe('translate3d(0px, 300px, 0)')

			await rerender({ layout: [{ id: 'z', x: 1, y: 0, w: 1, h: 1 }] })
			expect(itemOf(container, 'z')).not.toBeNull()
			expect(container.querySelector('[data-item-id="a"]')).toBeNull()
		})

		it('без layout и layouts показывает пустое состояние', () => {
			render(BaseDashboardGrid)

			expect(screen.getByText('Нет виджетов')).toBeInTheDocument()
		})

		it('слот empty заменяет пустое состояние; у корня нет фиксированной высоты', () => {
			const { container } = render(BaseDashboardGrid, { props: { layout: [] }, slots: { empty: '<p>Добавьте виджет</p>' } })

			expect(screen.getByText('Добавьте виджет')).toBeInTheDocument()
			expect(screen.queryByText('Нет виджетов')).not.toBeInTheDocument()
			expect(container.querySelector('.base-dashboard-grid')).toHaveClass('base-dashboard-grid--empty')
			expect((container.querySelector('.base-dashboard-grid') as HTMLElement).style.height).toBe('')
		})
	})

	describe('режимы', () => {
		it('без isEditable виджеты не фокусируются и без ручек', () => {
			const { container } = render(BaseDashboardGrid, { props: { ...GRID_PROPS, layout: makeLayout() } })

			expect(itemOf(container, 'a')).not.toHaveAttribute('tabindex')
			expect(container.querySelector('[data-handle]')).toBeNull()
			expect(container.querySelector('[data-resize]')).toBeNull()
			expect(container.querySelector('.base-dashboard-grid__hint')).toBeNull()
		})

		it('в режиме редактирования: tabindex, ручки, подсказка и связь через aria-describedby', () => {
			const { container } = render(BaseDashboardGrid, { props: { ...GRID_PROPS, isEditable: true, layout: makeLayout() } })

			expect(itemOf(container, 'a')).toHaveAttribute('tabindex', '0')
			expect(container.querySelectorAll('[data-handle]')).toHaveLength(2)
			expect(container.querySelectorAll('[data-resize]')).toHaveLength(2)
			expect(screen.getByRole('group', { name: 'Выручка' })).toHaveAccessibleDescription(/Enter или пробел — взять виджет/)
		})

		it('закреплённый виджет не фокусируется и без ручек', () => {
			const layout: DashboardLayoutItem[] = [{ id: 's', x: 0, y: 0, w: 2, h: 1, isStatic: true }]
			const { container } = render(BaseDashboardGrid, { props: { ...GRID_PROPS, isEditable: true, layout } })

			expect(itemOf(container, 's')).not.toHaveAttribute('tabindex')
			expect(itemOf(container, 's')).toHaveClass('base-dashboard-grid__item--static')
			expect(container.querySelector('[data-handle]')).toBeNull()
		})

		it('isDisabled отключает редактирование и помечает сетку', () => {
			const { container } = render(BaseDashboardGrid, {
				props: { ...GRID_PROPS, isEditable: true, isDisabled: true, layout: makeLayout() },
			})

			expect(itemOf(container, 'a')).not.toHaveAttribute('tabindex')
			expect(container.querySelector('.base-dashboard-grid')).toHaveAttribute('aria-disabled', 'true')
			expect(container.querySelector('.base-dashboard-grid')).toHaveClass('base-dashboard-grid--disabled')
		})

		it('слот handle заменяет значок ручки', () => {
			render(BaseDashboardGrid, {
				props: { ...GRID_PROPS, isEditable: true, layout: [makeLayout()[0]] },
				slots: { handle: '<template #handle="{ item }">Ручка {{ item.id }}</template>' },
			})

			expect(screen.getByText('Ручка a')).toBeInTheDocument()
		})
	})

	describe('оформление', () => {
		it('вариант, ui и customClass попадают на части', () => {
			const { container } = render(BaseDashboardGrid, {
				props: {
					...GRID_PROPS,
					variant: 'soft',
					layout: makeLayout(),
					ui: { root: 'own-root', item: 'own-item' },
					customClass: { root: 'class-root', item: 'class-item', body: 'class-body' },
				},
			})

			expect(container.querySelector('.base-dashboard-grid')).toHaveClass('base-dashboard-grid--soft', 'own-root', 'class-root')
			expect(itemOf(container, 'a')).toHaveClass('own-item', 'class-item')
			expect(container.querySelector('.base-dashboard-grid__body')).toHaveClass('class-body')
		})

		it('значения по умолчанию берутся из настроек плагина', () => {
			const { container } = render(BaseDashboardGrid, {
				props: { layout: [{ id: 'a', x: 0, y: 1, w: 1, h: 1 }] },
				global: {
					plugins: [createUiKitPlugin({ defaults: { BaseDashboardGrid: { compactType: 'none', rowHeight: 10, gap: 0 } } })],
				},
			})

			expect(itemOf(container, 'a').style.transform).toBe('translate3d(0px, 10px, 0)')
		})

		it('настройка ui из плагина склеивается с ui экземпляра', () => {
			const { container } = render(BaseDashboardGrid, {
				props: { layout: [], ui: { root: 'own-root' } },
				global: { plugins: [createUiKitPlugin({ defaults: { BaseDashboardGrid: { ui: { root: 'app-root' } } } })] },
			})

			expect(container.querySelector('.base-dashboard-grid')).toHaveClass('app-root', 'own-root')
		})
	})

	describe('измерение ширины', () => {
		const NativeObserver = globalThis.ResizeObserver
		afterEach(() => {
			globalThis.ResizeObserver = NativeObserver
		})

		it('следит за шириной и отключает наблюдатель при размонтировании', async () => {
			const callbacks: Array<() => void> = []
			const disconnect = vi.fn()
			globalThis.ResizeObserver = class {
				constructor(callback: () => void) {
					callbacks.push(callback)
				}
				observe = vi.fn()
				unobserve = vi.fn()
				disconnect = disconnect
			} as unknown as typeof ResizeObserver
			const { container, unmount } = render(BaseDashboardGrid, { props: { ...GRID_PROPS, layout: makeLayout() } })
			await nextTick()
			expect(itemOf(container, 'b').style.width).toBe('200px')

			vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(800)
			callbacks[0]()
			await nextTick()
			expect(itemOf(container, 'b').style.width).toBe('400px')

			unmount()
			expect(disconnect).toHaveBeenCalled()
		})
	})

	describe('прокручиваемое тело виджета', () => {
		afterEach(() => {
			vi.restoreAllMocks()
		})

		it('получает tabindex 0 только когда содержимое не помещается', async () => {
			vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(500)
			vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(100)
			const { container } = render(BaseDashboardGrid, { props: { ...GRID_PROPS, layout: makeLayout() } })
			await nextTick()
			await nextTick()
			expect(container.querySelector('.base-dashboard-grid__body')).toHaveAttribute('tabindex', '0')
		})

		it('без переполнения tabindex нет', async () => {
			const { container } = render(BaseDashboardGrid, { props: { ...GRID_PROPS, layout: makeLayout() } })
			await nextTick()
			expect(container.querySelector('.base-dashboard-grid__body')).not.toHaveAttribute('tabindex')
		})
	})
})
