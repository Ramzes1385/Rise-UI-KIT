/** Нотация DFD BaseFlowMap: виды, стили, правила, предупреждения */
export const jaFlowDfd = {
	flowDfd: {
		NOTATION: 'DFD',
		RULES_SUMMARY: 'データフローの少なくとも一端はプロセス。プロセスには入力と出力が必要',
		PROCESS: 'プロセス',
		STORE: 'データストア',
		ENTITY: '外部エンティティ',
		FLOW: 'データフロー',
		PROP_CODE: '番号（1.0、P1、D1）',
		STYLE_GANE_SARSON: 'ゲイン・サーソン',
		STYLE_YOURDON_DEMARCO: 'ヨードン・デマルコ',
		RULE_ENTITY_ENTITY: '外部エンティティ同士は直接データをやり取りできません。プロセスが必要です',
		RULE_STORE_STORE: 'データストア同士は直接データをやり取りできません。プロセスが必要です',
		RULE_ENTITY_STORE: '外部エンティティはデータストアを直接読み書きできません。プロセスが必要です',
		WARN_MIRACLE: 'プロセス「{name}」に入力がありません。データの出所が不明です',
		WARN_BLACK_HOLE: 'プロセス「{name}」に出力がありません。データが消えます',
	},
}
