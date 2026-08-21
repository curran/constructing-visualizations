import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { examples, examplesMap, defaultExample } from './examples';

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedExampleId = searchParams.get('example') || defaultExample;
  const selectedExample = examplesMap.get(selectedExampleId);
  const SelectedComponent = selectedExample?.component;
  const hideSidebar = searchParams.has('hideSidebar');

  const handleSelectExample = useCallback(
    (exampleId: string) => {
      setSearchParams({ example: exampleId });
    },
    [setSearchParams],
  );

  const toggleSidebar = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    if (newParams.has('hideSidebar')) {
      newParams.delete('hideSidebar');
    } else {
      newParams.set('hideSidebar', 'true');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  return (
    <div className="w-screen h-screen flex bg-white">
      {/* Left Sidebar - Navigation */}
      {!hideSidebar && (
        <div className="w-[250px] border-r border-gray-300 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Examples</h2>
          <nav className="space-y-2">
            {examples.map((example) => (
              <button
                key={example.id}
                onClick={() => handleSelectExample(example.id)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  selectedExampleId === example.id ? 'font-bold bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                {example.name}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Right Content - Visualization */}
      <div className="flex-1 flex items-center justify-center overflow-auto">
        {SelectedComponent ? <SelectedComponent /> : <div>Example not found</div>}
      </div>
    </div>
  );
}

export default App;
