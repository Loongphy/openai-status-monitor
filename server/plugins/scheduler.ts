import { checkModelStatus } from '../tasks/checkModelStatus'
import { fetchProviderModels } from '../tasks/fetchProviderModels'
import { useScheduler } from '#scheduler'

export default defineNitroPlugin(() => {
  startScheduler()
})

function startScheduler() {
  const scheduler = useScheduler()

  scheduler.run(() => {
    fetchProviderModels()
  }).everyDays(1)

  scheduler.run(() => {
    checkModelStatus()
  }).everyMinutes(30)
}
