export function orderConfirmationTemplate(
  orderData: {
    orderId: string
    userName: string
    mealType: string
    planType: string
    price: number | string
    startDate: string
    endDate: string
    pickupPoint: string
  }
): string {
  const mealLabel = orderData.mealType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'
  const planLabel = orderData.planType === 'trial' ? '5-Day Trial' : 'Monthly'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Order Confirmed - Grandma's Lunchbox</title>
<style>
  body { margin:0; padding:0; background:#E7EEDF; font-family:Verdana, sans-serif; color:#26362E; }
  .wrapper { width:100%; padding:40px 16px; box-sizing:border-box; }
  .email { max-width:560px; margin:0 auto; background:#FBF8F0; border-radius:6px; overflow:hidden; }
  .hero { background:#123C2B; padding:34px 32px 30px; text-align:center; }
  .hero img { width:118px; height:118px; border-radius:50%; display:block; margin:0 auto 18px; border:3px solid #FBF8F0; object-fit:cover; }
  .eyebrow { font-size:12px; font-weight:700; letter-spacing:.04em; color:#A83216; background:#FBF8F0; display:inline-block; padding:4px 12px; border-radius:20px; margin:0 0 14px; }
  .hero h1 { font-family:Georgia,serif; font-weight:500; font-size:28px; line-height:1.2; color:#FBF8F0; margin:0; }
  .hero h1 em { color:#E7A472; }
  .body-pad { padding:32px 32px 8px; }
  .greeting { font-family:Georgia,serif; font-weight:700; font-size:18px; color:#123C2B; margin:0 0 10px; }
  .lede { font-size:15px; line-height:1.6; color:#4B5A50; margin:0 0 28px; }
  .section-title { font-family:Georgia,serif; font-weight:700; font-size:17px; color:#123C2B; margin:0 0 14px; }
  table { width:100%; border-collapse:collapse; margin-bottom:28px; }
  td { padding:10px 0; font-size:14px; border-bottom:1px solid #EBE3CC; }
  tr:last-child td { border-bottom:none; }
  .label { color:#7C8B81; width:42%; }
  .value { color:#26362E; font-weight:500; text-align:right; }
  .order-id { color:#A83216; font-weight:700; }
  .payment { background:#FBF1DC; border-left:3px solid #A83216; padding:16px 20px; margin:0 32px 24px; }
  .payment strong { color:#A83216; font-size:14px; }
  .payment p { font-size:14px; line-height:1.55; color:#5C4A3B; margin:4px 0 0; }
  .included { background:#E7EEDF; padding:22px 24px 20px; margin:0 32px 32px; border-left:3px solid #123C2B; }
  .included strong { font-family:Georgia,serif; color:#123C2B; }
  .included ul { margin:12px 0 0; padding:0; list-style:none; }
  .included li { font-size:14px; line-height:1.5; color:#33463A; margin-bottom:8px; }
  .included li::before { content:'●'; color:#123C2B; margin-right:12px; }
  .footer { text-align:center; padding:6px 32px 34px; }
  .footer p { font-size:13px; line-height:1.6; color:#7C8B81; margin:0 0 6px; }
  .footer a { color:#A83216; text-decoration:none; font-weight:700; }
  .thanks { font-family:Georgia,serif; font-style:italic; color:#123C2B !important; margin-top:14px !important; }
  @media(max-width:480px) { .hero,.body-pad { padding-left:20px; padding-right:20px; } .payment,.included { margin-left:20px; margin-right:20px; } .hero h1 { font-size:23px; } }
</style>
</head>
<body>
<div class="wrapper"><div class="email">
  <div class="hero">
    <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2012%2C%202026%2C%2005_02_26%20PM-nfLMqUqsIl5jluhhngWFv1fIGayTQN.png" alt="Grandma's Lunchbox">
    <p class="eyebrow">ORDER CONFIRMED</p>
    <h1>Your home-cooked lunch<br>is <em>on its way.</em></h1>
  </div>
  <div class="body-pad">
    <p class="greeting">Hello ${orderData.userName}</p>
    <p class="lede">Your subscription is confirmed. Here are the details for your first delivery.</p>
    <p class="section-title">Order details</p>
    <table>
      <tr><td class="label">Order ID</td><td class="value order-id">${orderData.orderId}</td></tr>
      <tr><td class="label">Meal type</td><td class="value">${mealLabel}</td></tr>
      <tr><td class="label">Plan</td><td class="value">${planLabel}</td></tr>
      <tr><td class="label">Price</td><td class="value">₹${orderData.price}</td></tr>
      <tr><td class="label">Start date</td><td class="value">${orderData.startDate}</td></tr>
      <tr><td class="label">End date</td><td class="value">${orderData.endDate}</td></tr>
      <tr><td class="label">Pickup point</td><td class="value">${orderData.pickupPoint}</td></tr>
    </table>
  </div>
  <div class="payment"><strong>Payment details</strong><p>No payment needed today. Pay ₹${orderData.price} on your first delivery day.</p></div>
  <div class="included"><strong>What's included</strong><ul>
    <li>Complete home-style lunch</li>
    <li>Rice, dal, and seasonal vegetables</li>
    <li>Chapati, curd &amp; pickle</li>
    <li>${orderData.mealType === 'veg' ? 'Paneer on applicable days' : 'Egg or chicken on applicable days'}</li>
    <li>Monday-Friday delivery, around 12:30 PM</li>
  </ul></div>
  <div class="footer">
    <p>Questions? Reach out to us at <a href="mailto:grandmalunchbox@gmail.com">grandmalunchbox@gmail.com</a></p>
    <p class="thanks">Thank you for choosing Grandma's Lunchbox</p>
  </div>
</div></div>
</body>
</html>`
}
