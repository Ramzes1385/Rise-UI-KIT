/** Нотация C4 BaseFlowMap: виды, правила, предупреждения */
export const uzFlowC4 = {
	flowC4: {
		NOTATION: 'C4',
		RULES_SUMMARY:
			'har bir bog’lanish yoziladi; chegaralarda konteynerlar va komponentlar bo’ladi; odamlar chegaradan tashqarida turadi',
		PERSON: 'Odam',
		SOFTWARE_SYSTEM: 'Dasturiy tizim',
		CONTAINER: 'Konteyner',
		COMPONENT: 'Komponent',
		EXTERNAL_PERSON: 'Tashqi odam',
		EXTERNAL_SYSTEM: 'Tashqi tizim',
		ENTERPRISE_BOUNDARY: 'Korxona chegarasi',
		SYSTEM_BOUNDARY: 'Tizim chegarasi',
		CONTAINER_BOUNDARY: 'Konteyner chegarasi',
		RELATIONSHIP: 'Bog’lanish',
		PROP_TECHNOLOGY: 'Texnologiya',
		CARD_LINE: '[{kind}: {technology}]',
		CARD_LINE_PLAIN: '[{kind}]',
		RULE_CONTAIN: '“{group}” ichiga faqat quyidagilarni qo’yish mumkin: {kinds}',
		WARN_NO_LABEL: '“{source}” → “{target}” bog’lanishida yozuv yo’q: C4 dagi har bir chiziq yoziladi',
	},
}
