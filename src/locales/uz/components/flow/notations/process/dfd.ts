/** Нотация DFD BaseFlowMap: виды, стили, правила, предупреждения */
export const uzFlowDfd = {
	flowDfd: {
		NOTATION: 'DFD',
		RULES_SUMMARY: 'oqimning kamida bir uchi — jarayon; jarayonning kirishi ham, chiqishi ham bor',
		PROCESS: 'Jarayon',
		STORE: 'Ma’lumotlar ombori',
		ENTITY: 'Tashqi ob’ekt',
		FLOW: 'Ma’lumotlar oqimi',
		PROP_CODE: 'Raqam (1.0, P1, D1)',
		STYLE_GANE_SARSON: 'Geyn — Sarson',
		STYLE_YOURDON_DEMARCO: 'Yordon — Demarko',
		RULE_ENTITY_ENTITY: 'Ikki tashqi ob’ekt ma’lumot bilan bevosita almashmaydi — jarayon kerak',
		RULE_STORE_STORE: 'Ikki ombor ma’lumot bilan bevosita almashmaydi — jarayon kerak',
		RULE_ENTITY_STORE: 'Tashqi ob’ekt omborni bevosita o‘qimaydi va yozmaydi — jarayon kerak',
		WARN_MIRACLE: '«{name}» jarayonida kirish yo‘q — ma’lumot hech qayerdan olinmaydi',
		WARN_BLACK_HOLE: '«{name}» jarayonida chiqish yo‘q — ma’lumot yo‘qoladi',
	},
}
