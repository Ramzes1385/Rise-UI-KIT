import { describeLibraryModel } from '../../libraryChecks'
import { buildSearch } from '../../../../models/library/ops/search'

describeLibraryModel('search', buildSearch, { parts: ['body', 'accent', 'detail', 'glass'], animations: ['scan'], anchorY: 1.08 })
