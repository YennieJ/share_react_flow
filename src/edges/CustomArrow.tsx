export default function CustomArrow({ id, color, strokeWidth }: { id: string; color: string; strokeWidth: number }) {
  return (
    <marker
      id={id}
      markerWidth="12.5"
      markerHeight="12.5"
      viewBox="-10 -10 20 20"
      markerUnits="strokeWidth"
      orient="auto-start-reverse"
      refX="0"
      refY="0"
    >
      <polygon
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        fill={color}
        points="0,0 -8,5 -8,-5"
      />
    </marker>
  );
}
