import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import { screen, waitFor } from '@testing-library/vue'
import { FLOW_3D, useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'

const env = useFlowMap3DEnvironment()

describe('BaseFlowMap3D: сцена', () => {
	it('создаёт рендерер на своём холсте и отдаёт область с именем и ролью', async () => {
		const { renderer, container } = await env.renderMap()
		const canvas = container.querySelector('canvas') as HTMLCanvasElement
		expect(canvas).toHaveAttribute('aria-hidden', 'true')
		expect(renderer.setPixelRatio).toHaveBeenCalledWith(1)
		expect(renderer.setSize).toHaveBeenCalledWith(900, 560, false)
		const region = screen.getByRole('group', { name: 'Оформление заказа' })
		expect(region).toHaveAttribute('tabindex', '0')
		expect(region).toHaveAttribute('aria-roledescription', '3D-карта связей')
		expect(screen.getByRole('region', { name: 'Оформление заказа' })).toHaveStyle({ height: '560px' })
		expect(renderer.render).toHaveBeenCalled()
	})

	it('собирает дерево сцены: узлы, земля, связи и свет', async () => {
		const { scene } = await env.renderMap()
		expect(scene().children.length).toBeGreaterThanOrEqual(2)
	})

	it('показывает бирки узлов и скрытый список групп', async () => {
		const { container } = await env.renderMap()
		const tags = [...container.querySelectorAll('.base-flow-map-3d__tag')].map(tag => tag.textContent?.trim())
		expect(tags).toEqual(['Шлюз API', 'Очередь', 'База данных', 'Кеш'])
		expect(screen.getAllByRole('list').length).toBeGreaterThan(0)
		expect(screen.getByRole('button', { name: /Кеш/ })).toBeInTheDocument()
	})

	it('слот `tag` заменяет содержимое бирки и получает состояние', async () => {
		const { container } = await env.renderMap(
			{},
			{ tag: ((props: { node: { id: string }; isSelected: boolean }) => h('i', `${props.node.id}:${props.isSelected}`)) as never },
		)
		expect(container.querySelector('[data-label-id="api"] i')).toHaveTextContent('api:false')
	})

	it('классы частей добавляются к классам кита', async () => {
		const { container } = await env.renderMap({ ui: { root: 'my-root', canvas: 'my-canvas', tag: 'my-tag' } })
		expect(container.querySelector('.base-flow-map-3d')).toHaveClass('my-root')
		expect(container.querySelector('canvas')).toHaveClass('my-canvas')
		expect(container.querySelector('.base-flow-map-3d__tag')).toHaveClass('my-tag')
	})

	it('состояния загрузки, ошибки и пустой карты закрывают сцену плашкой', async () => {
		const loading = await env.renderMap({ isLoading: true })
		expect(loading.container.querySelector('.base-flow-map-3d__status--loading')).toBeInTheDocument()
		expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'true')
		loading.unmount()
		const failed = await env.renderMap({ error: 'Сбой загрузки' })
		expect(failed.container.querySelector('.base-flow-map-3d__status--error')).toHaveTextContent('Сбой загрузки')
		failed.unmount()
		const empty = await env.renderMap({ data: { ...FLOW_3D, nodes: [], edges: [], groups: [] } })
		expect(empty.container.querySelector('.base-flow-map-3d__status--empty')).toBeInTheDocument()
	})

	it('загрузка и ошибка озвучиваются в живой области; смена текста озвучивается заново', async () => {
		const announced = () => document.querySelector('.base-flow-map-3d__sr[role="status"]')?.textContent ?? ''
		const loading = await env.renderMap({ isLoading: true })
		await waitFor(() => expect(announced()).not.toBe(''))
		loading.unmount()
		const failed = await env.renderMap({ error: 'Сбой загрузки' })
		await waitFor(() => expect(announced()).toBe('Сбой загрузки'))
		await failed.rerender({ error: 'Другой сбой' })
		await waitFor(() => expect(announced()).toBe('Другой сбой'))
	})

	it('компонент отдаёт контроллер через `defineExpose`', async () => {
		const map = await env.renderMap()
		await waitFor(() => expect(map.exposed.value?.getData).toBeTypeOf('function'))
		expect(map.exposed.value?.getData().nodes.length).toBeGreaterThan(0)
	})

	it('выключенная карта помечена', async () => {
		const { container } = await env.renderMap({ isDisabled: true })
		expect(container.querySelector('.base-flow-map-3d')).toHaveClass('base-flow-map-3d--disabled')
		expect(screen.getByRole('region')).toHaveAttribute('aria-disabled', 'true')
	})
})
