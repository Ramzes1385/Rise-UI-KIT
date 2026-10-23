<template>
	<div class="base-flow-map__details-body">
		<header class="base-flow-map__details-head">
			<div class="base-flow-map__details-title">
				<b class="base-flow-map__details-name">{{ view.title }}</b>
				<div class="base-flow-map__details-chips">
					<BaseBadge v-if="view.lane" variant="outline" status="neutral" :label="view.lane.label" />
					<BaseBadge variant="soft" status="neutral" :label="view.kind" />
				</div>
			</div>
			<BaseBadge v-if="view.status" variant="soft" :status="view.status.badge">
				<BaseIcon :name="view.status.icon" :style="{ color: view.status.color }" />
				{{ view.status.label }}
			</BaseBadge>
			<BaseButton v-if="hasClose" variant="ghost" :aria-label="labels.close" @click="emit('close')">
				<BaseIcon name="x-mark" />
			</BaseButton>
		</header>
		<p v-if="view.description" class="base-flow-map__details-description">{{ view.description }}</p>
		<BaseDescriptions
			v-if="view.metrics.length"
			variant="ghost"
			layout="vertical"
			:columns="3"
			:title="labels.metrics"
			:items="view.metrics" />
		<dl v-if="view.fields.length" class="base-flow-map__details-fields">
			<template v-for="field in view.fields" :key="field.id">
				<dt>{{ field.label }}</dt>
				<dd>
					<BaseLink v-if="field.href" :href="field.href" :label="String(field.value)" />
					<template v-else>{{ field.value }}</template>
				</dd>
			</template>
		</dl>
		<dl v-if="view.calls.length || view.calledBy.length" class="base-flow-map__details-relations">
			<template v-if="view.calls.length">
				<dt>{{ labels.calls }}</dt>
				<dd>{{ view.calls.join(', ') }}</dd>
			</template>
			<template v-if="view.calledBy.length">
				<dt>{{ labels.calledBy }}</dt>
				<dd>{{ view.calledBy.join(', ') }}</dd>
			</template>
		</dl>
		<footer v-if="view.owner || view.links.length" class="base-flow-map__details-foot">
			<template v-if="view.owner">
				<BaseAvatar :name="view.owner.name" :src="view.owner.avatar" />
				<BaseLink v-if="view.owner.href" class="base-flow-map__details-team" :href="view.owner.href" :label="labels.team" />
				<span v-else class="base-flow-map__details-team">{{ labels.team }}</span>
			</template>
			<span class="base-flow-map__details-links">
				<BaseLink
					v-for="link in view.links"
					:key="link.href"
					:href="link.href"
					:label="link.label"
					:target="link.isExternal ? '_blank' : undefined"
					:rel="link.isExternal ? 'noopener noreferrer' : undefined"
					:has-external-icon="link.isExternal" />
			</span>
		</footer>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { BaseBadge } from '@components/BaseBadge'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseDescriptions } from '@components/BaseDescriptions'
import type { FlowDetailsBodyLabels, FlowDetailsView } from '../../types/internal/flowPanels.types'

defineProps<{ view: FlowDetailsView; labels: FlowDetailsBodyLabels; hasClose?: boolean }>()
const emit = defineEmits<{ (event: 'close'): void }>()
</script>
