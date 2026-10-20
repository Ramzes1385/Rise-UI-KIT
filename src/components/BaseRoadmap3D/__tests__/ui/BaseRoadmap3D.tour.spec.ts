import '@testing-library/jest-dom/vitest'
import { Vector3 } from 'three'
import { fireEvent, screen, within } from '@testing-library/vue'
import { stubReducedMotion, useRoadmap3DEnvironment } from '../fixtures/roadmap3d.test-utils'

const env = useRoadmap3DEnvironment()

const startButton = () => screen.getByRole('button', { name: 'Запустить тур' })
const tourBar = () => screen.getByRole('group', { name: 'Тур по этапам' })
const viewport = () => screen.getByRole('group', { name: 'Путь' })

beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }))
afterEach(() => vi.useRealTimers())

describe('BaseRoadmap3D: тур', () => {
	it('кнопка запускает тур: сообщает, фокусирует первый этап, показывает панель тура с номером шага', async () => {
		const { events } = await env.renderRoadmap()
		await fireEvent.click(startButton())
		expect(events['update:isTourPlaying']?.at(-1)).toEqual([true])
		expect(screen.getAllByRole('button', { name: 'Остановить тур' })[0]).toHaveAttribute('aria-pressed', 'true')
		expect(within(tourBar()).getByText('Этап 1 из 4')).toBeInTheDocument()
		expect(events['update:focused']?.at(-1)).toEqual(['basics'])
		expect(screen.queryByRole('list', { name: 'Этапы' })).not.toBeInTheDocument()
	})

	it('каждые 2,6 с переходит дальше и сам заканчивается на последнем этапе', async () => {
		const { events } = await env.renderRoadmap()
		await fireEvent.click(startButton())
		await vi.advanceTimersByTimeAsync(2600)
		expect(within(tourBar()).getByText('Этап 2 из 4')).toBeInTheDocument()
		expect(events['update:focused']?.at(-1)).toEqual(['frame'])
		await vi.advanceTimersByTimeAsync(2600 * 2)
		expect(events['update:focused']?.at(-1)).toEqual(['ship'])
		await vi.advanceTimersByTimeAsync(2600)
		expect(events['update:isTourPlaying']?.at(-1)).toEqual([false])
		expect(screen.queryByRole('group', { name: 'Тур по этапам' })).not.toBeInTheDocument()
	})

	it('кнопки тура: назад, вперёд, стоп; на краях они выключены', async () => {
		const { events } = await env.renderRoadmap()
		await fireEvent.click(startButton())
		const bar = within(tourBar())
		expect(bar.getByRole('button', { name: 'Предыдущий этап' })).toBeDisabled()
		await fireEvent.click(bar.getByRole('button', { name: 'Следующий этап' }))
		expect(events['update:focused']?.at(-1)).toEqual(['frame'])
		await fireEvent.click(bar.getByRole('button', { name: 'Предыдущий этап' }))
		expect(events['update:focused']?.at(-1)).toEqual(['basics'])
		await fireEvent.click(bar.getByRole('button', { name: 'Остановить тур' }))
		expect(events['update:isTourPlaying']?.at(-1)).toEqual([false])
		expect(screen.getByRole('list', { name: 'Этапы' })).toBeInTheDocument()
	})

	it('на последнем шаге «вперёд» выключена', async () => {
		await env.renderRoadmap({ focused: 'build' })
		await fireEvent.click(startButton())
		await vi.advanceTimersByTimeAsync(2600)
		expect(within(tourBar()).getByRole('button', { name: 'Следующий этап' })).toBeDisabled()
	})

	it('любой ввод в сцене останавливает тур: клавиатура и указатель, но не нажатия на панель тура', async () => {
		const { events } = await env.renderRoadmap()
		await fireEvent.click(startButton())
		await fireEvent.pointerDown(tourBar())
		expect(events['update:isTourPlaying']?.at(-1)).toEqual([true])
		await fireEvent.keyDown(viewport(), { key: 'ArrowRight' })
		expect(events['update:isTourPlaying']?.at(-1)).toEqual([false])
		await fireEvent.click(startButton())
		await fireEvent.pointerDown(viewport())
		expect(events['update:isTourPlaying']?.at(-1)).toEqual([false])
	})

	it('проп isTourPlaying запускает и гасит тур без событий; setTour — как кнопка', async () => {
		const { rerender, events, exposed } = await env.renderRoadmap({ isTourPlaying: true })
		expect(within(tourBar()).getByText('Этап 1 из 4')).toBeInTheDocument()
		expect(events['update:isTourPlaying']).toBeUndefined()
		await rerender({ isTourPlaying: false })
		expect(screen.queryByRole('group', { name: 'Тур по этапам' })).not.toBeInTheDocument()
		exposed.value?.setTour(true)
		expect(events['update:isTourPlaying']?.at(-1)).toEqual([true])
		exposed.value?.setTour(false)
		expect(events['update:isTourPlaying']?.at(-1)).toEqual([false])
	})

	it('переход в 2D останавливает тур тихо', async () => {
		const { exposed, events } = await env.renderRoadmap({ isTourPlaying: true })
		exposed.value?.setView('2d')
		await Promise.resolve()
		expect(events['update:isTourPlaying']).toBeUndefined()
		expect(screen.queryByRole('group', { name: 'Тур по этапам' })).not.toBeInTheDocument()
	})

	it('размонтирование гасит таймер тура', async () => {
		const { unmount, events } = await env.renderRoadmap({ isTourPlaying: true })
		unmount()
		await vi.advanceTimersByTimeAsync(10000)
		expect(events['update:focused']?.length ?? 0).toBeLessThanOrEqual(1)
	})
})

describe('BaseRoadmap3D: тур и уменьшенное движение', () => {
	function cameraPlace(context: { camera: { position: Vector3 } } | null | undefined): Vector3 {
		return (context?.camera.position ?? new Vector3()).clone()
	}

	it('при «уменьшить движение» шаг тура ставит камеру сразу, без полёта', async () => {
		stubReducedMotion(true)
		const { exposed } = await env.renderRoadmap()
		const before = cameraPlace(exposed.value?.getSceneContext())
		await fireEvent.click(startButton())
		expect(cameraPlace(exposed.value?.getSceneContext()).distanceTo(before)).toBeGreaterThan(0.01)
	})

	it('без него камера не прыгает: сразу после шага ещё на месте (идёт полёт)', async () => {
		stubReducedMotion(false)
		document.documentElement.removeAttribute('data-rise-motion')
		const { exposed } = await env.renderRoadmap()
		const before = cameraPlace(exposed.value?.getSceneContext())
		await fireEvent.click(startButton())
		expect(cameraPlace(exposed.value?.getSceneContext()).distanceTo(before)).toBeLessThan(0.0001)
	})
})
