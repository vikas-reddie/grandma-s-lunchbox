import mongoose, { Schema, Document } from 'mongoose'

interface ICounter extends Document {
  _id: string
  sequence: number
}

const counterSchema = new Schema<ICounter>({
  _id: String,
  sequence: {
    type: Number,
    default: 0,
  },
})

export const Counter = mongoose.models.Counter || mongoose.model<ICounter>('Counter', counterSchema)
