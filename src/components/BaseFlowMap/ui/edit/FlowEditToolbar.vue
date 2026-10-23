<template>
	<div v-if="isVisible" class="base-flow-map__edit-bar" role="toolbar" :aria-label="bar.text.toolbar">
		<div class="base-flow-map__edit-group" role="group" :aria-label="bar.text.group">
			<BaseButton
				v-for="tool in bar.tools.value"
				:key="tool.id"
				variant="ghost"
				:aria-label="tool.label"
				:aria-pressed="tool.isActive"
				@click="bar.pick(tool.id)">
				<BaseIcon :name="tool.icon" />
				<span class="base-flow-map__edit-key" aria-hidden="true">{{ tool.key }}</span>
			</BaseButton>
		</div>
		<span class="base-flow-map__edit-sep" aria-hidden="true" />
		<BaseButton
			variant="ghost"
			:aria-label="bar.text.undo"
			:is-disabled="!bar.history.value.canUndo"
			is-focusable-when-disabled
			@click="bar.undo">
			<BaseIcon name="undo" />
		</BaseButton>
		<BaseButton
			variant="ghost"
			:aria-label="bar.text.redo"
			:is-disabled="!bar.history.value.canRedo"
			is-focusable-when-disabled
			@click="bar.redo">
			<BaseIcon name="redo" />
		</BaseButton>
		<BasePopover position="bottom" :aria-label="bar.text.history">
			<template #trigger>
				<BaseButton variant="ghost" :aria-label="bar.text.history"><BaseIcon name="rotate-ccw" /></BaseButton>
			</template>
			<FlowEditHistory />
		</BasePopover>
		<span class="base-flow-map__edit-sep" aria-hidden="true" />
		<BaseDropdownMenu :items="bar.arrangeItems.value">
			<BaseButton variant="ghost" :aria-label="bar.text.arrange"><BaseIcon name="shuffle" /></BaseButton>
		</BaseDropdownMenu>
		<div v-if="bar.isMultiple.value" class="base-flow-map__edit-group" role="group" :aria-label="bar.text.align">
			<BaseButton v-for="item in bar.aligns" :key="item.id" variant="ghost" :aria-label="item.label" @click="bar.align(item.id)">
				<BaseIcon :name="item.icon" />
			</BaseButton>
			<BaseButton v-if="bar.isDistributable.value" variant="ghost" :aria-label="bar.text.distribute" @click="bar.distribute">
				<BaseIcon name="align-justify" />
			</BaseButton>
		</div>
		<span class="base-flow-map__edit-sep" aria-hidden="true" />
		<BaseSwitch v-model="bar.isGridOn.value" :label="bar.text.grid" />
		<BaseSwitch v-model="bar.isSnapOn.value" :label="bar.text.snap" />
		<span class="base-flow-map__edit-spacer" />
		<div class="base-flow-map__edit-group" role="group" :aria-label="bar.text.zoom">
			<BaseButton variant="ghost" :aria-label="bar.text.zoom" @click="bar.zoomOut"><BaseIcon name="minus" /></BaseButton>
			<span class="base-flow-map__zoom">{{ bar.percent.value }}%</span>
			<BaseButton variant="ghost" :aria-label="bar.text.zoom" @click="bar.zoomIn"><BaseIcon name="plus" /></BaseButton>
		</div>
		<BasePopover v-model:is-open="bar.isHelpOpen.value" position="bottom" :aria-label="bar.text.helpTitle">
			<template #trigger>
				<BaseButton variant="ghost" :aria-label="bar.text.help"><BaseIcon name="info" /></BaseButton>
			</template>
			<FlowEditHelp />
		</BasePopover>
		<BaseButton @click="bar.done"><BaseIcon name="check" />{{ bar.text.done }}</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseSwitch } from '@components/BaseSwitch'
import FlowEditHelp from './toolbar/FlowEditHelp.vue'
import { BasePopover } from '@components/BasePopover'
import FlowEditHistory from './toolbar/FlowEditHistory.vue'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'
import { useFlowEditChrome } from '../../model/edit/toolbar/useFlowEditChrome'
import { useFlowEditToolbar } from '../../model/edit/toolbar/useFlowEditToolbar'

const bar = useFlowEditToolbar()
const { isVisible } = useFlowEditChrome()
</script>
