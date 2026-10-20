import { computed, ref } from 'vue'
import { modelTitle } from '@/scene3d/models/modelTitles'
import { useScene3DModels } from '@/scene3d/models/useModels3D'
import { MODEL3D_PRESET_IDS } from '@/scene3d/types/model3d.types'
import type { Model3DDefinitions } from '@/scene3d/types/model3d.types'
import { MODEL3D_PRESETS, fallbackForKind } from '@/scene3d/models/presets'
import type { FlowMap3DPaletteEntry, FlowMap3DPaletteGroups, FlowMap3DPaletteOptions } from '../../../types/internal/flowMap3dEdit.types'

const DEFAULT_ICON = 'server'

const EXPLICIT_PATH = /^(\.{1,2}\/|\/)/
const MODEL_FILE = /\.(glb|gltf)([?#].*)?$/i

const SCHEME = /^([a-z][a-z0-9+.-]*):/i

function isWebAddress(text: string): boolean {
	try {
		return Boolean(new URL(text).hostname)
	} catch {
		return false
	}
}

export function isModelUrl(value: string): boolean {
	const text = value.trim()
	if (!text || /\s/.test(text)) return false
	const scheme = SCHEME.exec(text)?.[1]?.toLowerCase()
	if (scheme) return (scheme === 'http' || scheme === 'https') && isWebAddress(text)
	return EXPLICIT_PATH.test(text) || MODEL_FILE.test(text)
}

function iconOf(key: string): string {
	return (MODEL3D_PRESETS as Record<string, { icon: string } | undefined>)[key]?.icon ?? DEFAULT_ICON
}

export function useModelPalette(options: FlowMap3DPaletteOptions) {
	const isOpen = ref(false)
	const url = ref('')
	const appModels = useScene3DModels()
	const definitions = (): Model3DDefinitions => ({ ...appModels, ...options.getModels() })

	function keyOf(id: string): string {
		const node = options.model.graph.value.nodes.get(id)
		const kind = node ? options.model.nodeKind(node) : undefined
		return node?.model3d?.model ?? options.getResolved(id) ?? kind?.model3d ?? fallbackForKind(node?.kind)
	}

	const titleOfKey = (key: string): string => modelTitle(key, definitions()[key])
	const entry = (key: string, current: string | null): FlowMap3DPaletteEntry => ({
		key,
		title: titleOfKey(key),
		icon: iconOf(key),
		isCurrent: key === current,
	})

	const groups = computed((): FlowMap3DPaletteGroups => {
		const selected = options.getSelected()
		const current = selected ? keyOf(selected) : null
		const used = [...new Set([...options.model.graph.value.nodes.keys()].map(keyOf))]
		const rest = [...new Set([...MODEL3D_PRESET_IDS, ...Object.keys(definitions())])].filter(key => !used.includes(key))
		return { scheme: used.map(key => entry(key, current)), more: rest.map(key => entry(key, current)) }
	})

	return {
		isOpen,
		url,
		groups,
		currentTitle: computed(() => groups.value.scheme.find(item => item.isCurrent)?.title ?? ''),
		toggle: () => void (isOpen.value = !isOpen.value),
		close: () => void (isOpen.value = false),
		keyOf,
		titleOf: (id: string): string => titleOfKey(keyOf(id)),
	}
}
