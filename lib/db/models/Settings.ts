import mongoose, { Document, Schema } from 'mongoose'
import { AppSettings, defaultSettings } from '@/lib/config/settings'

export interface ISettings extends Document, Omit<AppSettings, 'plans' | 'location' | 'contact' | 'payment' | 'delivery'> {
  key: string
  plans: AppSettings['plans']
  location: AppSettings['location']
  contact: AppSettings['contact']
  payment: AppSettings['payment']
  delivery: AppSettings['delivery']
}

const settingsSchema = new Schema<ISettings>({
  key: { type: String, unique: true, default: 'global' },
  plans: {
    trialPrice: { type: Number, default: defaultSettings.plans.trialPrice },
    monthlyPrice: { type: Number, default: defaultSettings.plans.monthlyPrice },
  },
  pickupPoints: { type: [String], default: defaultSettings.pickupPoints },
  location: {
    city: { type: String, default: defaultSettings.location.city },
    state: { type: String, default: defaultSettings.location.state },
    areaDescription: { type: String, default: defaultSettings.location.areaDescription },
  },
  contact: {
    name: { type: String, default: defaultSettings.contact.name },
    phone: { type: String, default: defaultSettings.contact.phone },
    whatsapp: { type: String, default: defaultSettings.contact.whatsapp },
    email: { type: String, default: defaultSettings.contact.email },
  },
  payment: {
    upiId: { type: String, default: defaultSettings.payment.upiId },
    payeeName: { type: String, default: defaultSettings.payment.payeeName },
  },
  delivery: {
    days: { type: [String], default: defaultSettings.delivery.days },
    time: { type: String, default: defaultSettings.delivery.time },
    trialDays: { type: Number, default: defaultSettings.delivery.trialDays },
    monthlyDays: { type: Number, default: defaultSettings.delivery.monthlyDays },
  },
}, { timestamps: true })

export const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema)
