import type { ComputedRef } from 'vue'
import { buildTimeline } from './timeline'
import { FLOW_SCENARIO_DETAILS } from './scenarioContext'
import { pickBranch, resolveScenarioChoices } from './choices'
import type { FlowGraph } from '../../types/api/flowLayout.types'
import type { FlowModelProps } from '../../types/internal/flowModel.types'
import { advanceClock, clampSpeed, seekTarget, snapshotScenario, stepTarget } from './player'
import { computed, getCurrentInstance, onMounted, onScopeDispose, provide, ref, watch } from 'vue'
import type { FlowModelEnvironment, FlowScenarioDriver } from '../../types/internal/flowModel.types'
import type {
	FlowScenario,
	FlowScenarioAction,
	FlowScenarioChoice,
	FlowScenarioChoices,
	FlowScenarioStep,
} from '../../types/data/flowScenario.types'
import type {
	FlowScenarioClock,
	FlowScenarioContext,
	FlowScenarioDetails,
	FlowScenarioModel,
	FlowScenarioRuntime,
	FlowTimelineBuild,
} from '../../types/internal/flowScenarioInternal.types'

const EMPTY_BUILD: FlowTimelineBuild = { entries: [], duration: 0 }

function flattenActions(steps: FlowScenarioStep[]): FlowScenarioAction[] {
	return steps.flatMap(step => {
		if (step.type === 'parallel') {
			return flattenActions(step.branches.flat())
		}
		if (step.type === 'choice') {
			return flattenActions(step.branches.flatMap(branch => branch.steps))
		}
		return [step]
	})
}

function useScenarioDetails(model: FlowScenarioModel, props: FlowModelProps, runtime: FlowScenarioRuntime): FlowScenarioDetails {
	const scenarios = computed(() => model.data.value.scenarios ?? [])
	const choices = computed<FlowScenarioChoices>(() => ({ ...runtime.resolved.value, ...props.choices }))
	const fromData = computed(() => scenarios.value.find(item => item.id === runtime.selected.value) ?? scenarios.value[0] ?? null)
	const simulated = computed(() =>
		fromData.value ? null : (model.notation.value.semantics?.simulate?.(model.graph.value, choices.value) ?? null),
	)
	const scenario = computed(() => fromData.value ?? simulated.value)
	const actions = computed(() => new Map(flattenActions(scenario.value?.steps ?? []).map(action => [action.id, action])))
	return {
		scenario,
		scenarios,
		actions,
		choices,
		isSimulated: computed(() => simulated.value !== null),
		isSilent: ref(false),
		select: id => {
			runtime.selected.value = id
		},
	}
}

function effectOf(graph: ComputedRef<FlowGraph>, model: FlowScenarioModel) {
	return (action: FlowScenarioAction) => {
		const edge = action.edge ? graph.value.edges.get(action.edge) : undefined
		return edge ? model.edgeKind(edge).effect : undefined
	}
}

function createClock(onTick: (delta: number) => void, environment: FlowModelEnvironment): FlowScenarioClock {
	let isRunning = false
	let frame = 0
	let last: number | null = null
	const loop = (now: number) => {
		if (!isRunning) {
			return
		}
		if (environment.isVisible() && last !== null) {
			onTick(now - last)
		}
		last = now
		if (isRunning) {
			frame = requestAnimationFrame(loop)
		}
	}
	return {
		start() {
			if (!isRunning) {
				isRunning = true
				last = null
				frame = requestAnimationFrame(loop)
			}
		},
		stop() {
			if (isRunning) {
				cancelAnimationFrame(frame)
			}
			isRunning = false
			last = null
		},
	}
}

function askOf(model: FlowScenarioModel, scenario: FlowScenario): (step: FlowScenarioChoice) => Promise<string | void> {
	return async step => {
		const initial = pickBranch(step, {})?.id ?? ''
		const outcome = await model.hooks.run('resolveChoice', { step, scenario }, initial)
		return outcome.value
	}
}

function reset(context: FlowScenarioContext, clock: FlowScenarioClock): void {
	context.session.token += 1
	clock.stop()
	context.runtime.status.value = 'idle'
	context.runtime.time.value = 0
	context.runtime.resolved.value = {}
}

function finish(context: FlowScenarioContext, clock: FlowScenarioClock): void {
	if (context.details.scenario.value?.isLoop) {
		context.runtime.time.value = 0
		return
	}
	context.runtime.status.value = 'ended'
	clock.stop()
}

function tick(context: FlowScenarioContext, clock: FlowScenarioClock, delta: number): void {
	const { runtime, build } = context
	const move = advanceClock({ time: runtime.time.value, delta, speed: runtime.speed.value, duration: build.value.duration })
	runtime.time.value = move.time
	if (move.status === 'ended') {
		finish(context, clock)
	}
}

