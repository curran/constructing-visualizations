Currently, we have a single page that renders an SVG "pseudo visualization", located in `src/App.tsx`.

The goal is to change that so it's a split pane, with a list of example links on the left, e.g. "Example 1", "Example 2", etc., and on the right it displays the selected example.

Please formulate a plan to set up this layout with Tailwind classes and flexbox, and also formulate a plan to use React Router to track the selected example, e.g. `?example=1` in the URL, so that we can deep link into the examples.

Also, please build out the first 3 examples:

1. "Pseudo Scatter Plot"

```
function PseudoScatterPlot() {
  return (
      <svg width="960" height="500">
        <circle cx="132" cy="391" r="34"></circle>
        <circle cx="330" cy="349" r="34"></circle>
        <circle cx="410" cy="192" r="34"></circle>
        <circle cx="527" cy="257" r="34"></circle>
        <circle cx="688" cy="119" r="34"></circle>
        <circle cx="878" cy="55" r="34"></circle>
      </svg>
  )
}
```

2. "Pseudo Bar Chart"

```
function PseudoBarChart() {
  return (
<svg width="960" height="500">
      <rect x="43" y="34" width="190" height="424"></rect>
      <rect x="270" y="161" width="190" height="297"></rect>
      <rect x="497" y="253" width="190" height="205"></rect>
      <rect x="724" y="343" width="190" height="115"></rect>
    </svg>
  )
}
```

3. Pseudo Line Chart

```
function PseudoBarChart() {
  return (
<svg width="960" height="500">
      <path d="M 60 440
           L 260 180
           L 380 320
           L 520 130
           L 660 300
           L 900 50" stroke="black" fill="none" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  )
}
```

React router reference:

```
import { BrowserRouter } from "react-router";

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
```

Install React Router
Next install React Router from npm:

npm i react-router
Copy code to clipboard
Create a Router and Render
Create a router and pass it to RouterProvider:

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

const router = createBrowserRouter([
{
path: "/",
element: <div>Hello World</div>,
},
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
<RouterProvider router={router} />,
);
