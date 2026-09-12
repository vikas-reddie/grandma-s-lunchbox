import mongoose, { Schema, Document } from 'mongoose'

export interface IMenu extends Document {
  date: Date
  dayOfWeek: string
  mainDish: string
  sides: string
  mealType: 'veg' | 'non-veg' | 'both'
  createdAt: Date
  updatedAt: Date
}

const menuSchema = new Schema<IMenu>(
  {
    date: {
      type: Date,
      required: true,
    },
    dayOfWeek: {
      type: String,
      required: true,
    },
    mainDish: {
      type: String,
      required: true,
    },
    sides: {
      type: String,
      required: true,
    },
    mealType: {
      type: String,
      enum: ['veg', 'non-veg', 'both'],
      default: 'both',
    },
  },
  {
    timestamps: true,
  }
)

export const Menu = mongoose.models.Menu || mongoose.model<IMenu>('Menu', menuSchema)
