<template>
	<BaseToolbar :class="chrome.ui('toolbar')" :aria-label="UI_FLOW_MAP.TOOLBAR" orientation="horizontal">
		<BaseButton variant="ghost" :aria-label="UI_FLOW_MAP.ZOOM_OUT" @click="chrome.zoomOut">
			<BaseIcon name="minus" />
		</BaseButton>
		<span class="base-flow-map__zoom" :aria-label="formatMessage(UI_FLOW_MAP.ZOOM_VALUE, { percent: chrome.percent })">
			{{ chrome.percent }}%
		</span>
		<BaseButton variant="ghost" :aria-label="UI_FLOW_MAP.ZOOM_IN" @click="chrome.zoomIn">
			<BaseIcon name="plus" />
		</BaseButton>
		<BaseButton variant="ghost" :aria-label="UI_FLOW_MAP.FIT" @click="chrome.fit">
			<BaseIcon name="fullscreen" />
		</BaseButton>
		<slot name="toolbar" :controller="chrome.controller" />
	</BaseToolbar>
</template>

<script setup lang="ts">
import { formatMessage } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { UI_FLOW_MAP } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseToolbar } from '@components/BaseToolbar'
import { useFlowChromeContext } from '../../model/context/flowContext'
import type { FlowMapController } from '../../types/api/flowController.types'

defineSlots<{ toolbar?: (props: { controller: FlowMapController }) => unknown }>()

const chrome = useFlowChromeContext()
</script>
