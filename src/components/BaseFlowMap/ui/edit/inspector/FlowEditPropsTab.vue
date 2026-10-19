<template>
	<div class="base-flow-map__edit-inspector" role="tabpanel">
		<template v-if="inspector.subject.value.type === 'many'">
			<h3 class="base-flow-map__edit-caption">{{ inspector.multi.title }}</h3>
			<p class="base-flow-map__edit-hint">{{ inspector.count.value }}</p>
		</template>
		<FlowEditField v-for="field in inspector.fields.value" :key="field.id" :field="field" />
		<div v-if="inspector.subject.value.type === 'many'" class="base-flow-map__edit-row">
			<BaseButton variant="ghost" @click="inspector.multi.align">{{ inspector.multi.labels.align }}</BaseButton>
			<BaseButton variant="ghost" @click="inspector.multi.distribute">{{ inspector.multi.labels.distribute }}</BaseButton>
			<BaseButton variant="soft" @click="inspector.multi.group">{{ inspector.multi.labels.group }}</BaseButton>
		</div>
		<div v-if="inspector.subject.value.type === 'map'" class="base-flow-map__edit-row">
			<BaseBadge v-for="count in inspector.counts.value" :key="count" :label="count" variant="soft" />
		</div>
	</div>
</template>

<script setup lang="ts">
import FlowEditField from './FlowEditField.vue'
import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import { useFlowEditInspector } from '../../../model/edit/inspector/useFlowEditInspector'

const inspector = useFlowEditInspector()
</script>
