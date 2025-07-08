export default function ToolUsagePanel() {
  const toolCalls = [
    {
      tool: "intent-classifier",
      model: "Groq/LLaMA-3.1",
      reason: "Classified intent as: place-order",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      tool: "menu-search",
      model: "Groq/LLaMA-3.1",
      reason: 'Found matching items for "pizza"',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      tool: "price-calculator",
      model: "Local Function",
      reason: "Calculated total order amount",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Tool Calls</h4>

      <div className="space-y-3">
        {toolCalls.map((call, index) => (
          <div key={index} className="bg-white rounded p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">{call.tool}</span>
              <span className="text-xs text-gray-500">{call.timestamp}</span>
            </div>
            <p className="text-xs text-gray-600 mb-1">Model: {call.model}</p>
            <p className="text-xs text-gray-700">{call.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
