import type { Color } from 'three'
import { DoubleSide, ShaderMaterial } from 'three'

const VERTEX = `attribute vec3 offsetDir;
attribute float along;
uniform float uWidth;
varying float vAlong;
void main() {
	vAlong = along;
	vec3 p = position + offsetDir * (uWidth * 0.5);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`

const FRAGMENT = `uniform vec3 uFrom;
uniform vec3 uTo;
uniform float uProgress;
uniform float uLength;
varying float vAlong;
void main() {
	float limit = uProgress * uLength;
	if (vAlong > limit) discard;
	float share = clamp(vAlong / max(limit, 0.0001), 0.0, 1.0);
	gl_FragColor = vec4(mix(uFrom, uTo, share), 1.0);
	#include <colorspace_fragment>
}`

export function createRoadMaterial(from: Color, to: Color, width: number): ShaderMaterial {
	return new ShaderMaterial({
		side: DoubleSide,
		depthWrite: false,
		polygonOffset: true,
		polygonOffsetFactor: -2,
		polygonOffsetUnits: -2,
		uniforms: {
			uFrom: { value: from.clone() },
			uTo: { value: to.clone() },
			uWidth: { value: width },
			uProgress: { value: 1 },
			uLength: { value: 1 },
		},
		vertexShader: VERTEX,
		fragmentShader: FRAGMENT,
	})
}
