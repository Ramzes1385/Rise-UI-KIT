import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type { RoadmapEditorContext } from '../../../types/internal/roadmapEditView.types'

const ROADMAP_EDITOR_KEY: InjectionKey<RoadmapEditorContext> = Symbol('roadmapEditor')

export function provideRoadmapEditor(context: RoadmapEditorContext): void {
	provide(ROADMAP_EDITOR_KEY, context)
}

export function useRoadmapEditorContext(): RoadmapEditorContext {
	return inject(ROADMAP_EDITOR_KEY) as RoadmapEditorContext
}
