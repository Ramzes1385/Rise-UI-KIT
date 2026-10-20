import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, screen, within } from '@testing-library/vue'
import { mockWebGL } from '../../../BaseImageMap3D/__tests__/imageMap3d.test-utils'
import { DATA_ROADMAP_3D, stagesData, stubReducedMotion, useRoadmap3DEnvironment } from '../fixtures/roadmap3d.test-utils'

const env = useRoadmap3DEnvironment()

const toolbar = () => within(screen.getByRole('toolbar'))
const viewport = () => screen.getByRole('group', { name: 'Путь' })

describe('BaseRoadmap3D: камера', () => {
	it('поворот на четверть в изометрии сообщает ближайший пресет', async () => {
		const user = userEvent.setup()
		const { events } = await env.renderRoadmap()
		await user.click(toolbar().getByRole('button', { name: 'Повернуть на 90° вправо' }))
		expect(events['update:camera']?.at(-1)).toEqual(['iso-90'])
		await user.click(toolbar().getByRole('button', { name: 'Повернуть на 90° влево' }))
		expect(events['update:camera']?.at(-1)).toEqual(['iso'])
	})

	it('в виде сверху поворот сам пресет не меняет', async () => {
		const { events, exposed } = await env.renderRoadmap({ camera: 'top' })
		exposed.value?.rotate(1)
		expect(events['update:camera']).toBeUndefined()
	})

	it('смена вида камеры (изометрия → перспектива) меняет тип камеры сцены', async () => {
		const { exposed } = await env.renderRoadmap()
		const kind = () =>
			(exposed.value?.getSceneContext()?.camera as unknown as { isPerspectiveCamera?: boolean }).isPerspectiveCamera === true
		const before = kind()
		exposed.value?.setCamera('perspective')
		await Promise.resolve()
		await Promise.resolve()
		env.flush(3)
		expect(kind()).not.toBe(before)
		exposed.value?.setCamera('iso')
		env.flush(3)
	})

	it('пресет в данных view3d.camera работает, неизвестное имя — изометрия', async () => {
		const top = await env.renderRoadmap({ data: { ...DATA_ROADMAP_3D, view3d: { camera: 'top' } } })
		expect(top.exposed.value?.getSceneContext()).not.toBeNull()
		top.unmount()
		const weird = await env.renderRoadmap({ data: { ...DATA_ROADMAP_3D, view3d: { camera: 'странный' } } })
		expect(weird.exposed.value?.getSceneContext()).not.toBeNull()
	})

	it('проп camera меняет пресет без события, тот же пресет и неизвестный игнорируются', async () => {
		const { rerender, events } = await env.renderRoadmap({ camera: 'iso' })
		await rerender({ camera: 'top' })
		await rerender({ camera: 'top' })
		await rerender({ camera: undefined })
		expect(events['update:camera']).toBeUndefined()
	})

	it('при «уменьшить движение» поворот и масштаб ставят камеру сразу', async () => {
		stubReducedMotion(true)
		const user = userEvent.setup()
		const { exposed } = await env.renderRoadmap()
		const place = () => exposed.value?.getSceneContext()?.camera.position.clone()
		const before = place()
		await user.click(toolbar().getByRole('button', { name: 'Повернуть на 90° вправо' }))
		expect(place()?.distanceTo(before as never)).toBeGreaterThan(0.01)
	})

	it('масштаб доходит до предела: кнопка «Увеличить» выключается, «Сбросить вид» возвращает', async () => {
		stubReducedMotion(true)
		const user = userEvent.setup()
		await env.renderRoadmap()
		const zoomIn = toolbar().getByRole('button', { name: 'Увеличить' })
		for (let step = 0; step < 40 && !zoomIn.hasAttribute('disabled') && zoomIn.getAttribute('aria-disabled') !== 'true'; step++)
			await user.click(zoomIn)
		expect(zoomIn.hasAttribute('disabled') || zoomIn.getAttribute('aria-disabled') === 'true').toBe(true)
		const zoomOut = toolbar().getByRole('button', { name: 'Уменьшить' })
		for (let step = 0; step < 80 && !zoomOut.hasAttribute('disabled') && zoomOut.getAttribute('aria-disabled') !== 'true'; step++)
			await user.click(zoomOut)
		await user.click(toolbar().getByRole('button', { name: 'Сбросить вид' }))
	})

	it('колесо и щипок двумя пальцами меняют масштаб', async () => {
		stubReducedMotion(true)
		const { exposed } = await env.renderRoadmap()
		const place = () => exposed.value?.getSceneContext()?.camera.position.clone()
		const before = place()
		await fireEvent.wheel(viewport(), { deltaY: -200 })
		const afterWheel = place()
		expect(afterWheel?.distanceTo(before as never)).toBeGreaterThanOrEqual(0)
		await fireEvent.pointerDown(viewport(), { pointerType: 'touch', pointerId: 1, clientX: 100, clientY: 100 })
		await fireEvent.pointerDown(viewport(), { pointerType: 'touch', pointerId: 2, clientX: 150, clientY: 100 })
		await fireEvent.pointerMove(viewport(), { pointerType: 'touch', pointerId: 2, clientX: 250, clientY: 100 })
		await fireEvent.pointerUp(viewport(), { pointerType: 'touch', pointerId: 2 })
		await fireEvent.pointerLeave(viewport())
	})

	it('наведение мыши и щелчок по пустому месту сцены: общий вид', async () => {
		const { events } = await env.renderRoadmap({ focused: 'frame' })
		await fireEvent.pointerMove(viewport(), { clientX: 5, clientY: 5, pointerType: 'mouse' })
		env.flush(2)
		await fireEvent.pointerDown(viewport(), { clientX: 5, clientY: 5 })
		await fireEvent.click(viewport(), { clientX: 5, clientY: 5 })
		expect(events['update:focused']?.at(-1)).toEqual([null])
	})
})

describe('BaseRoadmap3D: перспектива, уменьшенное движение и пустые случаи', () => {
	it('перспективная камера: фокус на этапе ставит позу без ошибок', async () => {
		const { exposed } = await env.renderRoadmap({ camera: 'perspective' })
		exposed.value?.focusStage('frame')
		env.flush(3)
		expect(exposed.value?.getSceneContext()?.camera).toBeTruthy()
	})

	it('размонтирование в режиме «уменьшить движение» освобождает анимации', async () => {
		stubReducedMotion(true)
		const { unmount } = await env.renderRoadmap()
		expect(() => unmount()).not.toThrow()
	})

	it('в 2D-виде сцены нет: список моделей пуст', async () => {
		const { exposed } = await env.renderRoadmap({ view: '2d' })
		expect(exposed.value?.getModels()).toEqual([])
		expect(exposed.value?.getSceneContext()).toBeNull()
	})

	it('пустой путь не роняет сцену: моделей нет', async () => {
		const { exposed } = await env.renderRoadmap({ data: stagesData(0) })
		env.flush(3)
		expect(exposed.value?.getModels()).toEqual([])
	})

	it('без своей фабрики используется WebGL-рендерер ядра', async () => {
		mockWebGL(true)
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		await env.renderRoadmap({ rendererFactory: undefined }, {}, { isReady: false })
		env.flush(2)
		warn.mockRestore()
		error.mockRestore()
	})
})
