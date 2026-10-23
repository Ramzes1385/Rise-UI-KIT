import type { Box3 } from 'three'
import type { SceneLights } from '../types/internal/scene3dGeometry.types'
import { Color, DirectionalLight, Group, HemisphereLight, Vector3 } from 'three'

const SHADOW_MAP_SIZE = 1024
const KEY_DIRECTION = new Vector3(-0.45, 1, 0.7).normalize()
const LIGHT = { key: 1.15, fill: 0.9, sky: '#ffffff', ground: '#c9d1dc' }
const DARK = { key: 0.8, fill: 0.55, sky: '#aebbd6', ground: '#1b2230' }

/** Свет сцены: ключевой направленный (с тенью) и полусферический заполняющий; две предустановки — светлая и тёмная */
export function createSceneLights(isDark: boolean): SceneLights {
	const group = new Group()
	const key = new DirectionalLight('#ffffff', LIGHT.key)
	key.castShadow = true
	key.shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE)
	const fill = new HemisphereLight('#ffffff', LIGHT.ground, LIGHT.fill)
	group.add(key, key.target, fill)

	function setDark(dark: boolean): void {
		const preset = dark ? DARK : LIGHT
		key.intensity = preset.key
		fill.intensity = preset.fill
		fill.color = new Color(preset.sky)
		fill.groundColor = new Color(preset.ground)
	}

	function fitShadow(bounds: Box3): void {
		const center = bounds.getCenter(new Vector3())
		const radius = Math.max(bounds.getSize(new Vector3()).length() / 2, 1)
		const camera = key.shadow.camera
		Object.assign(camera, { left: -radius, right: radius, top: radius, bottom: -radius, near: 0.1, far: radius * 6 })
		camera.updateProjectionMatrix()
		key.target.position.copy(center)
		key.position.copy(center).addScaledVector(KEY_DIRECTION, radius * 3)
		key.target.updateMatrixWorld()
	}

	setDark(isDark)
	return { group, key, fill, setDark, fitShadow, dispose: () => key.shadow.dispose() }
}
