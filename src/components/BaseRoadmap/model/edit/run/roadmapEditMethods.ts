import { roadmapTitle } from '../changes/roadmapFind'
import { importRoadmap } from '../data/roadmapImport'
import { buildTemplate } from '../changes/roadmapInsert'
import { editText, moveLabel } from '../data/roadmapLabels'
import { mergeRoadmapTemplates } from '../data/roadmapTemplates'
import {
	buildAddStage,
	buildAddTopic,
	buildMove,
	buildRemove,
	buildReplace,
	buildRequirement,
	buildUpdate,
} from '../changes/roadmapCommands'
import type {
	RoadmapEditContext,
	RoadmapLinkMethods,
	RoadmapRunner,
	RoadmapStructureMethods,
} from '../../../types/internal/roadmapEdit.internal.types'

export function createStructureMethods({ data }: RoadmapEditContext, run: RoadmapRunner): RoadmapStructureMethods {
	const title = (id: string): string => roadmapTitle(data.value, id)
	return {
		addStage: (stage, index) =>
			run({
				name: 'addStage',
				label: editText('LABEL_ADD_STAGE', { title: stage.title }),
				build: now => buildAddStage(now, stage, index),
			}),
		addTopic: (stage, topic, index) =>
			run({
				name: 'addTopic',
				label: editText('LABEL_ADD_TOPIC', { title: topic.title }),
				build: now => buildAddTopic(now, { stage, topic, index }),
			}),
		move: (id, to) => run({ name: 'move', label: moveLabel(data.value, id, to), build: now => buildMove(now, id, to) }),
		update: (id, patch) =>
			run({ name: 'update', label: editText('LABEL_UPDATE', { title: title(id) }), build: now => buildUpdate(now, id, patch) }),
		remove: ids =>
			run({
				name: 'remove',
				label:
					ids.length === 1
						? editText('LABEL_REMOVE', { title: title(ids[0]) })
						: editText('LABEL_REMOVE_MANY', { n: ids.length }),
				build: now => buildRemove(now, ids),
			}),
	}
}

export function createLinkMethods({ props, data }: RoadmapEditContext, run: RoadmapRunner): RoadmapLinkMethods {
	const title = (id: string): string => roadmapTitle(data.value, id)
	const link = (name: string, key: 'LABEL_REQUIRE_ADD' | 'LABEL_REQUIRE_REMOVE', isAdd: boolean) => (id: string, target: string) =>
		run({
			name,
			label: editText(key, { from: title(target), to: title(id) }),
			build: now => buildRequirement(now, { id, target, isAdd }),
		})
	return {
		addRequirement: link('addRequirement', 'LABEL_REQUIRE_ADD', true),
		removeRequirement: link('removeRequirement', 'LABEL_REQUIRE_REMOVE', false),
		insertTemplate: (id, to) => {
			const template = mergeRoadmapTemplates(props.templates).find(item => item.id === id)
			return run({
				name: 'insertTemplate',
				label: editText('LABEL_TEMPLATE', { title: template?.title ?? id }),
				build: now => buildTemplate(now, template, to),
			})
		},
		importJson: input => {
			const parsed = importRoadmap(input)
			return run({
				name: 'importJson',
				label: editText('LABEL_IMPORT', {}),
				build: now => ('stages' in parsed ? buildReplace(now, parsed) : parsed),
			})
		},
	}
}
