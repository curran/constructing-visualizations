Our goal here is to create the next example in the sequence, and we already have these examples: the pseudo scatter plot, responsive pseudo scatter plot, etc. Let us start by making a copy of the fifth example, Responsive Pseudo Scatter Plot, and let's create a new example that comes after the scatter plot example, which should be called Clickable Circles. And the goal here is just to make it pretty much an exact copy of the Responsive Pseudo Scatter Plot, with the addition of the following reference implementation, which will highlight the circles that you click on, and we need to keep track of which circle was clicked on using useState from React.

The reference implementation:

```
  selection
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (d) => xScale(d.x))
    .attr('cy', (d) => yScale(d.y))
    .attr('r', 30)
    .attr('fill', (d) =>
      d.id === selectedCircleId ? 'white' : 'black',
    )
    .attr('stroke', (d) =>
      d.id === selectedCircleId ? 'black' : 'none',
    )
    .attr('stroke-width', (d) =>
      d.id === selectedCircleId ? 5 : 0,
    )
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      onCircleClick(d.id);
    });
```