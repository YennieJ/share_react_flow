import { type ChangeEventHandler } from 'react';
import { useEdges, useReactFlow } from '@xyflow/react';

import { EDGE_COLORS, EdgeProgressType } from '../edges/EditableEdge/constants';
import { EditableEdge } from '../edges/EditableEdge';

import css from './Toolbar.module.css';

const typeVariants = [
  { type: EdgeProgressType.YES, label: 'Yes' },
  { type: EdgeProgressType.NO, label: 'No' },
  { type: EdgeProgressType.ALL, label: 'All' },
];

// Optional 라디오 버튼 그룹
const optionalVariants = [
  { value: 'Y', label: 'Y' },
  { value: 'N', label: 'N' },
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

  // Optional 변경 핸들러
  const onOptionalChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setEdges((edges) => {
      return edges.map((edge) => {
        if (edge.id === selectedEdge?.id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              optionalYn: e.target.value,
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
          <div className={css.edgevariants}>
            <div style={{ fontWeight: 'bold' }}>Optional</div>
            {optionalVariants.map((opt) => (
              <div key={opt.value}>
                <input
                  type="radio"
                  id={opt.value}
                  name="edge-optional"
                  value={opt.value}
                  checked={selectedEdge?.data?.optionalYn === opt.value}
                  disabled={!selectedEdge}
                  onChange={onOptionalChange}
                />
                <label htmlFor={opt.value}>{opt.label}</label>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
