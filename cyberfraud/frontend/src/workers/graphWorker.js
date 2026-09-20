/**
 * Web Worker for D3 Force Simulation heavy calculations.
 * Offloads iterative force calculations from the UI thread to guarantee 60 FPS rendering.
 */

self.onmessage = function (e) {
  const { nodes, links, width = 900, height = 540 } = e.data;
  if (!nodes || !links) return;

  const nodeCount = nodes.length;
  const centerX = width / 2;
  const centerY = height / 2;

  // Initialize nodes with structured layout offsets based on threat pipeline group
  const simNodes = nodes.map((node, i) => {
    // Stage-based horizontal positioning:
    // Group 1 (C2): Left (-280px)
    // Group 2 (Victim): Center-Left (-90px)
    // Group 3 (Mule): Center-Right (+110px)
    // Group 4 (Crypto): Right (+290px)
    const group = node.group || (node.type === 'c2_ingress' || node.type === 'ip' || node.type === 'malware' ? 1 :
                  node.type === 'victim_device' || node.type === 'victim_target' ? 2 :
                  node.type === 'mule_account' ? 3 : 4);

    const baseOffsetX = (group - 2.5) * 190;
    const spreadY = ((i % 3) - 1) * 110 + (Math.random() - 0.5) * 40;

    return {
      ...node,
      group,
      x: node.x || (centerX + baseOffsetX + (Math.random() - 0.5) * 30),
      y: node.y || (centerY + spreadY),
      vx: 0,
      vy: 0,
      radius: node.type === 'c2_ingress' || node.type === 'malware' ? 28 : 24
    };
  });

  const nodeMap = new Map();
  simNodes.forEach((n) => nodeMap.set(n.id, n));

  // Run 180 iterations of force physics
  const iterations = 180;
  for (let tick = 0; tick < iterations; tick++) {
    const alpha = Math.pow(1 - tick / iterations, 1.5); // Smooth cooling factor

    // 1. Center gravity pull
    for (let i = 0; i < nodeCount; i++) {
      const n = simNodes[i];
      const targetX = centerX + (n.group - 2.5) * 180;
      n.vx += (targetX - n.x) * 0.04 * alpha;
      n.vy += (centerY - n.y) * 0.03 * alpha;
    }

    // 2. Repulsion & Collision between all node pairs
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const n1 = simNodes[i];
        const n2 = simNodes[j];
        let dx = n2.x - n1.x;
        let dy = n2.y - n1.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 0.1;

        const minDist = n1.radius + n2.radius + 60; // Desired clear spacing
        if (dist < minDist) {
          const force = ((minDist - dist) / dist) * 0.6 * alpha;
          const fx = dx * force;
          const fy = dy * force;
          n1.vx -= fx;
          n1.vy -= fy;
          n2.vx += fx;
          n2.vy += fy;
        }
      }
    }

    // 3. Link Spring Attraction
    links.forEach((link) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      const s = nodeMap.get(sourceId);
      const t = nodeMap.get(targetId);

      if (s && t) {
        let dx = t.x - s.x;
        let dy = t.y - s.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const targetDist = 130;
        const springForce = ((dist - targetDist) / dist) * 0.15 * alpha;

        const fx = dx * springForce;
        const fy = dy * springForce;
        s.vx += fx;
        s.vy += fy;
        t.vx -= fx;
        t.vy -= fy;
      }
    });

    // 4. Integrate velocities and apply dampening
    for (let i = 0; i < nodeCount; i++) {
      const n = simNodes[i];
      n.x += n.vx;
      n.y += n.vy;
      n.vx *= 0.75; // Velocity decay
      n.vy *= 0.75;

      // Keep within canvas bounds with margin
      const margin = 40;
      n.x = Math.max(margin, Math.min(width - margin, n.x));
      n.y = Math.max(margin, Math.min(height - margin, n.y));
    }
  }

  // Format finalized payload for main thread
  self.postMessage({
    nodes: simNodes,
    links: links.map((l) => ({
      source: typeof l.source === 'object' ? l.source.id : l.source,
      target: typeof l.target === 'object' ? l.target.id : l.target,
      value: l.value || 3
    })),
    completedTicks: iterations
  });
};
