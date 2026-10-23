import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseImageMap from '../ui/BaseImageMap.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { objectElement, SIMPLE_DATA } from './imageMap.test-utils'
import { IMAGE_MAP_FLOORS, IMAGE_MAP_HOTSPOTS } from '../stories/fixtures'
import type { ImageMapData, ImageMapObject } from '../types/imageMapData.types'

const data = IMAGE_MAP_HOTSPOTS

function withObjects(objects: ImageMapObject[], extra: Partial<ImageMapData> = {}): ImageMapData {
	return { ...SIMPLE_DATA, objects, ...extra }
}

describe('BaseImageMap unit', () => {
	it('рендерит объекты кнопками с именами', () => {
		render(BaseImageMap, { props: { data } })
		expect(screen.getByRole('button', { name: 'Вершина' })).toBeInTheDocument()
	})

	it('эмитит select по клику', async () => {
		const { emitted } = render(BaseImageMap, { props: { data, defaultAction: 'none' } })
		await fireEvent.click(screen.getByRole('button', { name: 'Вершина' }))
		expect(emitted()).toHaveProperty('select')
	})

	it('недоступный объект помечен aria-disabled', () => {
		render(BaseImageMap, { props: { data } })
		expect(screen.getByRole('button', { name: 'Закрытая трасса' })).toHaveAttribute('aria-disabled', 'true')
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseImageMap, { props: { data, variant: 'outline' } })
		expect(container.querySelector('.base-image-map')).toHaveClass('base-image-map--outline')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseImageMap, { props: { data, sizeScale: 125 } })
		expect((container.querySelector('.base-image-map') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к частям карты', () => {
		const customClass = {
			root: 'my-root',
			toolbar: 'my-toolbar',
			zoom: 'my-zoom',
			viewport: 'my-viewport',
			stage: 'my-stage',
			object: 'my-object',
			point: 'my-point',
		}
		const { container } = render(BaseImageMap, { props: { data, customClass } })
		expect(container.querySelector('.base-image-map')).toHaveClass('my-root')
		expect(container.querySelector('.base-image-map__toolbar')).toHaveClass('my-toolbar')
		expect(container.querySelector('.base-image-map__zoom')).toHaveClass('my-zoom')
		expect(container.querySelector('.base-image-map__viewport')).toHaveClass('my-viewport')
		expect(container.querySelector('.base-image-map__stage')).toHaveClass('my-stage')
		expect(objectElement(container, 'lake')).toHaveClass('my-object')
		expect(objectElement(container, 'peak')).toHaveClass('my-object', 'my-point')
	})
})

describe('BaseImageMap — доступное имя и состояния', () => {
	it('имя региона: ariaLabel, затем название слоя', () => {
		const { unmount } = render(BaseImageMap, { props: { data, ariaLabel: 'Курорт' } })
		expect(screen.getByRole('region', { name: 'Курорт' })).toBeInTheDocument()
		unmount()
		render(BaseImageMap, { props: { data } })
		expect(screen.getByRole('region', { name: 'Горный курорт' })).toBeInTheDocument()
	})

	it('без слоёв — общее имя и сообщение «Нет слоёв карты»', () => {
		const { container } = render(BaseImageMap, { props: { data: { layers: [], objects: [] } } })
		expect(screen.getByRole('region', { name: 'Интерактивная карта' })).toBeInTheDocument()
		expect(screen.getByText('Нет слоёв карты')).toBeInTheDocument()
		expect(container.querySelector('.base-image-map__stage')).toBeNull()
		expect((container.querySelector('.base-image-map__viewport') as HTMLElement).style.aspectRatio).toBe('')
	})

	it('картинка слоя с alt и пропорции окна по слою; height перекрывает пропорции', () => {
		const { container, unmount } = render(BaseImageMap, { props: { data: SIMPLE_DATA } })
		expect(screen.getByRole('img', { name: 'План' })).toHaveAttribute('src', 'plan.png')
		expect((container.querySelector('.base-image-map__viewport') as HTMLElement).style.aspectRatio).toBe('800 / 500')
		unmount()
		const second = render(BaseImageMap, { props: { data: SIMPLE_DATA, height: '320px' } })
		const viewport = second.container.querySelector('.base-image-map__viewport') as HTMLElement
		expect(viewport.style.height).toBe('320px')
		expect(viewport.style.aspectRatio).toBe('')
	})

	it('картинка без imageAlt — декоративная', () => {
		const layer = { id: 'l', title: 'Слой', image: 'x.png', width: 10, height: 10 }
		const { container } = render(BaseImageMap, { props: { data: { layers: [layer], objects: [] } } })
		expect(container.querySelector('.base-image-map__image')).toHaveAttribute('alt', '')
	})
})

