<template>
	<div class="base-flow-map__edit-notices" role="status" aria-live="polite" :aria-label="notices.region">
		<BaseAlert
			v-for="item in notices.notices.value"
			:key="item.id"
			:type="item.type === 'warning' ? 'warning' : 'info'"
			:description="item.text"
			is-closable
			@close="notices.dismiss(item.id)" />
	</div>
</template>

<script setup lang="ts">
import { BaseAlert } from '@components/BaseAlert'
import { useFlowEditNotices } from '../../../model/edit/overlay/useFlowEditNotices'

const notices = useFlowEditNotices()
</script>
