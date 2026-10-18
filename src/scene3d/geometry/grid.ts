import type { Color } from 'three'
import { Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from 'three'

const GRID_SIZE = 80
const GRID_LIFT = -0.002

const VERTEX = `varying vec2 vXZ;
void main() {
	vec4 world = modelMatrix * vec4(position, 1.0);
	vXZ = world.xz;
	gl_Position = projectionMatrix * viewMatrix * world;
}`

const FRAGMENT = `uniform vec3 uColor;
uniform float uOpacity;
uniform vec2 uFade;
varying vec2 vXZ;
float line(vec2 p) {
	vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p);
	return 1.0 - min(min(g.x, g.y), 1.0);
}
void main() {
	float a = max(line(vXZ) * 0.6, line(vXZ / 4.0) * 0.9);
	float fade = 1.0 - smoothstep(uFade.x, uFade.y, length(vXZ * vec2(0.9, 1.1)));
	gl_FragColor = vec4(uColor, a * fade * uOpacity);
	#include <colorspace_fragment>
}`

/** Материал сетки земли: линия каждую единицу и толще каждые четыре, затухание от центра `fade` (две границы) */
export function createGridMaterial(color: Color, fade: [number, number] = [12, 30]): ShaderMaterial {
	return new ShaderMaterial({
		transparent: true,
		depthWrite: false,
		uniforms: { uColor: { value: color.clone() }, uOpacity: { value: 1 }, uFade: { value: new Vector2(fade[0], fade[1]) } },
		vertexShader: VERTEX,
		fragmentShader: FRAGMENT,
	})
}

/** Плоскость сетки под сценой; материал и геометрию освобождает вызывающий (через кеш ресурсов или `disposeObject`) */
export function createGridMesh(material: ShaderMaterial, size = GRID_SIZE): Mesh {
	const geometry = new PlaneGeometry(size, size)
	geometry.rotateX(-Math.PI / 2)
	const mesh = new Mesh(geometry, material)
	mesh.position.y = GRID_LIFT
	mesh.renderOrder = 0
	return mesh
}
