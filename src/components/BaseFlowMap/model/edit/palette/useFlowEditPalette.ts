import { computed, ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { getFlowEditing } from '../useFlowEditing'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { useFlowMapContext } from '../../context/flowContext'
import { PALETTE_MIME } from '../../../types/internal/edit/flowEdit.types'
import { addFollowing, placeNode, viewCenter } from '../actions/editPlace'

function groupTitle(id: string): string {
	const key = `PALETTE_GROUP_${id.toUpperCase().replace(/-/g, '_')}`
	return (UI_FLOW_EDITOR as Record<string, string>)[key] ?? id
}

export function useFlowEditPalette() {
	const { model } = useFlowMapContext()
	const { context, hasPalette } = getFlowEditing(model)
	const query = ref('')
	const groups = computed(() => {
		const text = query.value.trim().toLowerCase()
		const table = new Map<string, { id: string; title: string; items: { id: string; label: string; icon?: string; aria: string }[] }>()
		for (const [id, def] of Object.entries(model.notation.value.nodeKinds)) {
			const label = def.label()
			if (!def.paletteGroup || (text && !label.toLowerCase().includes(text))) continue
			const group = table.get(def.paletteGroup) ?? { id: def.paletteGroup, title: groupTitle(def.paletteGroup), items: [] }
			group.items.push({ id, label, icon: def.icon, aria: formatMessage(UI_FLOW_EDITOR.PALETTE_ADD, { name: label }) })
			table.set(def.paletteGroup, group)
		}
		return [...table.values()]
	})
	return {
		isVisible: hasPalette,
		query,
		groups,
		title: UI_FLOW_EDITOR.PALETTE,
		searchLabel: UI_FLOW_EDITOR.PALETTE_SEARCH,
		empty: UI_FLOW_EDITOR.PALETTE_EMPTY,
		hint: UI_FLOW_EDITOR.PALETTE_HINT,
		add: (kind: string) => void addFollowing(context, kind),
		place: (kind: string) => void placeNode(context, { kind, at: viewCenter(context) }),
		drag: (kind: string, event: DragEvent) => {
			event.dataTransfer?.setData(PALETTE_MIME, kind)
			event.dataTransfer?.setData('text/plain', kind)
		},
	}
}
