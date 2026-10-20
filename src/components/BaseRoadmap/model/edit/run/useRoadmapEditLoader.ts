import type { ComputedRef } from 'vue'
import { createRoadmapLazy } from './roadmapLazy'
import { getCurrentScope, shallowRef, watch } from 'vue'
import type { RoadmapEditContext, RoadmapEditController, RoadmapEditLoader } from '../../../types/internal/roadmapEdit.internal.types'

export function useRoadmapEditLoader(context: RoadmapEditContext, isEditing: ComputedRef<boolean>): RoadmapEditLoader {
	const controller = shallowRef<RoadmapEditController | null>(null)
	const scope = getCurrentScope()
	const { load, error, retry } = createRoadmapLazy(
		() =>
			import('./useRoadmapEdit').then(({ createRoadmapEdit }) => {
				if (scope && !scope.active) return controller.value as RoadmapEditController
				controller.value = scope?.run(() => createRoadmapEdit(context)) ?? createRoadmapEdit(context)
				return controller.value
			}),
		'edit',
	)
	watch(
		isEditing,
		value => {
			if (value) load().catch(() => undefined)
		},
		{ immediate: true },
	)
	return {
		controller,
		load,
		error,
		retry,
		methods: {
			addStage: (stage, index) => load().then(edit => edit.addStage(stage, index)),
			addTopic: (stage, topic, index) => load().then(edit => edit.addTopic(stage, topic, index)),
			move: (id, to) => load().then(edit => edit.move(id, to)),
			update: (id, patch) => load().then(edit => edit.update(id, patch)),
			remove: ids => load().then(edit => edit.remove(ids)),
			addRequirement: (id, requires) => load().then(edit => edit.addRequirement(id, requires)),
			removeRequirement: (id, requires) => load().then(edit => edit.removeRequirement(id, requires)),
			insertTemplate: (template, to) => load().then(edit => edit.insertTemplate(template, to)),
			transact: (label, run) => load().then(edit => edit.transact(label, run)),
			importJson: input => load().then(edit => edit.importJson(input)),
			undo: () => controller.value?.undo() ?? false,
			redo: () => controller.value?.redo() ?? false,
			exportJson: () => JSON.stringify(context.data.value, null, 2),
		},
	}
}
