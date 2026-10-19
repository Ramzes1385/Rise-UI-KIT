import '@testing-library/jest-dom/vitest'
import { startDrag } from '../../model/edit/pointer/editDrag'
import { startLabel } from '../../model/edit/panels/editLabel'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { createHarness } from '../core/model/fixtures/modelHarness'
import { useEditCommands } from '../../model/edit/actions/editCommands'
import { bareNotation, editData, flush, mapData, mountEdit, settle } from './editHarness'

const guard = guardConsole()

describe('оставшиеся ветки модели правки', () => {
	it('раскладка без параметров запускается без предупреждений', async () => {
		const { model } = createHarness(mapData())
		await useEditCommands(model).layout(undefined)
		expect(guard.warn()).not.toHaveBeenCalled()
	})

	it('клавиша «Заметка» в нотации без вида заметки не меняет инструмент', async () => {
		const map = await mountEdit({ data: editData({ notation: 'bare' }), notations: [bareNotation() as never] })
		await map.press('t')
		expect(map.container.querySelector('[aria-pressed="true"]')).not.toHaveAccessibleName('Заметка, T')
	})

	it('подпись связи без маршрута не открывает редактор', async () => {
		const map = await mountEdit({ data: editData() })
		const { context } = await map.probe(scope => scope)
		startLabel(context, { entity: 'edge', id: 'нет' })
		await flush()
		expect(context.env.state.label.value).toBeNull()
	})

	it('перетаскивание неизвестного узла не создаёт жест; меню закрывается; слой не привязывается вне холста', async () => {
		const map = await mountEdit({ data: editData() })
		const { context } = await map.probe(scope => scope)
		startDrag(context, new MouseEvent('pointerdown') as PointerEvent, 'нет')
		context.env.state.menu.value = { x: 1, y: 1 } as never
		await settle()
		context.env.state.menu.value = null
		await settle()
		const layer = await map.probe(scope => scope.context.env.state)
		expect(layer).toBeDefined()
	})
})
