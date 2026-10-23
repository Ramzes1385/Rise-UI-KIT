import { pickBranch } from './choices'
import type {
	FlowScenario,
	FlowScenarioAction,
	FlowScenarioChoices,
	FlowScenarioStep,
	FlowStepEffect,
} from '../../types/data/flowScenario.types'
import {
	FLOW_DEFAULT_MAX_STEP,
	FLOW_DEFAULT_MIN_STEP,
	FLOW_DEFAULT_STEP_DURATION,
	type FlowTimelineBuild,
	type FlowTimelineContext,
	type FlowTimelineCursor,
	type FlowTimelineOptions,
} from '../../types/internal/flowScenarioInternal.types'

function positive(value: number | undefined, fallback: number): number {
	return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback
}

function collectActions(steps: FlowScenarioStep[]): FlowScenarioAction[] {
	return steps.flatMap(step => {
		if (step.type === 'parallel') {
			return collectActions(step.branches.flat())
		}
		if (step.type === 'choice') {
			return collectActions(step.branches.flatMap(branch => branch.steps))
		}
		return [step]
	})
}

function createContext(scenario: FlowScenario, choices: FlowScenarioChoices, options: FlowTimelineOptions): FlowTimelineContext {
	const minStep = positive(scenario.minStep, FLOW_DEFAULT_MIN_STEP)
	const maxStep = Math.max(minStep, positive(scenario.maxStep, FLOW_DEFAULT_MAX_STEP))
	const latencies = collectActions(scenario.steps).map(action => positive(action.latency, 0))
	return {
		entries: [],
		choices,
		stepDuration: positive(scenario.stepDuration, FLOW_DEFAULT_STEP_DURATION),
		minStep,
		maxStep,
		isLatency: scenario.timing === 'latency',
		maxLatency: Math.max(0, ...latencies),
		effectOf: options.effectOf,
	}
}

function actionDuration(action: FlowScenarioAction, context: FlowTimelineContext): number {
	if (typeof action.duration === 'number' && Number.isFinite(action.duration) && action.duration > 0) {
		return action.duration
	}
	const latency = positive(action.latency, 0)
	if (context.isLatency && latency > 0 && context.maxLatency > 0) {
		return Math.round(context.minStep + (latency / context.maxLatency) * (context.maxStep - context.minStep))
	}
	return Math.min(context.maxStep, Math.max(context.minStep, context.stepDuration))
}

function actionEffect(action: FlowScenarioAction, context: FlowTimelineContext): FlowStepEffect {
	return action.effect ?? context.effectOf?.(action) ?? (action.edge ? 'travel' : 'pulse')
}

function walkAction(action: FlowScenarioAction, at: FlowTimelineCursor, context: FlowTimelineContext): number {
	const duration = actionDuration(action, context)
	context.entries.push({
		step: action.id,
		start: at.start,
		duration,
		edge: action.edge,
		node: action.node,
		branch: at.branch,
		effect: actionEffect(action, context),
	})
	return at.start + duration
}

function walkList(steps: FlowScenarioStep[], at: FlowTimelineCursor, context: FlowTimelineContext): number {
	return steps.reduce((start, step) => walkStep(step, { start, branch: at.branch }, context), at.start)
}

function walkStep(step: FlowScenarioStep, at: FlowTimelineCursor, context: FlowTimelineContext): number {
	if (step.type === 'parallel') {
		const ends = step.branches.map((steps, index) => walkList(steps, { start: at.start, branch: `${step.id}:${index}` }, context))
		return Math.max(at.start, ...ends)
	}
	if (step.type === 'choice') {
		const picked = pickBranch(step, context.choices)
		return picked ? walkList(picked.steps, { start: at.start, branch: picked.id }, context) : at.start
	}
	return walkAction(step, at, context)
}

export function buildTimeline(scenario: FlowScenario, choices: FlowScenarioChoices, options: FlowTimelineOptions = {}): FlowTimelineBuild {
	const context = createContext(scenario, choices, options)
	const duration = walkList(scenario.steps, { start: 0 }, context)
	const entries = context.entries
		.map((entry, order) => ({ entry, order }))
		.sort((a, b) => a.entry.start - b.entry.start || a.order - b.order)
		.map(({ entry }) => entry)
	return { entries, duration }
}
