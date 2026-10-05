import { warn } from '@/locales/warn'
import { UI_IMAGE_MAP_3D } from '@/locales/messages'
import { isDevelopmentBuild } from '@utils/seo/structuredDataUtils'
import type { ImageMap3DData, ImageMap3DLayer } from '../types/imageMap3dData.types'
import type { ImageMap3DFieldRule, ImageMap3DIssue } from '../types/internal/imageMap3dInternal.types'

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

const RULES: Record<ImageMap3DFieldRule, (value: unknown) => boolean> = {
	number: isNumber,
	positive: value => isNumber(value) && value > 0,
	nonNegative: value => isNumber(value) && value >= 0,
	text: value => typeof value === 'string' && value.trim() !== '',
	vector: value => Array.isArray(value) && value.length === 3 && value.every(isNumber),
	model: isRecord,
	object: isRecord,
}

const EXPECTED: Record<ImageMap3DFieldRule, () => string> = {
	number: () => UI_IMAGE_MAP_3D.EXPECT_NUMBER,
	positive: () => UI_IMAGE_MAP_3D.EXPECT_POSITIVE,
	nonNegative: () => UI_IMAGE_MAP_3D.EXPECT_NON_NEGATIVE,
	text: () => UI_IMAGE_MAP_3D.EXPECT_TEXT,
	vector: () => UI_IMAGE_MAP_3D.EXPECT_VECTOR,
	model: () => UI_IMAGE_MAP_3D.EXPECT_MODEL,
	object: () => UI_IMAGE_MAP_3D.EXPECT_OBJECT,
}

function check(issues: ImageMap3DIssue[], issue: ImageMap3DIssue): boolean {
	if (issue.value === undefined || RULES[issue.rule](issue.value)) return true
	issues.push(issue)
	return false
}

function checkLayer(issues: ImageMap3DIssue[], layer: ImageMap3DLayer): void {
	const path = `layers["${layer.id}"]`
	check(issues, { path: `${path}.elevation`, value: layer.elevation, rule: 'number' })
	if (!check(issues, { path: `${path}.model`, value: layer.model, rule: 'model' }) || !layer.model) return
	check(issues, { path: `${path}.model.url`, value: layer.model.url ?? null, rule: 'text' })
	check(issues, { path: `${path}.model.scale`, value: layer.model.scale, rule: 'positive' })
	check(issues, { path: `${path}.model.position`, value: layer.model.position, rule: 'vector' })
	check(issues, { path: `${path}.model.rotationY`, value: layer.model.rotationY, rule: 'number' })
}

export function validate3dData(data: ImageMap3DData): ImageMap3DIssue[] {
	const issues: ImageMap3DIssue[] = []
	data.layers.forEach(layer => checkLayer(issues, layer))
	data.objects.forEach(object => {
		check(issues, { path: `objects["${object.id}"].height3d`, value: object.height3d, rule: 'nonNegative' })
		check(issues, { path: `objects["${object.id}"].meshName`, value: object.meshName, rule: 'text' })
	})
	check(issues, { path: 'scene3d', value: data.scene3d, rule: 'object' })
	if (!isRecord(data.scene3d)) return issues
	check(issues, { path: 'scene3d.floorGap', value: data.scene3d.floorGap, rule: 'nonNegative' })
	check(issues, { path: 'scene3d.floorThickness', value: data.scene3d.floorThickness, rule: 'positive' })
	check(issues, { path: 'scene3d.objectHeight', value: data.scene3d.objectHeight, rule: 'nonNegative' })
	return issues
}

function formatValue(value: unknown): string {
	return typeof value === 'string' ? `"${value}"` : String(JSON.stringify(value) ?? value)
}

export function warn3dData(data: ImageMap3DData): void {
	if (!isDevelopmentBuild()) return
	validate3dData(data).forEach(issue =>
		warn(UI_IMAGE_MAP_3D.INVALID_FIELD, { path: issue.path, value: formatValue(issue.value), expected: EXPECTED[issue.rule]() }),
	)
}
