import { defineAsyncComponent } from 'vue'

export function useRoadmap3DParts() {
	return {
		TwoDRoadmap: defineAsyncComponent(() => import('@components/BaseRoadmap/ui/BaseRoadmap.vue')),
	}
}
