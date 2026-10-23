<template>
	<section
		v-if="scenario"
		class="base-flow-map__scenario-panel"
		:class="{ 'base-flow-map__scenario-panel--compact': isCompact }"
		:role="isCompact ? 'group' : undefined"
		:aria-label="UI_FLOW_SCENARIO.PANEL"
		:data-status="status">
		<template v-if="isCompact">
			<BaseButton
				class="base-flow-map__scenario-play"
				:aria-label="isPlaying ? UI_FLOW_SCENARIO.PAUSE : UI_FLOW_SCENARIO.PLAY"
				@click="toggle">
				<template #left><BaseIcon :name="isPlaying ? 'pause' : 'play'" /></template>
			</BaseButton>
			<div class="base-flow-map__scenario-player">
				<b class="base-flow-map__scenario-player-title">{{ stepText }}</b>
				<span class="base-flow-map__scenario-player-step">{{ currentTitle }}</span>
				<span class="base-flow-map__scenario-segments" aria-hidden="true">
					<span
						v-for="step in steps"
						:key="step.id"
						class="base-flow-map__scenario-segment"
						:class="{
							'base-flow-map__scenario-segment--done': step.isDone,
							'base-flow-map__scenario-segment--current': step.isCurrent,
						}"></span>
				</span>
			</div>
			<BaseButton variant="ghost" class="base-flow-map__scenario-icon" :aria-label="UI_FLOW_SCENARIO.STEP_FORWARD" @click="go(1)">
				<template #left><BaseIcon name="chevron-right" class="base-flow-map__scenario-chevron" /></template>
			</BaseButton>
		</template>
		<template v-else>
			<div class="base-flow-map__scenario-top">
				<div class="base-flow-map__scenario-heading">
					<span class="base-flow-map__scenario-eyebrow">{{ UI_FLOW_SCENARIO.PANEL }}</span>
					<b class="base-flow-map__scenario-name">{{ scenario.label }}</b>
					<span v-if="isSimulated" class="base-flow-map__scenario-note">{{ UI_FLOW_SCENARIO.SIMULATED }}</span>
				</div>
				<div class="base-flow-map__scenario-controls">
					<BaseButton
						variant="outline"
						class="base-flow-map__scenario-icon"
						:aria-label="UI_FLOW_SCENARIO.RESTART"
						@click="restart">
						<template #left><BaseIcon name="rotate-ccw" /></template>
					</BaseButton>
					<BaseButton @click="toggle">
						<template #left><BaseIcon :name="isPlaying ? 'pause' : 'play'" /></template>
						{{ isPlaying ? UI_FLOW_SCENARIO.PAUSE : UI_FLOW_SCENARIO.PLAY }}
					</BaseButton>
				</div>
			</div>
			<div v-if="scenarios.length > 1" class="base-flow-map__scenario-select" role="group" :aria-label="UI_FLOW_SCENARIO.SELECT">
				<BaseButton
					v-for="item in scenarios"
					:key="item.id"
					:size-scale="90"
					:variant="item.id === scenario.id ? 'soft' : 'ghost'"
					:aria-pressed="item.id === scenario.id"
					@click="select(item.id)">
					{{ item.label }}
				</BaseButton>
			</div>
			<div class="base-flow-map__scenario-segments" aria-hidden="true">
				<span
					v-for="step in steps"
					:key="step.id"
					class="base-flow-map__scenario-segment"
					:class="{
						'base-flow-map__scenario-segment--done': step.isDone,
						'base-flow-map__scenario-segment--current': step.isCurrent,
					}"></span>
			</div>
			<BaseRange
				class="base-flow-map__scenario-seek"
				:model-value="time"
				:min="0"
				:max="duration"
				:step="seekStep"
				:is-disabled="duration <= 0"
				:aria-label="UI_FLOW_SCENARIO.SEEK"
				@update:model-value="seek" />
			<div class="base-flow-map__scenario-meta">
				<span>{{ stepText }}</span>
				<span>{{ summary }}</span>
			</div>
			<div class="base-flow-map__scenario-tools">
				<BaseButton variant="ghost" class="base-flow-map__scenario-icon" :aria-label="UI_FLOW_SCENARIO.STEP_BACK" @click="go(-1)">
					<template #left><BaseIcon name="chevron-left" class="base-flow-map__scenario-chevron" /></template>
				</BaseButton>
				<BaseButton variant="ghost" class="base-flow-map__scenario-icon" :aria-label="UI_FLOW_SCENARIO.STEP_FORWARD" @click="go(1)">
					<template #left><BaseIcon name="chevron-right" class="base-flow-map__scenario-chevron" /></template>
				</BaseButton>
				<BaseButton variant="ghost" :aria-label="speedLabel" @click="cycleSpeed">{{ speedText }}</BaseButton>
			</div>
			<ol class="base-flow-map__scenario-steps" :aria-label="UI_FLOW_SCENARIO.STEPS">
				<li v-for="(step, position) in steps" :key="step.id" class="base-flow-map__scenario-step-item">
					<slot name="scenario-step" :step="step.action" :index="position" :is-active="step.isCurrent" :is-done="step.isDone">
						<button
							type="button"
							class="base-flow-map__scenario-step"
							:class="{
								'base-flow-map__scenario-step--current': step.isCurrent,
								'base-flow-map__scenario-step--done': step.isDone,
								'base-flow-map__scenario-step--failed': step.isFailed,
							}"
							:aria-current="step.isCurrent ? 'step' : undefined"
							@click="jump(step.id)">
							<span class="base-flow-map__scenario-step-number">
								<BaseIcon v-if="step.isDone" name="check" />
								<template v-else>{{ step.number }}</template>
							</span>
							<span class="base-flow-map__scenario-step-text">
								<b>{{ step.title }}</b>
								<span v-if="step.detail">{{ step.detail }}</span>
							</span>
							<span class="base-flow-map__scenario-step-latency">{{ step.latency }}</span>
							<span v-if="step.isFailed" class="base-flow-map__scenario-step-failed">{{ UI_FLOW_SCENARIO.FAILED }}</span>
						</button>
					</slot>
				</li>
			</ol>
		</template>
	</section>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseRange } from '@components/BaseRange'
import { BaseButton } from '@components/BaseButton'
import { UI_FLOW_SCENARIO } from '@/locales/messages'
import type { FlowScenarioAction } from '../../types/data/flowScenario.types'
import { useFlowScenarioPanel } from '../../model/scenario/panel/useFlowScenarioPanel'

defineSlots<{
	'scenario-step'?: (props: { step: FlowScenarioAction; index: number; isActive: boolean; isDone: boolean }) => unknown
}>()

const {
	scenario,
	scenarios,
	steps,
	status,
	isCompact,
	isPlaying,
	isSimulated,
	stepText,
	summary,
	speedText,
	speedLabel,
	currentTitle,
	time,
	duration,
	seekStep,
	toggle,
	restart,
	go,
	seek,
	jump,
	cycleSpeed,
	select,
} = useFlowScenarioPanel()
</script>
