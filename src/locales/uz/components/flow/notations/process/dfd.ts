/** Нотация DFD BaseFlowMap: виды, стили, правила, предупреждения */
export const uzFlowDfd = {
	flowDfd: {
		NOTATION: 'DFD',
		RULES_SUMMARY: 'oqimning kamida bir uchi — jarayon; jarayonning kirishi ham, chiqishi ham bor',
		PROCESS: 'Jarayon',
		STORE: 'Maʼlumotlar ombori',
		ENTITY: 'Tashqi obʼekt',
		FLOW: 'Maʼlumotlar oqimi',
		PROP_CODE: 'Raqam (1.0, P1, D1)',
		STYLE_GANE_SARSON: 'Geyn — Sarson',
		STYLE_YOURDON_DEMARCO: 'Yordon — Demarko',
		RULE_ENTITY_ENTITY: 'Ikki tashqi obʼekt maʼlumot bilan bevosita almashmaydi — jarayon kerak',
		RULE_STORE_STORE: 'Ikki ombor maʼlumot bilan bevosita almashmaydi — jarayon kerak',
		RULE_ENTITY_STORE: 'Tashqi obʼekt omborni bevosita oʻqimaydi va yozmaydi — jarayon kerak',
		WARN_MIRACLE: '«{name}» jarayonida kirish yoʻq — maʼlumot hech qayerdan olinmaydi',
		WARN_BLACK_HOLE: '«{name}» jarayonida chiqish yoʻq — maʼlumot yoʻqoladi',
	},
}
