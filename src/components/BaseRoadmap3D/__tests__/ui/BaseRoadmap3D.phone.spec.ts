import '@testing-library/jest-dom/vitest'
import { InstancedMesh } from 'three'
import userEvent from '@testing-library/user-event'
import { fireEvent, screen, within } from '@testing-library/vue'
import { createFakeRenderer, useRoadmap3DEnvironment } from '../fixtures/roadmap3d.test-utils'

const env = useRoadmap3DEnvironment()

const stepper = () => screen.getByRole('list', { name: 'Этапы', hidden: true }).parentElement as HTMLElement
const touch = (x: number) => ({ touches: [{ clientX: x, clientY: 10 }], changedTouches: [{ clientX: x, clientY: 10 }] })

function instancedCount(context: { scene: { traverse: (visit: (item: unknown) => void) => void } } | null | undefined): number {
	let count = 0
	context?.scene.traverse(item => item instanceof InstancedMesh && count++)
	return count
}

describe('BaseRoadmap3D: телефон', () => {
	beforeEach(() => {
		env.size.width = 375
	})

	it('узкий контейнер: «Назад / Далее» в полосе этапов, панель — шторкой', async () => {
		await env.renderRoadmap({ focused: 'frame' })
		expect(screen.getByRole('button', { name: /Предыдущий этап/, hidden: true })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /Следующий этап/, hidden: true })).toBeInTheDocument()
		expect(document.querySelector('.base-roadmap-3d--compact')).toBeInTheDocument()
		expect(document.querySelector('.base-roadmap-3d__panel--sheet')).toBeInTheDocument()
	})

	it('на широком контейнере этих кнопок нет', async () => {
		env.size.width = 1000
		await env.renderRoadmap()
		expect(screen.queryByRole('button', { name: /Предыдущий этап/, hidden: true })).not.toBeInTheDocument()
	})

	it('«Далее» и «Назад» листают этапы, на краях выключены', async () => {
		const user = userEvent.setup()
		await env.renderRoadmap({ focused: 'basics' })
		expect(screen.getByRole('button', { name: /Предыдущий этап/, hidden: true })).toBeDisabled()
		await user.click(screen.getByRole('button', { name: /Следующий этап/, hidden: true }))
		expect(
			within(screen.getByRole('region', { name: /Подробности/ })).getByRole('heading', { level: 2, name: 'Каркас' }),
		).toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: /Предыдущий этап/, hidden: true }))
		expect(
			within(screen.getByRole('region', { name: /Подробности/ })).getByRole('heading', { level: 2, name: 'Основы' }),
		).toBeInTheDocument()
	})

	it('на последнем этапе «Далее» выключена', async () => {
		await env.renderRoadmap({ focused: 'ship' })
		expect(screen.getByRole('button', { name: /Следующий этап/, hidden: true })).toBeDisabled()
	})

	it('свайп полосы влево — следующий этап, вправо — предыдущий; короткий жест не считается', async () => {
		await env.renderRoadmap({ focused: 'frame' })
		const bar = stepper()
		await fireEvent.touchStart(bar, touch(300))
		await fireEvent.touchMove(bar, touch(250))
		await fireEvent.touchEnd(bar, touch(100))
		expect(
			within(screen.getByRole('region', { name: /Подробности/ })).getByRole('heading', { level: 2, name: 'Сборка' }),
		).toBeInTheDocument()
		await fireEvent.touchStart(bar, touch(100))
		await fireEvent.touchEnd(bar, touch(300))
		expect(
			within(screen.getByRole('region', { name: /Подробности/ })).getByRole('heading', { level: 2, name: 'Каркас' }),
		).toBeInTheDocument()
		await fireEvent.touchStart(bar, touch(100))
		await fireEvent.touchEnd(bar, touch(120))
		expect(
			within(screen.getByRole('region', { name: /Подробности/ })).getByRole('heading', { level: 2, name: 'Каркас' }),
		).toBeInTheDocument()
	})

	it('quality auto на узком контейнере строит сцену без мелочи; high и широкий — с мелочью', async () => {
		const narrow = await env.renderRoadmap()
		const lowCount = instancedCount(narrow.exposed.value?.getSceneContext())
		narrow.unmount()
		const high = await env.renderRoadmap({ quality: 'high' })
		expect(instancedCount(high.exposed.value?.getSceneContext())).toBeGreaterThan(lowCount)
		high.unmount()
		const low = await env.renderRoadmap({ quality: 'low' })
		expect(instancedCount(low.exposed.value?.getSceneContext())).toBe(lowCount)
	})

	it('тени выключены на low и включены на high', async () => {
		const shadow = { enabled: true, type: 0 }
		const renderer = Object.assign(createFakeRenderer(), { shadowMap: shadow })
		await env.renderRoadmap({ quality: 'low', rendererFactory: () => renderer }, {}, { isReady: false, renderer })
		await vi.waitFor(() => expect(renderer.setPixelRatio).toHaveBeenCalled())
		expect(shadow.enabled).toBe(false)
		const second = Object.assign(createFakeRenderer(), { shadowMap: { enabled: false, type: 0 } })
		await env.renderRoadmap({ quality: 'high', rendererFactory: () => second }, {}, { isReady: false, renderer: second })
		await vi.waitFor(() => expect(second.setPixelRatio).toHaveBeenCalled())
		expect(second.shadowMap.enabled).toBe(true)
	})

	it('смена качества пересобирает сцену', async () => {
		const { exposed, rerender } = await env.renderRoadmap({ quality: 'low' })
		const low = instancedCount(exposed.value?.getSceneContext())
		await rerender({ quality: 'high' })
		await vi.waitFor(() => expect(instancedCount(exposed.value?.getSceneContext())).toBeGreaterThan(low))
	})
})
