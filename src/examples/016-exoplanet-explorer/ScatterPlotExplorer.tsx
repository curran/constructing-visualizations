import { DataProvider } from './DataProvider';
import { InteractionProvider } from './InteractionProvider';
import { Explorer } from './Explorer';

// The entry component wires up the two contexts for the example: data (loading
// and parsing) on the outside, and interaction state inside it. Every layer
// below reads from these contexts rather than receiving props threaded down
// from here.
export function ScatterPlotExplorer() {
  return (
    <InteractionProvider>
      <DataProvider>
        <Explorer />
      </DataProvider>
    </InteractionProvider>
  );
}
