import { collectPresetWordGroups, pickByWords } from '@/scene3d/models/keywords'
import { MODEL3D_PRESETS, fallbackForKind, isModel3DPreset } from '@/scene3d/models/presets'

export function servicesIcon(node: { label?: string; tags?: readonly string[]; kind?: string; isExternal?: boolean }): string {
	const text = [node.label ?? '', ...(node.tags ?? [])].join(' ')
	const found = pickByWords(text, collectPresetWordGroups(['service']))
	if (found && isModel3DPreset(found)) return MODEL3D_PRESETS[found].icon
	return MODEL3D_PRESETS[node.isExternal ? 'cloud' : fallbackForKind(node.kind)].icon
}
