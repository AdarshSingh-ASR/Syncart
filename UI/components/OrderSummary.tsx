import type { OrderItem } from "./AgentInteraction"

interface OrderSummaryProps {
  items: OrderItem[]
}

export default function OrderSummary({ items }: OrderSummaryProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No items in order yet</p>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-900">Total</p>
              <p className="text-lg font-bold text-green-600">${total.toFixed(2)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
