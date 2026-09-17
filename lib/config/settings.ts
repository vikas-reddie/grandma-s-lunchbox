export interface AppSettings {
  plans: {
    trialPrice: number
    monthlyPrice: number
  }
  pickupPoints: string[]
  location: {
    city: string
    state: string
    areaDescription: string
  }
  contact: {
    name: string
    phone: string
    whatsapp: string
    email: string
  }
  payment: {
    upiId: string
    payeeName: string
  }
  delivery: {
    days: string[]
    time: string
    trialDays: number
    monthlyDays: number
  }
}

export const defaultSettings: AppSettings = {
  plans: {
    trialPrice: 399,
    monthlyPrice: 1499,
  },
  pickupPoints: ['Main Gate', 'Reception', 'Cafeteria', 'Parking'],
  location: {
    city: 'Sricity',
    state: 'Andhra Pradesh',
    areaDescription: 'Selected offices across Sricity, Andhra Pradesh.',
  },
  contact: {
    name: 'B VIKAS REDDY',
    phone: '8328286804',
    whatsapp: '8328286804',
    email: '',
  },
  payment: {
    upiId: '8328286804@ybl',
    payeeName: 'Vikas',
  },
  delivery: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    time: 'around 12:30 PM',
    trialDays: 5,
    monthlyDays: 30,
  },
}
