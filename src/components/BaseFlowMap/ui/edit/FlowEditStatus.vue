<template>
	<div v-if="status.isVisible.value" class="base-flow-map__edit-status" role="status" :aria-label="status.region">
		<span>{{ status.selected.value }}</span>
		<span>{{ status.changes.value }}</span>
		<span>{{ status.counts.value }}</span>
		<span class="base-flow-map__edit-spacer" />
		<span>{{ status.saved.value }}</span>
		<BaseButton variant="ghost" :aria-expanded="status.isOpen.value" @click="status.isOpen.value = !status.isOpen.value">
			<BaseIcon :name="status.hasIssues.value ? 'alert-triangle' : 'check-circle'" />
			{{ status.summary.value }}
		</BaseButton>
		<section v-if="status.isOpen.value" class="base-flow-map__edit-issues" role="dialog" :aria-label="status.issuesRegion">
			<h3 class="base-flow-map__edit-caption">{{ status.title.value }}</h3>
			<ul class="base-flow-map__edit-hooks">
				<li v-for="issue in status.issues.value" :key="issue.key" class="base-flow-map__edit-hook">
					<BaseBadge :label="issue.badge" :status="issue.type" variant="soft" />
					<span>{{ issue.message }}</span>
					<BaseButton v-if="issue.target" variant="ghost" @click="status.focus(issue.target)">{{ status.show }}</BaseButton>
				</li>
				<li v-if="!status.hasIssues.value" class="base-flow-map__edit-hook">{{ status.ok }}</li>
			</ul>
			<p v-if="status.rules.value" class="base-flow-map__edit-hint">{{ status.rules.value }}</p>
		</section>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import { useFlowEditStatus } from '../../model/edit/status/useFlowEditStatus'

const status = useFlowEditStatus()
</script>
