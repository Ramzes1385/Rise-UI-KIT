/** Gantt diagrammasining oʻzbekcha matnlari (BaseGantt) */
export const uzGantt = {
	gantt: {
		LABEL: 'Gantt diagrammasi',
		TASK_COLUMN: 'Vazifa',
		TIMELINE: 'Vaqt shkalasi',
		LOADING: 'Vazifalar yuklanmoqda',
		EMPTY: 'Vazifalar yoʻq',
		TASK_LABEL: '{name}: {start} — {end}, {progress} %',
		MILESTONE_LABEL: '{name}: {date}, muhim bosqich',
		DEPENDENCIES: 'Bogʻliq: {list}',
		DEPENDENCY_ITEM: '«{name}» ({type})',
		DEPENDENCY_FS: 'tugashi — boshlanishi',
		DEPENDENCY_SS: 'boshlanishi — boshlanishi',
		DEPENDENCY_FF: 'tugashi — tugashi',
		DEPENDENCY_SF: 'boshlanishi — tugashi',
		EDIT_HINT: 'Strelkalar vazifani siljitadi, Shift va strelkalar davomiylikni oʻzgartiradi, Escape qatorga qaytaradi',
		MOVED: '«{name}» vazifasi koʻchirildi: {start} — {end}',
		RESIZED: '«{name}» vazifasi davomiyligi: {duration}, {start} — {end}',
		MILESTONE_MOVED: '«{name}» muhim bosqichi koʻchirildi: {date}',
		WARN_DUPLICATE_ID: 'BaseGantt: id «{id}» takrorlanmoqda — ikkinchi vazifa oʻtkazib yuborildi',
		WARN_BAD_DATE: 'BaseGantt: «{id}» vazifasida boshlanish yoki tugash sanasi notoʻgʻri — vazifa oʻtkazib yuborildi',
		WARN_BAD_RANGE: 'BaseGantt: «{id}» vazifasining tugashi boshlanishidan oldin — tugash boshlanishga tenglashtirildi',
		WARN_BAD_PARENT: 'BaseGantt: «{id}» vazifasining «{parentId}» ota vazifasi yoʻq — vazifa yuqori darajada koʻrsatildi',
		WARN_PARENT_CYCLE: 'BaseGantt: «{id}» vazifasining parentId qiymati sikl hosil qiladi — vazifa yuqori darajada koʻrsatildi',
		WARN_BAD_DEPENDENCY:
			'BaseGantt: «{id}» vazifasining «{dependencyId}» vazifasiga bogʻliqligi eʼtiborga olinmaydi — bunday vazifa yoʻq',
		WARN_EMPTY_DEPENDENCY:
			'BaseGantt: «{id}» vazifasining dependencies ida boʻsh qiymat (null yoki undefined) bor — u oʻtkazib yuborildi',
		WARN_BAD_DEPENDENCY_TYPE:
			'BaseGantt: «{id}» vazifasining «{dependencyId}» bilan aloqasining «{type}» turi nomaʼlum — «FS» qabul qilindi',
		WARN_DEPENDENCY_CYCLE:
			'BaseGantt: «{id}» vazifasining «{dependencyId}» vazifasiga bogʻliqligi eʼtiborga olinmaydi — u sikl hosil qiladi',
	},
}
