import '@testing-library/jest-dom/vitest'
import { BufferGeometry } from 'three'
import userEvent from '@testing-library/user-event'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { fireEvent, screen, waitFor, within } from '@testing-library/vue'
import { useRoadmap3DEnvironment } from '../fixtures/roadmap3d.test-utils'
import type { RoadmapData } from '@components/BaseRoadmap/types/roadmapData.types'

const env = useRoadmap3DEnvironment()

const EDIT = { modes: ['view', 'edit'], mode: 'edit' }
const panel = () => screen.getByRole('region', { name: /Подробности/ })
const editor = () => within(panel()).getByRole('region', { name: 'Правка этапа' })

function lastData(events: Record<string, unknown[][]>): RoadmapData {
	return events['update:data']?.at(-1)?.[0] as RoadmapData
}

const order = (data: RoadmapData) => data.stages.map(stage => stage.id)

async function chooseModel(index: number) {
	const trigger = editor().querySelector('.base-select__trigger') as HTMLElement
	trigger.click()
	const options = await waitFor(() => {
		const found = document.querySelectorAll('[role="option"]')
		expect(found.length).toBeGreaterThan(0)
		return found
	})
	await fireEvent.click(options[index < 0 ? options.length + index : index] as HTMLElement)
}

describe('BaseRoadmap3D: правка через панель', () => {
	it('панель правки есть только в режиме правки', async () => {
		const view = await env.renderRoadmap({ focused: 'basics' })
		expect(within(panel()).queryByRole('region', { name: 'Правка этапа' })).not.toBeInTheDocument()
		view.unmount()
		await env.renderRoadmap({ ...EDIT, focused: 'basics' })
		expect(editor()).toBeInTheDocument()
	})

	it('«Позже» и «Раньше» меняют порядок этапов в данных и озвучивают новое место', async () => {
		const user = userEvent.setup()
		const { events } = await env.renderRoadmap({ ...EDIT, focused: 'basics' })
		expect(within(editor()).getByRole('button', { name: 'Раньше' })).toBeDisabled()
		await user.click(within(editor()).getByRole('button', { name: 'Позже' }))
		await waitFor(() => expect(order(lastData(events))).toEqual(['frame', 'basics', 'build', 'ship']))
		await waitFor(() => expect(document.querySelector('.base-roadmap-3d__sr[role="status"]')).toHaveTextContent('теперь 2 из 4'))
		await user.click(within(editor()).getByRole('button', { name: 'Раньше' }))
		await waitFor(() => expect(order(lastData(events))).toEqual(['basics', 'frame', 'build', 'ship']))
	})

	it('у последнего этапа «Позже» выключена', async () => {
		await env.renderRoadmap({ ...EDIT, focused: 'ship' })
		expect(within(editor()).getByRole('button', { name: 'Позже' })).toBeDisabled()
	})

	it('Alt+стрелки двигают этап в фокусе', async () => {
		const { events } = await env.renderRoadmap({ ...EDIT, focused: 'frame' })
		await fireEvent.keyDown(screen.getByRole('group', { name: 'Путь' }), { key: 'ArrowLeft', altKey: true })
		await waitFor(() => expect(order(lastData(events))).toEqual(['frame', 'basics', 'build', 'ship']))
		await fireEvent.keyDown(screen.getByRole('group', { name: 'Путь' }), { key: 'ArrowRight', altKey: true })
		await waitFor(() => expect(order(lastData(events))).toEqual(['basics', 'frame', 'build', 'ship']))
	})

	it('перенос этапа пересобирает остров: модели и их число на месте, старые геометрии освобождены', async () => {
		const dispose = vi.spyOn(BufferGeometry.prototype, 'dispose')
		const user = userEvent.setup()
		const { exposed, events } = await env.renderRoadmap({ ...EDIT, focused: 'basics' })
		const before = dispose.mock.calls.length
		await user.click(within(editor()).getByRole('button', { name: 'Позже' }))
		await waitFor(() => expect(order(lastData(events))).toEqual(['frame', 'basics', 'build', 'ship']))
		env.flush(3)
		expect(exposed.value?.getModels()).toHaveLength(4)
		expect(exposed.value?.getModel('basics')).not.toBeNull()
		expect(dispose.mock.calls.length).toBeGreaterThan(before)
		const afterMove = dispose.mock.calls.length
		await user.click(within(editor()).getByRole('button', { name: 'Удалить этап' }))
		await waitFor(() => expect(exposed.value?.getModels()).toHaveLength(3))
		expect(exposed.value?.getModel('basics')).toBeNull()
		expect(dispose.mock.calls.length).toBeGreaterThan(afterMove)
	})

	it('название: правка по Tab уходит в данные, пустое возвращается прежним', async () => {
		const user = userEvent.setup()
		const { events } = await env.renderRoadmap({ ...EDIT, focused: 'basics' })
		const input = within(editor()).getByRole('textbox', { name: 'Название' })
		await user.clear(input)
		await user.type(input, 'Азы')
		await user.tab()
		await waitFor(() => expect(lastData(events).stages[0].title).toBe('Азы'))
		await user.clear(input)
		await user.tab()
		expect(input).toHaveValue('Азы')
	})

	it('модель пьедестала: выбор из набора и «Своя модель» с адресом GLB, затем «Автоматически»', async () => {
		vi.spyOn(GLTFLoader.prototype, 'loadAsync').mockRejectedValue(new Error('нет файла'))
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const user = userEvent.setup()
		const { events } = await env.renderRoadmap({ ...EDIT, focused: 'basics' })
		await chooseModel(1)
		await waitFor(() => expect(lastData(events).stages[0].model3d?.model).toBeTruthy())
		await chooseModel(-1)
		const url = await within(editor()).findByRole('textbox', { name: 'Ссылка на GLB' })
		await user.type(url, 'a.glb')
		await waitFor(() => expect(lastData(events).stages[0].model3d?.url).toBe('a.glb'))
		await chooseModel(0)
		await waitFor(() => expect(lastData(events).stages[0].model3d?.model).toBeUndefined())
		warn.mockRestore()
	}, 90000)

	it('«Добавить этап» добавляет этап и пересобирает остров на 5 моделей', async () => {
		const user = userEvent.setup()
		const { events, exposed } = await env.renderRoadmap({ ...EDIT, focused: 'basics' })
		await user.click(within(editor()).getByRole('button', { name: 'Добавить этап' }))
		await waitFor(() => expect(lastData(events).stages).toHaveLength(5))
		await waitFor(() => expect(exposed.value?.getModels()).toHaveLength(5))
	})

	it('удаление этапа закрывает панель', async () => {
		const user = userEvent.setup()
		const { events } = await env.renderRoadmap({ ...EDIT, focused: 'basics' })
		await user.click(within(editor()).getByRole('button', { name: 'Удалить этап' }))
		await waitFor(() => expect(order(lastData(events))).toEqual(['frame', 'build', 'ship']))
		expect(screen.queryByRole('region', { name: /Подробности/ })).not.toBeInTheDocument()
	})

	it('общая история: отмена возвращает порядок', async () => {
		const user = userEvent.setup()
		const { events, exposed } = await env.renderRoadmap({ ...EDIT, focused: 'basics' })
		await user.click(within(editor()).getByRole('button', { name: 'Позже' }))
		await waitFor(() => expect(order(lastData(events))).toEqual(['frame', 'basics', 'build', 'ship']))
		exposed.value?.undo()
		await waitFor(() => expect(order(lastData(events))).toEqual(['basics', 'frame', 'build', 'ship']))
	})

	it('отключённый компонент: элементы правки выключены', async () => {
		await env.renderRoadmap({ ...EDIT, focused: 'frame', isDisabled: true })
		within(editor())
			.getAllByRole('button')
			.forEach(button => expect(button).toBeDisabled())
	})
})
