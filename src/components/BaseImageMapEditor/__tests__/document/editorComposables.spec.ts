import { mount } from '@vue/test-utils'
import { defineComponent, effectScope, h } from 'vue'
import { useEditorTool } from '../../model/canvas/useEditorTool'
import { useEditorPanel } from '../../model/panel/useEditorPanel'
import { useEditorAnnouncer, useEditorZoom } from '../../model/useEditorView'
import type { EditorContext } from '../../types/imageMapEditorInternal.types'
import type { ImageMapEditorProps } from '../../types/BaseImageMapEditor.types'
import type { ImageMapData, ImageMapObject } from '@components/BaseImageMap/types/imageMapData.types'

function fakeContext(data: ImageMapData, selected?: ImageMapObject): EditorContext {
	return {
		doc: {
			getData: () => data,
			apply: vi.fn(mutate => mutate(data)),
			begin: vi.fn(),
			commit: vi.fn(),
		},
		selection: { getLayer: () => data.layers[0], getSelected: () => selected, select: vi.fn() },
		announcer: { announce: vi.fn(), fail: vi.fn() },
		getStage: () => null,
		isDisabled: () => false,
	}
}

function inScope<T>(run: () => T): T {
	const scope = effectScope()
	const result = scope.run(run) as T
	scope.stop()
	return result
}

describe('useEditorAnnouncer', () => {
	it('до монтирования не пишет в live-регион, но сбрасывает ошибку импорта', () => {
		const emit = vi.fn()
		let announcer: ReturnType<typeof useEditorAnnouncer> | undefined
		mount(
			defineComponent({
				setup() {
					announcer = useEditorAnnouncer(emit)
					announcer.fail('Ошибка')
					announcer.announce('Готово')
					return () => h('div')
				},
			}),
		)
		expect(announcer?.status.value).toBe('')
		expect(announcer?.importError.value).toBe('')
		expect(emit).toHaveBeenCalledWith('import-error', 'Ошибка')
	})
})

describe('useEditorZoom', () => {
	it('без слоя у сцены нет размеров; zoomOut возвращает 100 %', () => {
		const zoom = useEditorZoom(() => undefined)
		expect(zoom.stageStyle.value).toEqual({})
		zoom.zoomIn()
		expect(zoom.zoom.value).toBe(1.25)
		zoom.zoomOut()
		expect(zoom.zoom.value).toBe(1)
		expect(zoom.isMinZoom.value).toBe(true)
	})
})

describe('useEditorTool', () => {
	const props = { tool: 'point' } as ImageMapEditorProps

	it('без слоя объект не создаётся', () => {
		const ctx = fakeContext({ version: 1, layers: [], objects: [] })
		const tool = inScope(() => useEditorTool(props, vi.fn(), ctx))
		tool.finishDraw({ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 })
		tool.create({})
		expect(ctx.doc.apply).not.toHaveBeenCalled()
	})

	it('выбор того же инструмента не эмитит update:tool', () => {
		const emit = vi.fn()
		const tool = inScope(() => useEditorTool(props, emit, fakeContext({ version: 1, layers: [], objects: [] })))
		tool.setTool('point')
		expect(emit).not.toHaveBeenCalled()
		tool.setTool('select')
		expect(emit).toHaveBeenCalledWith('update:tool', 'select')
		tool.finishDraw({ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 })
	})
})

describe('useEditorPanel', () => {
	it('правка поля объекта, которого уже нет в карте, ничего не меняет', () => {
		const ghost = { type: 'point', id: 'ghost', title: 'Нет', x: 0, y: 0 } as ImageMapObject
		const data: ImageMapData = { version: 1, layers: [{ id: 'l1', title: 'Слой', width: 1, height: 1 }], objects: [] }
		const ctx = fakeContext(data, ghost)
		const panel = inScope(() => useEditorPanel(ctx, vi.fn()))
		panel.setField('title', 'Новое')
		expect(ctx.doc.apply).toHaveBeenCalledOnce()
		expect(data.objects).toEqual([])
	})
})
