import { computed, shallowRef } from 'vue'
import { editText } from '../data/roadmapLabels'
import { findRoadmapEntity } from '../changes/roadmapFind'
import { applyRoadmapChanges } from '../changes/roadmapChanges'
import { mergeRoadmapTemplates } from '../data/roadmapTemplates'
import type { RoadmapData } from '../../../types/roadmapData.types'
import type { RoadmapChange } from '../../../types/roadmapEdit.types'
import { announceRoadmap, createRoadmapRunner } from './roadmapExecutor'
import { createLinkMethods, createStructureMethods } from './roadmapEditMethods'
import { useCommandHistory } from '@composables/editor/useCommandHistory/useCommandHistory'
import type {
	RoadmapEditContext,
	RoadmapEditController,
	RoadmapEditState,
	RoadmapRejection,
} from '../../../types/internal/roadmapEdit.internal.types'

function createState({ data, emit }: RoadmapEditContext): RoadmapEditState {
	return {
		rejection: shallowRef<RoadmapRejection | null>(null),
		liveText: shallowRef(''),
		draft: shallowRef<RoadmapData | null>(null),
		history: useCommandHistory<RoadmapChange>({
			apply: changes => {
				data.value = applyRoadmapChanges(data.value, changes)
				emit('update:data', data.value)
			},
		}),
	}
}

function stepper(state: RoadmapEditState, direction: 'undo' | 'redo'): () => boolean {
	return () => {
		const text = direction === 'undo' ? state.history.state.value.undoLabel : state.history.state.value.redoLabel
		const done = state.history[direction]()
		if (done && text !== undefined) announceRoadmap(state, editText(direction === 'undo' ? 'UNDONE' : 'REDONE', { label: text }))
		return done
	}
}

export function createRoadmapEdit(context: RoadmapEditContext): RoadmapEditController {
	const state = createState(context)
	const run = createRoadmapRunner(context, state)
	const { history } = state
	return {
		...state,
		...createStructureMethods(context, run),
		...createLinkMethods(context, run),
		hooks: context.hooks,
		viewData: computed(() => state.draft.value ?? context.data.value),
		announce: text => announceRoadmap(state, text),
		dismissRejection: () => (state.rejection.value = null),
		run,
		applyChanges: (changes, label) => run({ name: 'review', label, build: () => changes }),
		templates: computed(() => mergeRoadmapTemplates(context.props.templates)),
		find: id => findRoadmapEntity(context.data.value, id),
		undo: stepper(state, 'undo'),
		redo: stepper(state, 'redo'),
		transact: async (name, work) => {
			try {
				await history.transact(name, async () => void (await work()))
				return true
			} catch {
				return false
			}
		},
	}
}
