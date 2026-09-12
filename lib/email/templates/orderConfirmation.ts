export function orderConfirmationTemplate(
  orderData: {
    orderId: string
    userName: string
    mealType: string
    planType: string
    price: number | string
    startDate: string
    building: string
    pickupPoint: string
  }
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333;">🍽️ Order Confirmed!</h1>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Hello ${orderData.userName},</h2>
        <p style="font-size: 16px; color: #666; line-height: 1.6;">
          Your order has been confirmed! Here are the details:
        </p>
      </div>

      <div style="background-color: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; border-bottom: 2px solid #f0ad4e; padding-bottom: 10px;">Order Details</h3>
        <table style="width: 100%; color: #666;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0;"><strong>Order ID:</strong></td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #f0ad4e;">${orderData.orderId}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0;"><strong>Meal Type:</strong></td>
            <td style="padding: 10px 0; text-align: right;">${orderData.mealType === 'veg' ? '🥬 Vegetarian' : '🍗 Non-Vegetarian'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0;"><strong>Plan:</strong></td>
            <td style="padding: 10px 0; text-align: right;">${orderData.planType === 'trial' ? '5-Day Trial' : 'Monthly'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0;"><strong>Price:</strong></td>
            <td style="padding: 10px 0; text-align: right;">₹${orderData.price}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0;"><strong>Start Date:</strong></td>
            <td style="padding: 10px 0; text-align: right;">${orderData.startDate}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0;"><strong>Building:</strong></td>
            <td style="padding: 10px 0; text-align: right;">${orderData.building}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0;"><strong>Pickup Point:</strong></td>
            <td style="padding: 10px 0; text-align: right;">${orderData.pickupPoint}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #e8f4f8; padding: 15px; border-left: 4px solid #5bc0de; margin-bottom: 20px;">
        <p style="margin: 0; color: #333; font-weight: bold;">💳 Payment Details</p>
        <p style="margin: 5px 0 0 0; color: #666;">
          No payment needed today! Pay ₹${orderData.price} on your first delivery day (${orderData.planType === 'trial' ? 'within 5 days' : 'on the subscription start date'}).
        </p>
      </div>

      <div style="background-color: #f0f7f0; padding: 15px; border-left: 4px solid #5cb85c; margin-bottom: 20px;">
        <p style="margin: 0; color: #333; font-weight: bold;">📋 What's Included</p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #666;">
          <li>Complete home-style lunch</li>
          <li>Rice, dal, seasonal vegetables</li>
          <li>Chapati, curd & pickle</li>
          <li>${orderData.mealType === 'veg' ? 'Paneer on applicable days' : 'Egg or Chicken on applicable days'}</li>
          <li>Monday – Friday delivery</li>
          <li>Delivery around 12:30 PM</li>
        </ul>
      </div>

      <div style="text-align: center; padding: 20px; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 14px; margin: 10px 0;">
          Questions? Reach out to us at <strong>support@grandmaslunchbox.com</strong>
        </p>
        <p style="color: #999; font-size: 12px; margin: 10px 0;">
          Thank you for choosing Grandma's Lunchbox! 🙏
        </p>
      </div>
    </div>
  `
}
