import type { FlowScenarioState, FlowScenarioStatus, FlowTimelineEntry } from '../../types/data/flowScenario.types'
import {
	FLOW_MAX_FRAME_DELTA,
	FLOW_SPEED_MAX,
	FLOW_SPEED_MIN,
	type FlowClockInput,
	type FlowPlayerInput,
	type FlowPlayerMove,
	type FlowTimelineBuild,
} from '../../types/internal/flowScenarioInternal.types'

export function clampSpeed(speed: number): number {
	if (!Number.isFinite(speed)) {
		return 1
	}
	return Math.min(FLOW_SPEED_MAX, Math.max(FLOW_SPEED_MIN, speed))
}

export function clampTime(time: number, duration: number): number {
	if (!Number.isFinite(time)) {
		return 0
	}
	return Math.min(Math.max(0, duration), Math.max(0, time))
}

export function advanceClock(input: FlowClockInput): FlowPlayerMove {
	const step = Math.min(Math.max(0, input.delta), FLOW_MAX_FRAME_DELTA) * clampSpeed(input.speed)
	const next = input.time + step
	if (next >= input.duration) {
		return { time: input.duration, status: 'ended' }
	}
	return { time: next, status: 'playing' }
}

function startedCount(entries: readonly FlowTimelineEntry[], time: number): number {
	return entries.filter(entry => entry.start <= time).length
}

function currentIndex(status: FlowScenarioStatus, entries: readonly FlowTimelineEntry[], time: number): number {
	if (status === 'idle') {
		return -1
	}
	return status === 'ended' ? entries.length - 1 : startedCount(entries, time) - 1
}

export function snapshotScenario(input: FlowPlayerInput, build: FlowTimelineBuild): FlowScenarioState {
	const { entries, duration } = build
	const time = clampTime(input.time, duration)
	const isEnded = input.status === 'ended'
	const isIdle = input.status === 'idle'
	const isActive = (entry: FlowTimelineEntry) => !isIdle && !isEnded && entry.start <= time && time < entry.start + entry.duration
	const isDone = (entry: FlowTimelineEntry) => isEnded || (!isIdle && entry.start + entry.duration <= time)
	return {
		scenario: input.scenario,
		status: input.status,
		time: isIdle ? 0 : time,
		duration,
		stepIndex: currentIndex(input.status, entries, time),
		stepCount: entries.length,
		activeSteps: entries.filter(isActive).map(entry => entry.step),
		doneSteps: entries.filter(isDone).map(entry => entry.step),
		speed: input.speed,
	}
}

export function seekTarget(build: FlowTimelineBuild, to: number | { step: string | number }): number | null {
	if (typeof to === 'number') {
		return clampTime(to, build.duration)
	}
	const entry = typeof to.step === 'number' ? build.entries[Math.trunc(to.step)] : build.entries.find(item => item.step === to.step)
	return entry ? entry.start : null
}

function distinctStarts(entries: readonly FlowTimelineEntry[]): number[] {
	return [...new Set(entries.map(entry => entry.start))].sort((a, b) => a - b)
}

export function stepTarget(build: FlowTimelineBuild, input: Pick<FlowPlayerInput, 'status' | 'time'>, direction: 1 | -1): FlowPlayerMove {
	const starts = distinctStarts(build.entries)
	const current = input.status === 'idle' ? -1 : starts.filter(start => start <= input.time).length - 1
	const next = current + direction
	if (next < 0 || starts.length === 0) {
		return { time: 0, status: 'idle' }
	}
	if (next >= starts.length) {
		return { time: build.duration, status: 'ended' }
	}
	return { time: starts[next], status: 'paused' }
}