describe('BaseImageMap — объекты', () => {
	it('точки: позиция в процентах, размер по умолчанию 28, свой размер и isScaled', () => {
		const { container } = render(BaseImageMap, {
			props: {
				data: withObjects([
					{ id: 'a', type: 'point', title: 'А', x: 0.25, y: 0.5 },
					{ id: 'b', type: 'point', title: 'Б', x: 0.1, y: 0.2, size: 40, isScaled: true },
				]),
			},
		})
		const first = objectElement(container, 'a')
		expect(first.style.left).toBe('25%')
		expect(first.style.top).toBe('50%')
		expect(first.style.getPropertyValue('--im-point-size')).toBe('28px')
		expect(first).not.toHaveClass('base-image-map__point--scaled')
		const second = objectElement(container, 'b')
		expect(second.style.getPropertyValue('--im-point-size')).toBe('40px')
		expect(second).toHaveClass('base-image-map__point--scaled')
	})

	it('у точки — значок из своего icon или группы и скрытая подпись', () => {
		const { container } = render(BaseImageMap, {
			props: {
				data: withObjects(
					[
						{ id: 'own', type: 'point', title: 'Свой', x: 0, y: 0, icon: 'info', label: 'Подпись' },
						{ id: 'grouped', type: 'point', title: 'Из группы', x: 0, y: 0, group: 'g' },
						{ id: 'bare', type: 'point', title: 'Без значка', x: 0, y: 0 },
					],
					{ groups: [{ id: 'g', title: 'Группа', icon: 'star' }] },
				),
			},
		})
		const own = objectElement(container, 'own')
		expect(own.querySelector('.base-image-map__marker')).toHaveAttribute('aria-hidden', 'true')
		expect(own.querySelector('.base-image-map__marker')?.children.length).toBeGreaterThan(0)
		expect(own.querySelector('.base-image-map__label')).toHaveTextContent('Подпись')
		expect(own.querySelector('.base-image-map__label')).toHaveAttribute('aria-hidden', 'true')
		expect(objectElement(container, 'grouped').querySelector('.base-image-map__marker')?.children.length).toBeGreaterThan(0)
		expect(objectElement(container, 'bare').querySelector('.base-image-map__marker')?.children).toHaveLength(0)
		expect(objectElement(container, 'bare').querySelector('.base-image-map__label')).toBeNull()
		expect(screen.getByRole('button', { name: 'Свой' })).toBeInTheDocument()
	})

	it('фигуры — SVG-элементы с ролью и именем, ссылка — role=link', () => {
		const { container } = render(BaseImageMap, { props: { data } })
		expect(container.querySelector('.base-image-map__shapes')).toHaveAttribute('viewBox', '0 0 800 500')
		expect(screen.getByRole('button', { name: 'Озеро' }).tagName).toBe('ellipse')
		expect(screen.getByRole('button', { name: 'Лес' }).tagName).toBe('rect')
		expect(screen.getByRole('link', { name: 'Хребет' }).tagName).toBe('polygon')
		expect(screen.getByRole('button', { name: 'Озеро' })).toHaveAttribute('aria-haspopup', 'dialog')
		expect(screen.getByRole('button', { name: 'Лес' })).not.toHaveAttribute('aria-haspopup')
	})

	it('без фигур слой SVG-фигур не рисуется', () => {
		const { container } = render(BaseImageMap, { props: { data: SIMPLE_DATA } })
		expect(container.querySelector('.base-image-map__shapes')).toBeNull()
	})

	it('точка-ссылка — <a href>, внешняя открывается в новой вкладке', () => {
		render(BaseImageMap, {
			props: {
				data: withObjects([
					{ id: 'in', type: 'point', title: 'Внутренняя', x: 0.1, y: 0.1, action: 'link', link: '/shop' },
					{
						id: 'out',
						type: 'point',
						title: 'Внешняя',
						x: 0.2,
						y: 0.1,
						action: 'link',
						link: 'https://example.com',
						isLinkExternal: true,
					},
				]),
			},
		})
		expect(screen.getByRole('link', { name: 'Внутренняя' })).toHaveAttribute('href', '/shop')
		expect(screen.getByRole('link', { name: 'Внешняя' })).toHaveAttribute('target', '_blank')
		expect(screen.getByRole('link', { name: 'Внешняя' })).toHaveAttribute('rel', 'noopener noreferrer')
	})

	it('объекты другого слоя не показываются; объект без layer — на первом слое', () => {
		const layers = [
			{ id: 'one', title: 'Один', width: 10, height: 10 },
			{ id: 'two', title: 'Два', width: 10, height: 10 },
		]
		render(BaseImageMap, {
			props: {
				data: {
					layers,
					objects: [
						{ id: 'a', type: 'point', title: 'Без слоя', x: 0, y: 0 },
						{ id: 'b', type: 'point', title: 'На втором', x: 0, y: 0, layer: 'two' },
					],
				},
			},
		})
		expect(screen.getByRole('button', { name: 'Без слоя' })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'На втором' })).toBeNull()
	})

	it('стили группы и объекта — CSS-переменными на элементе', () => {
		const { container } = render(BaseImageMap, { props: { data } })
		expect(objectElement(container, 'sun').style.getPropertyValue('--im-fill')).toBe('var(--rise-warning)')
		expect(objectElement(container, 'lake').style.getPropertyValue('--im-stroke')).toBe('var(--rise-success)')
	})

	it('пульсация: у точки с isPulsing, с пропом isPulsing — у всех', () => {
		const { container, unmount } = render(BaseImageMap, { props: { data } })
		expect(objectElement(container, 'sun')).toHaveClass('base-image-map__object--pulsing')
		expect(objectElement(container, 'peak')).not.toHaveClass('base-image-map__object--pulsing')
		expect(objectElement(container, 'lake')).not.toHaveClass('base-image-map__object--pulsing')
		unmount()
		const second = render(BaseImageMap, { props: { data, isPulsing: true } })
		expect(objectElement(second.container, 'peak')).toHaveClass('base-image-map__object--pulsing')
		expect(objectElement(second.container, 'lake')).toHaveClass('base-image-map__object--pulsing')
	})

	it('roving tabindex: tabindex=0 только у первого доступного, при active — у выбранного', async () => {
		const { container, rerender } = render(BaseImageMap, { props: { data } })
		expect(objectElement(container, 'peak')).toHaveAttribute('tabindex', '0')
		expect(objectElement(container, 'sun')).toHaveAttribute('tabindex', '-1')
		await rerender({ data, active: 'lake' })
		expect(objectElement(container, 'lake')).toHaveAttribute('tabindex', '0')
		expect(objectElement(container, 'lake')).toHaveAttribute('aria-current', 'true')
		expect(objectElement(container, 'lake')).toHaveClass('base-image-map__object--active')
		expect(objectElement(container, 'peak')).toHaveAttribute('tabindex', '-1')
		await rerender({ data, active: 'closed' })
		expect(objectElement(container, 'peak')).toHaveAttribute('tabindex', '0')
	})

	it('слот point заменяет значок и получает объект, группу и isActive', () => {
		render(BaseImageMap, {
			props: { data, active: 'peak' },
			slots: {
				point: (props: { object: ImageMapObject; group?: { title: string }; isActive: boolean }) =>
					h('b', `${props.object.id}:${props.group?.title ?? '-'}:${props.isActive}`),
			},
		})
		expect(screen.getByText('peak:Сервис:true')).toBeInTheDocument()
		expect(screen.getByText('closed:-:false')).toBeInTheDocument()
	})
})

