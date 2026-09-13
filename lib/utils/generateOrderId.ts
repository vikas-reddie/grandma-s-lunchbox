import { Counter } from '@/lib/db/models/Counter'

export async function generateOrderId(): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'booking' },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  return `ORD-${counter.sequence}`
}
