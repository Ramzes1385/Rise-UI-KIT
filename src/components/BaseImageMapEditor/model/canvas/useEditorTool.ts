import { ref, shallowRef, watch } from 'vue'
import { formatMessage } from '@/locales/state'
import { allIds, createId } from '../document/editorOps'
import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import { clampPoint, createShape, dragBounds } from '../geometry/editorGeometry'
import type { EditorContext, EditorDrag, EditorPoint } from '../../types/imageMapEditorInternal.types'
import type { ImageMapObject, ImageMapObjectType } from '@components/BaseImageMap/types/imageMapData.types'
import type { BaseImageMapEditorEmits, ImageMapEditorProps, ImageMapEditorTool } from '../../types/BaseImageMapEditor.types'

const CLOSE_DISTANCE = 0.015

export function typeLabel(type: ImageMapObjectType): string {
	const labels: Record<ImageMapObjectType, string> = {
		point: UI_IMAGE_MAP_EDITOR.TYPE_POINT,
		rect: UI_IMAGE_MAP_EDITOR.TYPE_RECT,
		ellipse: UI_IMAGE_MAP_EDITOR.TYPE_ELLIPSE,
		polygon: UI_IMAGE_MAP_EDITOR.TYPE_POLYGON,
		svg: UI_IMAGE_MAP_EDITOR.TYPE_SVG,
	}
	return labels[type]
}

function useCreate(ctx: EditorContext) {
	return function create(shape: Partial<ImageMapObject>): void {
		const layer = ctx.selection.getLayer()
		if (!layer || !shape.type) return
		const type = shape.type
		const data = ctx.doc.getData()
		const id = createId(type, allIds(data))
		const count = data.objects.filter(object => object.type === type).length + 1
		const title = formatMessage(UI_IMAGE_MAP_EDITOR.NEW_OBJECT, { type: typeLabel(type), n: count })
		ctx.doc.apply(draft => {
			draft.objects.push({ ...shape, id, title, layer: layer.id } as ImageMapObject)
		})
		ctx.selection.select(id)
		ctx.announcer.announce(formatMessage(UI_IMAGE_MAP_EDITOR.CREATED, { title }))
	}
}

function isNear(a: EditorPoint, b: [number, number] | undefined): boolean {
	return Boolean(b) && Math.hypot(a.x - (b as [number, number])[0], a.y - (b as [number, number])[1]) < CLOSE_DISTANCE
}

function usePolygonDraft(ctx: EditorContext, create: (shape: Partial<ImageMapObject>) => void) {
	const points = ref<[number, number][]>([])
	function finish(): boolean {
		if (points.value.length < 3) {
			ctx.announcer.announce(UI_IMAGE_MAP_EDITOR.POLYGON_TOO_SHORT)
			return false
		}
		const shape = { type: 'polygon' as const, points: points.value }
		points.value = []
		create(shape)
		return true
	}
	return {
		points,
		finish,
		add(point: EditorPoint): void {
			if (points.value.length >= 3 && isNear(point, points.value[0])) {
				finish()
				return
			}
			if (isNear(point, points.value[points.value.length - 1])) return
			const vertex = clampPoint(point)
			points.value = [...points.value, [vertex.x, vertex.y]]
			ctx.announcer.announce(formatMessage(UI_IMAGE_MAP_EDITOR.VERTEX_ADDED, { n: points.value.length }))
		},
		removeLast(): void {
			points.value = points.value.slice(0, -1)
		},
	}
}

export function useEditorTool(props: ImageMapEditorProps, emit: BaseImageMapEditorEmits, ctx: EditorContext) {
	const tool = ref<ImageMapEditorTool>(props.tool)
	const drag = shallowRef<EditorDrag | null>(null)
	const create = useCreate(ctx)
	const polygon = usePolygonDraft(ctx, create)
	const keyStart = ref<EditorPoint | null>(null)

	function cancel(): void {
		drag.value = null
		keyStart.value = null
		polygon.points.value = []
	}

	watch(() => ctx.selection.getLayer()?.id, cancel)
	watch(() => ctx.doc.getData(), cancel)

	watch(
		() => props.tool,
		value => {
			tool.value = value
			cancel()
		},
	)

	return {
		tool,
		drag,
		keyStart,
		polygon,
		create,
		cancel,
		setTool(value: ImageMapEditorTool): void {
			if (tool.value === value) return
			tool.value = value
			cancel()
			emit('update:tool', value)
		},
		finishDraw(start: EditorPoint, end: EditorPoint): void {
			if (tool.value === 'point') create({ type: 'point', ...clampPoint(start) })
			if (tool.value === 'rect' || tool.value === 'ellipse') create(createShape(tool.value, dragBounds(start, end)))
		},
	}
}
