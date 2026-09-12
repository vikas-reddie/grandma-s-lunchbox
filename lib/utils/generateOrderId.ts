export function generateOrderId(): string {
  const year = new Date().getFullYear()
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(5, '0')
  return `ORD-${year}-${randomNum}`
}
