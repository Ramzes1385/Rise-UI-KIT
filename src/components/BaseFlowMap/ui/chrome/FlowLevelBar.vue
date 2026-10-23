<template>
	<div v-if="chrome.hasLevelBar" class="base-flow-map__levelbar">
		<nav v-if="chrome.crumbs.length > 1" class="base-flow-map__crumbs" :aria-label="UI_FLOW_MAP.CRUMBS_ARIA">
			<BaseIcon name="layers" class="base-flow-map__crumbs-icon" />
			<template v-for="(crumb, position) in chrome.crumbs" :key="crumb.key">
				<span v-if="position > 0" class="base-flow-map__crumb-sep" aria-hidden="true">›</span>
				<span v-if="crumb.isEllipsis" aria-hidden="true">…</span>
				<span v-else-if="crumb.isCurrent" class="base-flow-map__crumb-current" aria-current="location">{{ crumb.label }}</span>
				<button v-else type="button" class="base-flow-map__crumb" @click="chrome.goCrumb(crumb.depth)">{{ crumb.label }}</button>
			</template>
		</nav>
		<div v-if="chrome.levels.length > 1" class="base-flow-map__levels" role="group" :aria-label="UI_FLOW_MAP.LEVELS_ARIA">
			<button
				v-for="item in chrome.levels"
				:key="item.index"
				type="button"
				class="base-flow-map__level"
				:class="item.isActive && 'base-flow-map__level--active'"
				:aria-pressed="item.isActive"
				:aria-label="item.text"
				@click="chrome.goLevel(item.index)">
				<span aria-hidden="true">{{ chrome.isCompact ? item.index + 1 : item.text }}</span>
			</button>
		</div>
		<slot name="level" :level="chrome.level" :controller="chrome.controller" />
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_FLOW_MAP } from '@/locales/messages'
import { useFlowChromeContext } from '../../model/context/flowContext'
import type { FlowLevelState, FlowMapController } from '../../types/api/flowController.types'

defineSlots<{ level?: (props: { level: FlowLevelState; controller: FlowMapController }) => unknown }>()

const chrome = useFlowChromeContext()
</script>
