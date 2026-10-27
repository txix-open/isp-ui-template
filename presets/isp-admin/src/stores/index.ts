import { baseSetupStore } from 'isp-admin-ui-kit'
import { itemsApi } from '../services/itemsApi'

export const store = baseSetupStore({ itemsApi })
export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
