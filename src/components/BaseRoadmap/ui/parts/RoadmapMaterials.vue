<template>
	<ul :class="ui('materials')">
		<li v-for="(material, index) in materials" :key="material.id ?? index" class="base-roadmap__materials-item">
			<slot name="material" :material="material">
				<component
					:is="material.url ? 'a' : 'div'"
					class="base-roadmap__material"
					:href="material.url"
					:target="isExternalUrl(material.url) ? '_blank' : undefined"
					:rel="isExternalUrl(material.url) ? 'noopener noreferrer' : undefined">
					<span class="base-roadmap__material-icon" aria-hidden="true">
						<svg width="15" height="15" viewBox="0 0 16 16" focusable="false">
							<path :d="materialIconPath(material.kind)" />
						</svg>
					</span>
					<span class="base-roadmap__material-text">
						<span class="base-roadmap__material-title">{{ material.title }}</span>
						<span class="base-roadmap__material-meta">{{ materialMetaText(material) }}</span>
					</span>
					<template v-if="isExternalUrl(material.url)">
						<span class="base-roadmap__sr">{{ UI_ARIA.OPENS_IN_NEW_TAB }}</span>
						<svg
							class="base-roadmap__material-external"
							width="14"
							height="14"
							viewBox="0 0 16 16"
							aria-hidden="true"
							focusable="false">
							<path d="M6 3.5h6.5V10M12.5 3.5 4 12" />
						</svg>
					</template>
				</component>
			</slot>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { UI_ARIA } from '@/locales/messages'
import type { RoadmapMaterialsProps, RoadmapMaterialsSlots } from '../../types/internal/roadmapView.types'
import { isExternalUrl, materialIconPath, materialMetaText } from '../../model/view/format/roadmapMaterial'

defineProps<RoadmapMaterialsProps>()
defineSlots<RoadmapMaterialsSlots>()
</script>
