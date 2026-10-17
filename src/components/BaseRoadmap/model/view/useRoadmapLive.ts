import { ref } from 'vue'
import { liveText } from './format/roadmapText'
import type { RoadmapTopicStatus } from '../../types/roadmapData.types'

export function useRoadmapLive() {
	const text = ref('')
	let counter = 0

	return {
		text,
		announce(status: RoadmapTopicStatus | 'reset', title: string, count: { done: number; total: number }): void {
			counter += 1
			const suffix = counter % 2 === 0 ? ' ' : ''
			text.value = `${liveText(status, title, count)}${suffix}`
		},
	}
}
