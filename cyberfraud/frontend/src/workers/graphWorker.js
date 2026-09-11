/**
 * Web Worker for D3 Force Simulation heavy calculations.
 */
self.onmessage = function (e) {
  const { nodes, links } = e.data;
  if (!nodes || !links) return;

  // Simple force simulation algorithm inside worker
  const width = 800;
  const height = 500;

  // Initialize positions
  const simNodes = nodes.map((node, i) => ({
    ...node,
    x: node.x || width / 2 + (Math.random() - 0.5) * 300,
    y: node.y || height / 2 + (Math.random() - 0.5) * 300,
    vx: 0,
    vy: 0
  }));

  const nodeMap = new Map();
  simNodes.forEach(n => nodeMap.set(n.id, n));

  // Run 120 iterations of force calculations off-main-thread
  for (let tick = 0; tick < 120; tick++) {
    // Repulsion between all node pairs
    for (let i = 0; i < simNodes.length; i++) {
      for (let j = i + 1; j < simNodes.length; j++) {
        const n1 = simNodes[i];
        const n2 = simNodes[j];
        let dx = n2.x - n1.x;
        let dy = n2.y - n1.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 180) {
          const force = (180 - dist) / dist * 0.5;
          n1.x -= dx * force * 0.1;
          n1.y -= dy * force * 0.1;
          n2.x += dx * force * 0.1;
          n2.y += dy * force * 0.1;
        }
      }
    }

    // Link attraction forces
    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      const s = nodeMap.get(sourceId);
      const t = nodeMap.get(targetId);
      if (s && t) {
        let dx = t.x - s.x;
        let dy = t.y - s.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const desiredDist = 120;
        const force = (dist - desiredDist) / dist * 0.1;
        s.x += dx * force;
        s.y += dy * force;
        t.x -= dx * force;
        t.y -= dy * force;
      }
    });
  }

  self.postMessage({ nodes: simNodes, links });
};