describe('BaseImageMap — панель', () => {
	it('кнопки масштаба с доступными именами; на минимуме «Уменьшить» неактивна', () => {
		render(BaseImageMap, { props: { data } })
		expect(screen.getByRole('group', { name: 'Масштаб' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Увеличить' })).toBeEnabled()
		expect(screen.getByRole('button', { name: 'Уменьшить' })).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByRole('button', { name: 'Сбросить масштаб' })).toBeInTheDocument()
	})

	it('без кнопок масштаба, полного экрана и этажей панели нет', () => {
		const { container } = render(BaseImageMap, { props: { data, hasZoomControls: false, hasFullscreen: false } })
		expect(container.querySelector('.base-image-map__toolbar')).toBeNull()
	})

	it('без кнопок масштаба и без поддержки полного экрана панели тоже нет', () => {
		const { container } = render(BaseImageMap, { props: { data, hasZoomControls: false } })
		expect(container.querySelector('.base-image-map__toolbar')).toBeNull()
	})

	it('этажи — переключатель с подписями shortTitle, без кнопок масштаба', () => {
		const { container } = render(BaseImageMap, {
			props: { data: IMAGE_MAP_FLOORS, hasZoomControls: false, hasFullscreen: false, customClass: { layers: 'my-layers' } },
		})
		expect(container.querySelector('.base-image-map__layers')).toHaveClass('my-layers')
		expect(screen.getByRole('radio', { name: '1' })).toBeChecked()
		expect(screen.queryByRole('group', { name: 'Масштаб' })).toBeNull()
	})

	it('у слоя без shortTitle в переключателе — title', () => {
		const layers = [
			{ id: 'one', title: 'Первый', width: 10, height: 10 },
			{ id: 'two', title: 'Второй', width: 10, height: 10 },
		]
		render(BaseImageMap, { props: { data: { layers, objects: [] } } })
		expect(screen.getByRole('radio', { name: 'Второй' })).toBeInTheDocument()
	})

	it('умолчания из createUiKitPlugin({ defaults }) применяются', () => {
		const { container } = render(BaseImageMap, {
			props: { data },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseImageMap: { hasZoomControls: false, isPulsing: true } } })] },
		})
		expect(screen.queryByRole('button', { name: 'Увеличить' })).toBeNull()
		expect(objectElement(container, 'peak')).toHaveClass('base-image-map__object--pulsing')
	})
})
