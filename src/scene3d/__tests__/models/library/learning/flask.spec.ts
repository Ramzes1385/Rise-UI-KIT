import { describeLibraryModel } from '../../libraryChecks'
import { buildFlask } from '../../../../models/library/learning/flask'

describeLibraryModel('flask', buildFlask, { parts: ['accent', 'glass'], animations: [], anchorY: 0.98 })
