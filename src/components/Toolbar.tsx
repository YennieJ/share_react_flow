import { type ChangeEventHandler } from 'react';
import { useEdges, useReactFlow } from '@xyflow/react';

import { EDGE_COLORS, ProgressEdgeType } from '../edges/EditableEdge/constants';
import { EditableEdge } from '../edges/EditableEdge';

import css from './Toolbar.module.css';

const typeVariants = [
  { type: ProgressEdgeType.YES, label: 'Yes' },
  { type: ProgressEdgeType.NO, label: 'No' },
  { type: ProgressEdgeType.ALL, label: 'All' },
];

// A toolbar that allows the user to change the algorithm of the selected edge
export function Toolbar() {
  const edges = useEdges();
  const { setEdges } = useReactFlow();

  const selectedEdge = edges.find((edge) => edge.selected) as
    | EditableEdge
    | undefined;

  // 타입 변경 핸들러
  const onTypeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setEdges((edges) => {
      return edges.map((edge) => {
        if (edge.id === selectedEdge?.id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              type: e.target.value,
            },
          };
        }
        return edge;
      });
    });
  };

  return (
    <div className={css.toolbar}>
      <div>
        {selectedEdge
          ? `Selected edge: ${selectedEdge.id}`
          : '👉 Select an edge to change its type here.'}
      </div>
      {selectedEdge && (
        <>
          <div className={css.edgevariants}>
            <div style={{ fontWeight: 'bold' }}>Edge Process Type</div>
            {typeVariants.map((typeVariant) => (
              <div key={typeVariant.type}>
                <input
                  type="radio"
                  id={typeVariant.type}
                  name="edge-type"
                  value={typeVariant.type}
                  checked={selectedEdge?.data?.type === typeVariant.type}
                  disabled={!selectedEdge}
                  style={{
                    accentColor: EDGE_COLORS[typeVariant.type],
                    color: EDGE_COLORS[typeVariant.type],
                  }}
                  onChange={onTypeChange}
                />
                <label
                  htmlFor={typeVariant.type}
                  style={{
                    color: selectedEdge ? EDGE_COLORS[typeVariant.type] : '',
                  }}
                >
                  {typeVariant.label}
                </label>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
