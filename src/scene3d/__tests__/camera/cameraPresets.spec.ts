import { Vector3 } from 'three'
import { CAMERA_LIMITS } from '../../camera/cameraPose'
import { ISO_ELEVATION, nearestIsoPreset, presetCameraKind, presetPose, quarterTurnPose } from '../../camera/cameraPresets'

const CENTER = new Vector3(1, 2, 3)
const ISO_AZIMUTH = Math.PI / 4
const ISO_POLAR = ((90 - ISO_ELEVATION) * Math.PI) / 180

describe('cameraPresets', () => {
	it('ISO_ELEVATION — истинная изометрия 35,264°', () => {
		expect(ISO_ELEVATION).toBeCloseTo(35.264, 3)
	})

	it('presetCameraKind: перспектива — perspective, остальные — изометрия', () => {
		expect(presetCameraKind('perspective')).toBe('perspective')
		for (const preset of ['iso', 'iso-90', 'iso-180', 'iso-270', 'top'] as const) expect(presetCameraKind(preset)).toBe('isometric')
	})

	it('presetPose: iso* поворачивают на четверти от 45°, масштаб 1', () => {
		;(['iso', 'iso-90', 'iso-180', 'iso-270'] as const).forEach((preset, quarter) => {
			const pose = presetPose(preset, CENTER, 123)
			expect(pose.slice(0, 3)).toEqual([1, 2, 3])
			expect(pose[3]).toBeCloseTo(ISO_AZIMUTH + (Math.PI / 2) * quarter)
			expect(pose[4]).toBeCloseTo(ISO_POLAR)
			expect(pose[5]).toBe(1)
		})
	})

	it('presetPose: top — сверху с сохранённым азимутом, perspective — изометрический угол с текущим азимутом', () => {
		const top = presetPose('top', CENTER, 2)
		expect([top[3], top[4], top[5]]).toEqual([2, CAMERA_LIMITS.minPolar, 1])
		const perspective = presetPose('perspective', CENTER, 2)
		expect([perspective[3], perspective[5]]).toEqual([2, 1])
		expect(perspective[4]).toBeCloseTo(ISO_POLAR)
		expect(presetPose('top', CENTER)[3]).toBeCloseTo(ISO_AZIMUTH)
	})

	it('nearestIsoPreset: ближайшая четверть, в том числе через полный оборот и отрицательные углы', () => {
		expect(nearestIsoPreset(ISO_AZIMUTH)).toBe('iso')
		expect(nearestIsoPreset(ISO_AZIMUTH + Math.PI / 2 + 0.2)).toBe('iso-90')
		expect(nearestIsoPreset(ISO_AZIMUTH + Math.PI)).toBe('iso-180')
		expect(nearestIsoPreset(ISO_AZIMUTH - Math.PI / 2)).toBe('iso-270')
		expect(nearestIsoPreset(ISO_AZIMUTH + 2 * Math.PI)).toBe('iso')
	})

	it('quarterTurnPose: к ближайшему углу изометрии и на четверть дальше; остальное сохраняется', () => {
		const pose = [1, 2, 3, ISO_AZIMUTH + 0.2, 0.9, 2] as [number, number, number, number, number, number]
		const right = quarterTurnPose(pose, 1)
		expect(right[3]).toBeCloseTo(ISO_AZIMUTH + Math.PI / 2)
		expect([right[0], right[1], right[2], right[4], right[5]]).toEqual([1, 2, 3, 0.9, 2])
		expect(quarterTurnPose(pose, -1)[3]).toBeCloseTo(ISO_AZIMUTH - Math.PI / 2)
	})
})