function begin(context: FlowScenarioContext, clock: FlowScenarioClock, token: number): void {
	if (token !== context.session.token) {
		return
	}
	const isEmpty = context.build.value.duration <= 0
	context.runtime.status.value = isEmpty ? 'ended' : 'playing'
	if (!isEmpty) {
		clock.start()
	}
}

function createPlay(context: FlowScenarioContext, clock: FlowScenarioClock): FlowScenarioDriver['play'] {
	return id => {
		if (id !== undefined) {
			context.runtime.selected.value = id
		}
		const scenario = context.details.scenario.value
		if (!scenario || context.runtime.status.value === 'playing') {
			return
		}
		const isResume = context.runtime.status.value === 'paused'
		if (!isResume) {
			reset(context, clock)
		}
		const token = context.session.token
		if (isResume || !context.model.hooks.has('resolveChoice')) {
			begin(context, clock, token)
			return
		}
		void resolveScenarioChoices(scenario.steps, context.props.choices ?? {}, askOf(context.model, scenario)).then(resolved => {
			context.runtime.resolved.value = token === context.session.token ? resolved : context.runtime.resolved.value
			begin(context, clock, token)
		})
	}
}

function createSeek(context: FlowScenarioContext): FlowScenarioDriver['seek'] {
	return to => {
		const target = seekTarget(context.build.value, to)
		if (target === null) {
			return
		}
		const { runtime, build } = context
		runtime.time.value = target
		if (target >= build.value.duration) {
			runtime.status.value = 'ended'
		} else if (runtime.status.value !== 'playing') {
			runtime.status.value = 'paused'
		}
	}
}

function createStep(context: FlowScenarioContext, clock: FlowScenarioClock): FlowScenarioDriver['step'] {
	return direction => {
		const { runtime, build } = context
		const move = stepTarget(build.value, { status: runtime.status.value, time: runtime.time.value }, direction)
		context.session.token += 1
		clock.stop()
		runtime.time.value = move.time
		runtime.status.value = move.status
	}
}

function createPause(context: FlowScenarioContext, clock: FlowScenarioClock): FlowScenarioDriver['pause'] {
	return () => {
		context.session.token += 1
		if (context.runtime.status.value === 'playing') {
			clock.stop()
			context.runtime.status.value = 'paused'
		}
	}
}

function useLifecycle(context: FlowScenarioContext, clock: FlowScenarioClock, play: FlowScenarioDriver['play']): void {
	const { props, runtime, environment } = context
	watch(
		() => props.scenario,
		value => {
			runtime.selected.value = value ?? null
		},
		{ flush: 'sync' },
	)
	watch(runtime.selected, () => reset(context, clock), { flush: 'sync' })
	onMounted(() => {
		if (props.isAutoplay && !environment.isReducedMotion()) {
			context.details.isSilent.value = true
			play()
		}
	})
	onScopeDispose(() => reset(context, clock))
}

export function useFlowScenario(model: FlowScenarioModel, props: FlowModelProps, environment: FlowModelEnvironment): FlowScenarioDriver {
	const runtime: FlowScenarioRuntime = {
		selected: ref(props.scenario ?? null),
		status: ref('idle'),
		time: ref(0),
		speed: ref(1),
		resolved: ref({}),
	}
	const details = useScenarioDetails(model, props, runtime)
	if (getCurrentInstance()) {
		provide(FLOW_SCENARIO_DETAILS, details)
	}
	const build = computed<FlowTimelineBuild>(() => {
		const scenario = details.scenario.value
		return scenario ? buildTimeline(scenario, details.choices.value, { effectOf: effectOf(model.graph, model) }) : EMPTY_BUILD
	})
	const context: FlowScenarioContext = { model, props, environment, runtime, details, build, session: { token: 0 } }
	const clock = createClock(delta => tick(context, clock, delta), environment)
	const play = createPlay(context, clock)
	useLifecycle(context, clock, play)
	const info = { scenario: details.scenario, status: runtime.status, time: runtime.time, speed: runtime.speed }
	const byUser =
		<A extends unknown[]>(action: (...args: A) => void) =>
		(...args: A) => {
			details.isSilent.value = false
			action(...args)
		}
	return {
		state: computed(() =>
			snapshotScenario(
				{ scenario: info.scenario.value?.id ?? null, status: info.status.value, time: info.time.value, speed: info.speed.value },
				build.value,
			),
		),
		timeline: computed(() => build.value.entries),
		play: byUser(play),
		pause: byUser(createPause(context, clock)),
		stop: byUser(() => reset(context, clock)),
		seek: byUser(createSeek(context)),
		step: byUser(createStep(context, clock)),
		setSpeed: speed => {
			runtime.speed.value = clampSpeed(speed)
		},
	}
}
