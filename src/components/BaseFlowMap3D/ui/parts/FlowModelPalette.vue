<template>
	<div :class="className" role="dialog" :aria-label="UI_FLOW_MAP_3D.PALETTE_TITLE" @keydown.esc.stop="$emit('close')">
		<div class="base-flow-map-3d__palette-head">
			<b>{{ UI_FLOW_MAP_3D.PALETTE_TITLE }}</b>
			<span class="base-flow-map-3d__palette-current">{{
				formatMessage(UI_FLOW_MAP_3D.PALETTE_CURRENT, { title: currentTitle })
			}}</span>
			<BaseButton variant="ghost" :aria-label="UI_FLOW_MAP_3D.PALETTE_CLOSE" @click="$emit('close')">
				<template #left><BaseIcon name="close" /></template>
			</BaseButton>
		</div>
		<template v-for="section in sections" :key="section.id">
			<span v-if="section.items.length" class="base-flow-map-3d__palette-title">{{ section.title }}</span>
			<div v-if="section.items.length" class="base-flow-map-3d__palette-grid">
				<button
					v-for="item in section.items"
					:key="item.key"
					type="button"
					class="base-flow-map-3d__palette-cell"
					:aria-pressed="item.isCurrent"
					:title="item.title"
					:aria-label="cellLabel(item)"
					@click="$emit('pick', item.key)">
					<BaseIcon :name="item.icon" />
					<span class="base-flow-map-3d__palette-name">{{ item.title }}</span>
				</button>
			</div>
		</template>
		<form class="base-flow-map-3d__palette-own" @submit.prevent="$emit('load')">
			<span class="base-flow-map-3d__palette-own-title">{{ UI_FLOW_MAP_3D.PALETTE_OWN }}</span>
			<input
				:value="url"
				type="url"
				class="base-flow-map-3d__field"
				:aria-label="UI_FLOW_MAP_3D.PALETTE_URL"
				:placeholder="UI_FLOW_MAP_3D.PALETTE_URL_PLACEHOLDER"
				@input="$emit('update:url', ($event.target as HTMLInputElement).value)" />
			<BaseButton type="submit">{{ UI_FLOW_MAP_3D.PALETTE_LOAD }}</BaseButton>
		</form>
	</div>
</template>

<script setup lang="ts">
import { formatMessage } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import type { FlowModelPaletteProps } from '../../types/internal/flowMap3dEdit.types'
import { useFlowModelPaletteView } from '../../model/edit/panels/useFlowModelPaletteView'

const props = defineProps<FlowModelPaletteProps>()

defineEmits<{
	(event: 'pick', key: string): void
	(event: 'update:url', value: string): void
	(event: 'load' | 'close'): void
}>()

const { sections, cellLabel } = useFlowModelPaletteView(props)
</script>
