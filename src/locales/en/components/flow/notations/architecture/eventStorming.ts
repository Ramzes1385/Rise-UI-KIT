/** Нотация Event Storming BaseFlowMap: виды, правила, предупреждения */
export const enFlowEventStorming = {
	flowEventStorming: {
		NOTATION: 'Event Storming',
		RULES_SUMMARY:
			'an actor issues a command, an aggregate or an external system produces an event, a policy triggers the next command',
		DOMAIN_EVENT: 'Domain event',
		COMMAND: 'Command',
		ACTOR: 'Actor',
		AGGREGATE: 'Aggregate',
		POLICY: 'Policy',
		READ_MODEL: 'Read model',
		EXTERNAL_SYSTEM: 'External system',
		HOTSPOT: 'Hotspot',
		OPPORTUNITY: 'Opportunity',
		CONTEXT: 'Bounded context',
		FLOW: 'Flow',
		WARN_GRAMMAR: 'The flow has no “{source}” → “{target}” step: {expected}',
		EXPECTED_ACTOR: 'an actor issues a command',
		EXPECTED_COMMAND: 'a command is handled by an aggregate or an external system',
		EXPECTED_AGGREGATE: 'an aggregate produces an event',
		EXPECTED_EXTERNAL: 'an external system produces an event',
		EXPECTED_EVENT: 'an event triggers a policy, updates a read model, or leads to a command',
		EXPECTED_POLICY: 'a policy triggers a command',
		EXPECTED_READ_MODEL: 'a read model is shown to an actor',
	},
}
