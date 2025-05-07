export default function CustomArrow({ id, color, strokeWidth }: { id: string; color: string; strokeWidth: number }) {
  return (
    <marker
      className="react-flow__arrowhead"
      id={id}
      markerWidth="12.5"
      markerHeight="12.5"
      viewBox="-10 -10 20 20"
      markerUnits="strokeWidth"
      orient="auto-start-reverse"
      refX="0"
      refY="0"
    >
      <polyline
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        fill="none"
        points="-7,-6 0,0 -7,6"
      />
    </marker>
  );
}
