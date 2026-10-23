import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { Vector3 } from 'three'
import { useMapEnvironment } from '../imageMap3d.test-utils'
import type { Mesh, MeshStandardMaterial, Object3D } from 'three'
import type { ImageMap3DData } from '../../types/imageMap3dData.types'
import { fireEvent, screen, waitFor, within } from '@testing-library/vue'

const DATA: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: 'Этаж 1', width: 800, height: 400 },
		{ id: 'f2', title: 'Этаж 2', width: 800, height: 400, elevation: 300 },
	],
	groups: [
		{ id: 'food', title: 'Еда' },
		{ id: 'shops', title: 'Магазины' },
	],
	filters: [{ id: 'kind', title: 'Тип' }],
	objects: [
		{ id: 'hall', type: 'rect', title: 'Зал', x: 0.3, y: 0.3, width: 0.4, height: 0.4, layer: 'f1', group: 'food', height3d: 30 },
		{ id: 'left', type: 'rect', title: 'Левый', x: 0.02, y: 0.4, width: 0.1, height: 0.2, layer: 'f1', group: 'shops' },
		{ id: 'roof', type: 'rect', title: 'Крыша', x: 0.3, y: 0.3, width: 0.4, height: 0.4, layer: 'f2', group: 'food' },
		{ id: 'vault', type: 'rect', title: 'Хранилище', x: 0.5, y: 0.5, width: 0.2, height: 0.2, layer: 'f2', isDisabled: true },
	],
}

const LEFT = new Vector3(56, 5, 200)
const env = useMapEnvironment()

type SceneOf = () => Pick<Object3D, 'getObjectByName'>

const isVisible = (scene: SceneOf, id: string) => scene().getObjectByName(id)?.visible
const materialOf = (scene: SceneOf, id: string) => (scene().getObjectByName(id) as Mesh<never, MeshStandardMaterial>).material
const rowNames = () =>
	[...screen.getByRole('complementary', { name: 'Список объектов' }).querySelectorAll('.base-image-map__entry-title')]
		.map(title => title.textContent)
		.sort()

describe('BaseImageMap3D: каталог, этажи и фильтры — одно состояние', () => {
	it('строка каталога с объектом другого этажа переключает этаж: сцена, переключатель, имя области и выбор', async () => {
		const onLayerChange = vi.fn()
		const onUpdateActive = vi.fn()
		const { scene, region } = await env.renderMap({
			data: DATA,
			hasDirectory: true,
			layerMode: 'single',
			defaultAction: 'none',
			onLayerChange,
			'onUpdate:active': onUpdateActive,
		})
		expect([isVisible(scene, 'f1'), isVisible(scene, 'f2')]).toEqual([true, false])
		await fireEvent.click(screen.getByRole('button', { name: /Крыша/ }))
		env.flushFrames()
		await waitFor(() => expect([isVisible(scene, 'f1'), isVisible(scene, 'f2')]).toEqual([false, true]))
		expect(onLayerChange).toHaveBeenCalledWith('f2')
		expect(onUpdateActive).toHaveBeenCalledWith('roof')
		expect(region()).toHaveAccessibleName(expect.stringContaining('Этаж 2'))
		expect(within(screen.getByRole('radiogroup', { name: 'Этажи' })).getByRole('radio', { name: 'Этаж 2' })).toBeChecked()
		expect(screen.getByRole('button', { name: /Крыша/ })).toHaveAttribute('aria-current', 'true')
		expect(materialOf(scene, 'roof').opacity).toBe(1)
	})

	it('строка отключённого объекта другого этажа этаж не переключает', async () => {
		const onLayerChange = vi.fn()
		const { scene } = await env.renderMap({ data: DATA, hasDirectory: true, layerMode: 'single', defaultAction: 'none', onLayerChange })
		await fireEvent.click(screen.getByRole('button', { name: /Хранилище/ }))
		env.flushFrames()
		expect(onLayerChange).not.toHaveBeenCalled()
		expect([isVisible(scene, 'f1'), isVisible(scene, 'f2')]).toEqual([true, false])
	})

	it('фильтр в каталоге убирает объект из сцены и из строк; «Сбросить фильтры» возвращает', async () => {
		const onUpdateFilters = vi.fn()
		const { scene } = await env.renderMap({ data: DATA, hasDirectory: true, 'onUpdate:filters': onUpdateFilters })
		expect([isVisible(scene, 'hall'), isVisible(scene, 'left')]).toEqual([true, true])
		expect(rowNames()).toEqual(['Зал', 'Крыша', 'Левый', 'Хранилище'])
		await fireEvent.click(screen.getByRole('checkbox', { name: 'Еда' }))
		env.flushFrames()
		await nextTick()
		expect(onUpdateFilters).toHaveBeenLastCalledWith({ kind: ['food'] })
		expect([isVisible(scene, 'hall'), isVisible(scene, 'left')]).toEqual([true, false])
		expect(rowNames()).toEqual(['Зал', 'Крыша'])
		await fireEvent.click(screen.getByRole('button', { name: 'Сбросить фильтры' }))
		env.flushFrames()
		await nextTick()
		expect([isVisible(scene, 'hall'), isVisible(scene, 'left')]).toEqual([true, true])
		expect(rowNames()).toEqual(['Зал', 'Крыша', 'Левый', 'Хранилище'])
	})

	it('поиск сужает только каталог: объекты сцены остаются, как и в 2D', async () => {
		const { scene } = await env.renderMap({ data: DATA, hasDirectory: true })
		await fireEvent.update(screen.getByRole('textbox', { name: 'Поиск по карте' }), 'Зал')
		env.flushFrames()
		await nextTick()
		expect(rowNames()).toEqual(['Зал'])
		expect(isVisible(scene, 'left')).toBe(true)
		expect(materialOf(scene, 'left').opacity).toBeCloseTo(0.7)
	})

	it('выбор лучом в 3D виден в каталоге и в 2D; выбор в 2D возвращается в сцену и каталог', async () => {
		const { container, exposed, scene, region, screenOf } = await env.renderMap({
			data: DATA,
			hasDirectory: true,
			defaultAction: 'none',
		})
		const point = screenOf(LEFT)
		await fireEvent.pointerDown(region(), point)
		await fireEvent.click(region(), point)
		env.flushFrames()
		expect(screen.getByRole('button', { name: /Левый/ })).toHaveAttribute('aria-current', 'true')
		expect(materialOf(scene, 'left').opacity).toBe(1)

		exposed.value?.setView('2d')
		await nextTick()
		const map = container.querySelector('.base-image-map') as HTMLElement
		expect(map.querySelector('[data-image-map-object="left"]')).toHaveClass('base-image-map__object--active')
		await fireEvent.click(within(map).getByRole('button', { name: 'Зал' }))

		exposed.value?.setView('3d')
		await nextTick()
		env.flushFrames()
		await waitFor(() => expect(materialOf(scene, 'hall').opacity).toBe(1))
		expect(materialOf(scene, 'left').opacity).toBeCloseTo(0.7)
		expect(screen.getByRole('button', { name: /Зал/ })).toHaveAttribute('aria-current', 'true')
		expect(screen.getByRole('button', { name: /Левый/ })).not.toHaveAttribute('aria-current')
	})
})
