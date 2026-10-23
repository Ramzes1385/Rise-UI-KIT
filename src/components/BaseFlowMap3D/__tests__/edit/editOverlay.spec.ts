import { Color, Scene } from 'three'
import { OrthographicCamera } from 'three'
import { effectScope, shallowRef } from 'vue'
import type { Mesh, MeshBasicMaterial } from 'three'
import { groundPoint } from '../../model/edit/drag/groundRay'
import { createEditOverlay } from '../../model/edit/drag/editOverlay'
import { useEditOverlay } from '../../model/edit/drag/useEditOverlay'
import type { FlowMap3DEditStage } from '../../types/internal/flowMap3dEdit.types'
import type { FlowMap3DContent, FlowMap3DPalette } from '../../types/internal/flowMap3dInternal.types'

const colors = { valid: new Color('#00ff00'), invalid: new Color('#ff0000'), link: new Color('#0000ff') }
const find = (scene: Scene) => scene.getObjectByName('edit-overlay')!

describe('editOverlay', () => {
	it('создаётся скрытым, призрак переноса показывает плиту и тело и красится по допустимости', () => {
		const scene = new Scene()
		const invalidate = vi.fn()
		const overlay = createEditOverlay(scene, invalidate)
		expect(find(scene).visible).toBe(false)
		overlay.setColors(colors)
		overlay.showGhost({ x: 1, y: 0, z: 2, size: 2, height: 1.5, isValid: true })
		const root = find(scene)
		expect(root.visible).toBe(true)
		expect(root.children.filter(child => child.visible)).toHaveLength(2)
		expect(invalidate).toHaveBeenCalledTimes(1)
		overlay.showGhost({ x: 1, y: 0, z: 2, size: 2, height: 1.5, isValid: false })
		expect(invalidate).toHaveBeenCalledTimes(2)
	})

	it('линия связи — с кольцом на цели и без него; допустимость меняет цвет кольца', () => {
		const scene = new Scene()
		const overlay = createEditOverlay(scene, vi.fn())
		const end = { from: { x: 0, y: 0, z: 0 }, to: { x: 3, y: 0, z: 3 } }
		overlay.showLink({ ...end, isValid: true, ring: { x: 3, y: 0, z: 3, size: 2 } })
		expect(find(scene).children.filter(child => child.visible)).toHaveLength(2)
		overlay.showLink({ ...end, isValid: false, ring: null })
		expect(find(scene).children.filter(child => child.visible)).toHaveLength(1)
	})

	it('скрытие гасит всё, освобождение убирает корень из сцены', () => {
		const scene = new Scene()
		const invalidate = vi.fn()
		const overlay = createEditOverlay(scene, invalidate)
		overlay.showGhost({ x: 0, y: 0, z: 0, size: 1, height: 1, isValid: true })
		overlay.hide()
		expect(find(scene).visible).toBe(false)
		overlay.dispose()
		expect(scene.getObjectByName('edit-overlay')).toBeUndefined()
	})
})

describe('useEditOverlay', () => {
	const GHOST = { x: 0, y: 0, z: 0, size: 1, height: 1 }
	const LIGHT = { 'var(--rise-primary)': '#2563eb', 'var(--rise-error)': '#dc2626', 'var(--rise-chart-2)': '#7c3aed' }
	const DARK = { 'var(--rise-primary)': '#60a5fa', 'var(--rise-error)': '#f87171', 'var(--rise-chart-2)': '#a78bfa' }

	function paletteOf(tokens: Record<string, string>) {
		return { palette: {}, resolve: vi.fn((css: string) => new Color(tokens[css])) } as unknown as FlowMap3DPalette
	}

	const contentOf = (palette: FlowMap3DPalette) => ({ getPalette: () => palette }) as unknown as FlowMap3DContent
	const plateHex = (scene: Scene) => ((find(scene).children[0] as Mesh).material as MeshBasicMaterial).color.getHexString()

	function setup() {
		const scene = new Scene()
		const content = shallowRef<FlowMap3DContent | null>(null)
		const stage = { scene: { content }, viewport: { scene, invalidate: vi.fn() } } as unknown as FlowMap3DEditStage
		const scope = effectScope()
		const getOverlay = scope.run(() => useEditOverlay(stage))!
		return { scene, content, scope, getOverlay }
	}

	it('пока сцена не построена, наложения нет и в сцену ничего не добавляется', () => {
		const { scene, getOverlay } = setup()
		expect(getOverlay()).toBeNull()
		expect(scene.getObjectByName('edit-overlay')).toBeUndefined()
	})

	it('одно наложение на все вызовы; цвета — из палитры сцены, стили само не читает', () => {
		const { scene, content, getOverlay } = setup()
		const palette = paletteOf(LIGHT)
		content.value = contentOf(palette)
		const styles = vi.spyOn(window, 'getComputedStyle')
		const overlay = getOverlay()!
		expect(getOverlay()).toBe(overlay)
		expect(styles).not.toHaveBeenCalled()
		expect(palette.resolve).toHaveBeenCalledWith('var(--rise-chart-2)')
		overlay.showGhost({ ...GHOST, isValid: true })
		expect(plateHex(scene)).toBe('2563eb')
		overlay.showGhost({ ...GHOST, isValid: false })
		expect(plateHex(scene)).toBe('dc2626')
	})

	it('после смены темы сцена отдаёт новую палитру — призрак красится её цветами', () => {
		const { scene, content, getOverlay } = setup()
		content.value = contentOf(paletteOf(LIGHT))
		getOverlay()!.showGhost({ ...GHOST, isValid: true })
		content.value = contentOf(paletteOf(DARK))
		getOverlay()!.showGhost({ ...GHOST, isValid: true })
		expect(plateHex(scene)).toBe('60a5fa')
	})

	it('конец области освобождает наложение и убирает его из сцены', () => {
		const { scene, content, scope, getOverlay } = setup()
		content.value = contentOf(paletteOf(LIGHT))
		getOverlay()
		scope.stop()
		expect(scene.getObjectByName('edit-overlay')).toBeUndefined()
	})
})

describe('groundPoint', () => {
	const rect = { left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => ({}) } as DOMRect

	it('луч сверху вниз попадает в плоскость нужной высоты', () => {
		const camera = new OrthographicCamera(-10, 10, 10, -10)
		camera.position.set(0, 10, 0)
		camera.lookAt(0, 0, 0)
		camera.updateMatrixWorld()
		camera.updateProjectionMatrix()
		const point = groundPoint({ camera, rect }, { x: 400, y: 300 }, 0)
		expect(point?.x).toBeCloseTo(0)
		expect(point?.z).toBeCloseTo(0)
	})

	it('луч, идущий параллельно земле, плоскости не касается; пустая область — нет точки', () => {
		const camera = new OrthographicCamera(-10, 10, 10, -10)
		camera.position.set(0, 5, 0)
		camera.lookAt(10, 5, 0)
		camera.updateMatrixWorld()
		camera.updateProjectionMatrix()
		expect(groundPoint({ camera, rect }, { x: 400, y: 300 }, 0)).toBeNull()
		expect(groundPoint({ camera, rect: { ...rect, width: 0, height: 0 } as DOMRect }, { x: 1, y: 1 }, 0)).toBeNull()
	})
})
