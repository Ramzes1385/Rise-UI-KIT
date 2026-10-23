/** Нотация DFD BaseFlowMap: виды, стили, правила, предупреждения */
export const zhFlowDfd = {
	flowDfd: {
		NOTATION: 'DFD',
		RULES_SUMMARY: '每条数据流至少一端是处理；每个处理都有输入和输出',
		PROCESS: '处理',
		STORE: '数据存储',
		ENTITY: '外部实体',
		FLOW: '数据流',
		PROP_CODE: '编号（1.0、P1、D1）',
		STYLE_GANE_SARSON: 'Gane — Sarson',
		STYLE_YOURDON_DEMARCO: 'Yourdon — DeMarco',
		RULE_ENTITY_ENTITY: '两个外部实体不能直接交换数据——需要经过处理',
		RULE_STORE_STORE: '两个数据存储不能直接交换数据——需要经过处理',
		RULE_ENTITY_STORE: '外部实体不能直接读写数据存储——需要经过处理',
		WARN_MIRACLE: '处理“{name}”没有输入——数据凭空出现',
		WARN_BLACK_HOLE: '处理“{name}”没有输出——数据消失',
	},
}
