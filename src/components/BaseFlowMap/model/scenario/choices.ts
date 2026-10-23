import type { FlowChoiceAsk } from '../../types/internal/flowScenarioInternal.types'
import type { FlowScenarioBranch, FlowScenarioChoice, FlowScenarioChoices, FlowScenarioStep } from '../../types/data/flowScenario.types'

function findBranch(step: FlowScenarioChoice, key: string | undefined): FlowScenarioBranch | undefined {
	if (key === undefined) {
		return undefined
	}
	return step.branches.find(branch => branch.id === key || branch.condition === key)
}

export function pickBranch(step: FlowScenarioChoice, choices: FlowScenarioChoices): FlowScenarioBranch | undefined {
	return findBranch(step, choices[step.id]) ?? findBranch(step, step.defaultBranch) ?? step.branches[0]
}

async function resolveStep(step: FlowScenarioStep, resolved: FlowScenarioChoices, ask: FlowChoiceAsk): Promise<void> {
	if (step.type === 'parallel') {
		await resolveList(step.branches.flat(), resolved, ask)
		return
	}
	if (step.type !== 'choice') {
		return
	}
	if (!findBranch(step, resolved[step.id])) {
		const branch = findBranch(step, (await ask(step)) || undefined)
		if (branch) {
			resolved[step.id] = branch.id
		}
	}
	const picked = pickBranch(step, resolved)
	if (picked) {
		await resolveList(picked.steps, resolved, ask)
	}
}

async function resolveList(steps: FlowScenarioStep[], resolved: FlowScenarioChoices, ask: FlowChoiceAsk): Promise<void> {
	await steps.reduce<Promise<void>>((chain, step) => chain.then(() => resolveStep(step, resolved, ask)), Promise.resolve())
}

export async function resolveScenarioChoices(
	steps: FlowScenarioStep[],
	choices: FlowScenarioChoices,
	ask: FlowChoiceAsk,
): Promise<FlowScenarioChoices> {
	const resolved: FlowScenarioChoices = { ...choices }
	await resolveList(steps, resolved, ask)
	return resolved
}
