import { useSearchParams } from 'react-router-dom'
import { examples, examplesMap, defaultExample } from './examples'

function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedExampleName = searchParams.get('example') || defaultExample
  const selectedExample = examplesMap.get(selectedExampleName)
  const SelectedComponent = selectedExample?.component

  const handleSelectExample = (exampleName: string) => {
    setSearchParams({ example: exampleName })
  }

  return (
    <div className="w-screen h-screen flex bg-white">
      {/* Left Sidebar - Navigation */}
      <div className="w-[250px] border-r border-gray-300 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Examples</h2>
        <nav className="space-y-2">
          {examples.map((example) => (
            <button
              key={example.name}
              onClick={() => handleSelectExample(example.name)}
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
                selectedExampleName === example.name
                  ? 'font-bold bg-gray-100'
                  : 'hover:bg-gray-50'
              }`}
            >
              {example.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Right Content - Visualization */}
      <div className="flex-1 flex items-center justify-center overflow-auto">
        {SelectedComponent ? <SelectedComponent /> : <div>Example not found</div>}
      </div>
    </div>
  )
}

export default App
