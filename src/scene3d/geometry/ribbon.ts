import type { Color } from 'three'
import { BufferGeometry, DoubleSide, Float32BufferAttribute, ShaderMaterial } from 'three'
import type { RibbonGeometry, RibbonMaterial, RibbonMaterialOptions, RibbonPoint } from '../types/internal/scene3dGeometry.types'

const MIN_MITER = 0.35

const VERTEX = `attribute vec3 offsetDir;
attribute float along;
uniform float uWidth;
varying float vAlong;
void main() {
	vAlong = along;
	vec3 p = position + offsetDir * (uWidth * 0.5);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`

const FRAGMENT = `uniform vec3 uColor;
uniform float uOpacity;
uniform float uDashed;
uniform float uDash;
uniform float uGap;
uniform float uOffset;
uniform float uProgress;
uniform float uLength;
varying float vAlong;
void main() {
	if (vAlong > uProgress * uLength) discard;
	if (uDashed > 0.5) {
		float m = mod(vAlong + uOffset, uDash + uGap);
		if (m > uDash) discard;
	}
	gl_FragColor = vec4(uColor, uOpacity);
	#include <colorspace_fragment>
}`

function unit(dx: number, dz: number): [number, number] {
	const length = Math.hypot(dx, dz) || 1
	return [dx / length, dz / length]
}

function neighbours(points: readonly RibbonPoint[], index: number, isClosed: boolean) {
	return {
		prev: points[index - 1] ?? (isClosed ? points[points.length - 2] : undefined),
		next: points[index + 1] ?? (isClosed ? points[1] : undefined),
	}
}

function tangentAt(points: readonly RibbonPoint[], index: number, isClosed: boolean): [number, number] {
	const point = points[index]
	const { prev, next } = neighbours(points, index, isClosed)
	const before = prev ? unit(point.x - prev.x, point.z - prev.z) : [0, 0]
	const after = next ? unit(next.x - point.x, next.z - point.z) : [0, 0]
	return unit(before[0] + after[0], before[1] + after[1])
}

function sideAt(points: readonly RibbonPoint[], index: number, isClosed: boolean): [number, number] {
	const point = points[index]
	const [tx, tz] = tangentAt(points, index, isClosed)
	let [px, pz] = [-tz, tx]
	const { prev, next } = neighbours(points, index, isClosed)
	if (prev && next) {
		const [dx, dz] = unit(next.x - point.x, next.z - point.z)
		const cos = Math.max(MIN_MITER, px * -dz + pz * dx)
		;[px, pz] = [px / cos, pz / cos]
	}
	return [px, pz]
}

/**
 * Лента по ломаной на земле: на каждую точку две вершины, сдвиг `offsetDir` (единичная нормаль с поправкой на излом,
 * не менее 0,35 от косинуса) в обе стороны, `along` — длина пути до точки. Замкнутая лента: последняя точка повторяет первую.
 * Полная длина — `geometry.userData.length`
 */
export function createRibbonGeometry(points: readonly RibbonPoint[], isClosed = false): RibbonGeometry {
	const position: number[] = []
	const offset: number[] = []
	const along: number[] = []
	const index: number[] = []
	let length = 0
	points.forEach((point, at) => {
		const [px, pz] = sideAt(points, at, isClosed)
		const previous = points[at - 1]
		if (previous) length += Math.hypot(point.x - previous.x, point.y - previous.y, point.z - previous.z)
		position.push(point.x, point.y, point.z, point.x, point.y, point.z)
		offset.push(px, 0, pz, -px, 0, -pz)
		along.push(length, length)
		if (at < points.length - 1) index.push(at * 2, at * 2 + 1, at * 2 + 2, at * 2 + 1, at * 2 + 3, at * 2 + 2)
	})
	const geometry = new BufferGeometry() as RibbonGeometry
	geometry.setAttribute('position', new Float32BufferAttribute(position, 3))
	geometry.setAttribute('offsetDir', new Float32BufferAttribute(offset, 3))
	geometry.setAttribute('along', new Float32BufferAttribute(along, 1))
	geometry.setIndex(index)
	geometry.userData = { length }
	return geometry
}

/** Материал ленты: цвет, ширина, пунктир и доля пути `uProgress` (0–1) от начала ленты; длину пути задаёт `setRibbonLength` */
export function createRibbonMaterial(options: RibbonMaterialOptions): RibbonMaterial {
	const dash = options.dash
	const color: Color = options.color.clone()
	return new ShaderMaterial({
		transparent: true,
		depthWrite: false,
		side: DoubleSide,
		uniforms: {
			uColor: { value: color },
			uOpacity: { value: options.opacity ?? 1 },
			uWidth: { value: options.width },
			uDashed: { value: dash ? 1 : 0 },
			uDash: { value: dash?.dash ?? 0.24 },
			uGap: { value: dash?.gap ?? 0.16 },
			uOffset: { value: 0 },
			uProgress: { value: 1 },
			uLength: { value: 1 },
		},
		vertexShader: VERTEX,
		fragmentShader: FRAGMENT,
	})
}

/** Сообщить материалу длину пути ленты, чтобы `uProgress` отсчитывался от неё */
export function setRibbonLength(material: RibbonMaterial, geometry: RibbonGeometry): void {
	material.uniforms.uLength.value = geometry.userData.length || 1
}
