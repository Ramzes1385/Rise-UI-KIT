/** Нотация DFD BaseFlowMap: виды, стили, правила, предупреждения */
export const enFlowDfd = {
	flowDfd: {
		NOTATION: 'DFD',
		RULES_SUMMARY: 'every flow has a process at one end; every process has inputs and outputs',
		PROCESS: 'Process',
		STORE: 'Data store',
		ENTITY: 'External entity',
		FLOW: 'Data flow',
		PROP_CODE: 'Number (1.0, P1, D1)',
		STYLE_GANE_SARSON: 'Gane — Sarson',
		STYLE_YOURDON_DEMARCO: 'Yourdon — DeMarco',
		RULE_ENTITY_ENTITY: 'Two external entities cannot exchange data directly — a process is required',
		RULE_STORE_STORE: 'Two data stores cannot exchange data directly — a process is required',
		RULE_ENTITY_STORE: 'An external entity cannot read or write a data store directly — a process is required',
		WARN_MIRACLE: 'Process “{name}” has no inputs — its data appears from nowhere',
		WARN_BLACK_HOLE: 'Process “{name}” has no outputs — its data disappears',
	},
}
