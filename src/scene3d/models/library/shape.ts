/** Утилиты: модель `shape` — фигура 2D-вида (прямоугольник, ромб, круг…), выдавленная вверх, со значком-меткой сверху; для узлов нотаций без своей модели */

import { Shape, Vector3 } from 'three'
import { createKit, roundedRectShape } from './parts'
import type { Model3DContext, Model3DNode } from '../../types/model3d.types'
import { MODEL3D_SHAPES, type Model3DShape } from '../../types/internal/model3dInternal.types'

const WIDTH = 1.35
const DEPTH = 0.9
const HEIGHT = 0.28

function polygon(points: ReadonlyArray<readonly [number, number]>): Shape {
	const shape = new Shape()
	points.forEach(([x, y], index) => (index ? shape.lineTo(x, y) : shape.moveTo(x, y)))
	return shape
}

function circle(radius: number): Shape {
	const shape = new Shape()
	shape.absarc(0, 0, radius, 0, Math.PI * 2, false)
	return shape
}

function documentShape(): Shape {
	const shape = new Shape()
	const x = WIDTH / 2
	const y = DEPTH / 2
	shape.moveTo(-x, -y + 0.1)
	shape.lineTo(-x, y)
	shape.lineTo(x, y)
	shape.lineTo(x, -y + 0.1)
	shape.quadraticCurveTo(x / 2, -y - 0.12, 0, -y + 0.1)
	shape.quadraticCurveTo(-x / 2, -y + 0.32, -x, -y + 0.1)
	return shape
}

/** Контур фигуры по её имени; неизвестное имя — скруглённый прямоугольник */
export function shapeOutline(name: string): Shape {
	const x = WIDTH / 2
	const y = DEPTH / 2
	const outlines: Record<Model3DShape, () => Shape> = {
		rect: () => roundedRectShape(WIDTH, DEPTH, 0.04),
		rounded: () => roundedRectShape(WIDTH, DEPTH, 0.22),
		diamond: () =>
			polygon([
				[0, y + 0.12],
				[x * 0.75, 0],
				[0, -y - 0.12],
				[-x * 0.75, 0],
			]),
		circle: () => circle(DEPTH / 2 + 0.06),
		hexagon: () =>
			polygon([
				[-x, 0],
				[-x / 2, y],
				[x / 2, y],
				[x, 0],
				[x / 2, -y],
				[-x / 2, -y],
			]),
		parallelogram: () =>
			polygon([
				[-x + 0.24, y],
				[x, y],
				[x - 0.24, -y],
				[-x, -y],
			]),
		document: documentShape,
		cylinder: () => roundedRectShape(WIDTH, DEPTH, 0.04),
	}
	return (MODEL3D_SHAPES as readonly string[]).includes(name) ? outlines[name as Model3DShape]() : outlines.rounded()
}

/** `shape`: фигура из `node.source.shape` (`rect`, `rounded`, `diamond`, `circle`, `hexagon`, `parallelogram`, `document`, `cylinder`), выдавленная вверх; сверху метка `accent` — место значка нотации */
export function buildShape(node: Model3DNode, context: Model3DContext) {
	const kit = createKit('shape', context)
	const name = typeof node.source.shape === 'string' ? node.source.shape : 'rounded'
	if (name === 'cylinder') kit.mesh(kit.cylinder('plate', [0.5, 0.5, HEIGHT], 24), 'body', { y: HEIGHT / 2 })
	else kit.mesh(kit.extrude(`plate-${name}`, shapeOutline(name), { height: HEIGHT, bevel: 0.03 }), 'body')
	kit.mesh(kit.cylinder('mark', [0.17, 0.17, 0.04], 20), 'accent', { y: HEIGHT + 0.02 })
	return kit.finish({ anchor: new Vector3(0, HEIGHT + 0.2, 0) })
}
