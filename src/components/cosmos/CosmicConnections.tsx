import type { CosmicNodeData } from './CosmicNode';

interface CosmicConnectionsProps {
  nodes: CosmicNodeData[];
  selectedNodeId?: string;
  originX?: number; // default 50%
  originY?: number; // default 54%
}

export function CosmicConnections({
  nodes,
  selectedNodeId,
  originX = 50,
  originY = 54,
}: CosmicConnectionsProps) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Core Origin Glow Filter */}
        <filter id="cosmosGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Global Energy Line Gradient */}
        <linearGradient id="centralBeam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#818cf8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.3" />
        </linearGradient>

        {/* Selected Highlight Beam */}
        <linearGradient id="activeBeam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#22d3ee" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {/* ── Ambient Constellation Shell Rings ─────────────────── */}
      {/* Inner Orbital Orbit */}
      <ellipse
        cx={originX}
        cy={originY}
        rx="26"
        ry="18"
        fill="none"
        stroke="#818cf8"
        strokeWidth="0.15"
        strokeDasharray="1 1.5"
        opacity="0.25"
      />

      {/* Outer Constellation Shell */}
      <ellipse
        cx={originX}
        cy={originY}
        rx="42"
        ry="28"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="0.18"
        strokeDasharray="2 3"
        opacity="0.2"
      />

      {/* ── Lateral Inter-Node Constellation Bridges ──────────── */}
      {nodes.map((node, i) => {
        // Connect each node to the next adjacent node in circle
        const nextNode = nodes[(i + 1) % nodes.length];
        if (!nextNode) return null;

        const isBackground = node.depth === 'background' || nextNode.depth === 'background';

        return (
          <line
            key={`bridge-${node.id}-${nextNode.id}`}
            x1={node.x}
            y1={node.y}
            x2={nextNode.x}
            y2={nextNode.y}
            stroke="#a5b4fc"
            strokeWidth={isBackground ? '0.12' : '0.18'}
            strokeDasharray="0.8 1.2"
            opacity={isBackground ? '0.18' : '0.28'}
          />
        );
      })}

      {/* ── Radial Energy Paths (YOU -> Each Node) ─────────────── */}
      {nodes.map((node) => {
        const isSelected = selectedNodeId === node.id;

        // Quadratic curved control point pulling slightly inward toward origin
        const midX = (originX + node.x) / 2 + (node.x > originX ? -2 : 2);
        const midY = (originY + node.y) / 2 + (node.y > originY ? -2 : 2);

        const pathData = `M ${originX} ${originY} Q ${midX} ${midY} ${node.x} ${node.y}`;

        return (
          <g key={`path-${node.id}`}>
            {/* Luminous Glow Underlay */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? '#22d3ee' : '#818cf8'}
              strokeWidth={isSelected ? '0.8' : '0.35'}
              opacity={isSelected ? '0.7' : '0.2'}
              filter="url(#cosmosGlow)"
            />

            {/* Core Energy Stream */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? 'url(#activeBeam)' : 'url(#centralBeam)'}
              strokeWidth={isSelected ? '0.5' : '0.22'}
              strokeDasharray={isSelected ? '1.5 1' : '2 2'}
              opacity={isSelected ? '0.95' : '0.45'}
              className={isSelected ? 'animate-pulse' : undefined}
            />

            {/* Pulsing Light Bead along selected stream */}
            {isSelected && (
              <circle
                cx={midX}
                cy={midY}
                r="0.75"
                fill="#ffffff"
                filter="url(#cosmosGlow)"
                className="animate-ping"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
