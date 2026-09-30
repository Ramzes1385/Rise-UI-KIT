<template>
	<div class="base-json-viewer" :class="[variantClass, classes.root]" :style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div v-if="hasToolbar" class="base-json-viewer__toolbar" :class="classes.toolbar">
			<BaseButton variant="ghost" :size-scale="87.5" @click="expandAll">{{ UI_JSON_VIEWER.EXPAND_ALL }}</BaseButton>
			<BaseButton variant="ghost" :size-scale="87.5" @click="collapseAll">{{ UI_JSON_VIEWER.COLLAPSE_ALL }}</BaseButton>
			<BaseButton variant="ghost" :size-scale="87.5" @click="copy">{{ UI_JSON_VIEWER.COPY }}</BaseButton>
			<slot name="actions" />
			<span class="base-json-viewer__status" role="status">{{ status }}</span>
		</div>
		<BaseTree
			v-model:expanded-ids="expandedIds"
			class="base-json-viewer__tree"
			:class="classes.tree"
			:items="items"
			:aria-label="label"
			variant="ghost"
			:size-scale="sizeScale">
			<template #label="{ node }">
				<span class="base-json-viewer__node">
					<template v-if="viewOf(node).key">
						<span class="base-json-viewer__key">{{ viewOf(node).key }}</span>
						<span class="base-json-viewer__colon">:</span>
						{{ ' ' }}
					</template>
					<span class="base-json-viewer__value" :class="`base-json-viewer__value--${viewOf(node).type}`">
						{{ viewOf(node).preview }}
					</span>
				</span>
			</template>
		</BaseTree>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseJsonViewer.style.scss'
import { BaseTree } from '@components/BaseTree'
import { UI_JSON_VIEWER } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { useBaseJsonViewer } from '../model/useBaseJsonViewer'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseJsonViewerEmits, BaseJsonViewerProps, BaseJsonViewerSlots } from '../types/BaseJsonViewer.types'

const props = withDefaults(defineProps<BaseJsonViewerProps>(), {
	variant: 'default',
	expandDepth: 1,
	hasToolbar: true,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseJsonViewerEmits>()

defineSlots<BaseJsonViewerSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	items,
	expandedIds,
	status,
	viewOf,
	expandAll,
	collapseAll,
	copy,
} = useBaseJsonViewer(props, emit)
</script>
