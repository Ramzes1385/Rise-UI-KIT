<template>
	<section
		v-if="inspector.isVisible.value && !inspector.isCompact.value"
		class="base-flow-map__edit-inspector"
		:aria-label="inspector.title">
		<BaseTabs v-model="inspector.tab.value" :items="inspector.tabs.value" is-full-width>
			<template #panel-props><FlowEditPropsTab /></template>
			<template #panel-style><FlowEditStyleTab v-if="inspector.target.value" :id="inspector.target.value.id" /></template>
			<template #panel-data><FlowEditDataTab v-if="inspector.target.value" :id="inspector.target.value.id" /></template>
			<template #panel-hooks><FlowEditHooksTab /></template>
		</BaseTabs>
		<slot v-if="inspector.target.value" name="inspector-end" :target="inspector.target.value" :controller="inspector.controller" />
	</section>
	<BaseDrawer
		v-else-if="inspector.isVisible.value"
		v-model:is-open="inspector.isDrawerOpen.value"
		direction="bottom"
		:title="inspector.title"
		:description="inspector.compactHint">
		<FlowEditPropsTab />
		<slot v-if="inspector.target.value" name="inspector-end" :target="inspector.target.value" :controller="inspector.controller" />
	</BaseDrawer>
</template>

<script setup lang="ts">
import { BaseTabs } from '@components/BaseTabs'
import { BaseDrawer } from '@components/BaseDrawer'
import FlowEditDataTab from './inspector/FlowEditDataTab.vue'
import FlowEditHooksTab from './inspector/FlowEditHooksTab.vue'
import FlowEditPropsTab from './inspector/FlowEditPropsTab.vue'
import FlowEditStyleTab from './inspector/FlowEditStyleTab.vue'
import type { FlowElementRef } from '../../types/data/flowReview.types'
import type { FlowMapController } from '../../types/api/flowController.types'
import { useFlowEditInspector } from '../../model/edit/inspector/useFlowEditInspector'

defineSlots<{ 'inspector-end'?: (props: { target: FlowElementRef; controller: FlowMapController }) => unknown }>()

const inspector = useFlowEditInspector()
</script>
