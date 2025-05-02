import { Handle, Position } from '@xyflow/react';

import css from './CustomNode.module.css';

// This is just a very simple node with a handle on each side
// Because ConnectionMode is set to 'loose' all of them are
// of type 'source' and can be connected to each other
// 왼쪽 핸들러 연결 시작 불가
export function CustomNode() {
  return (
    <div className={css.container}>
      <Handle type="source" position={Position.Left} isConnectableStart={false} id="left" className={css.handle} />

      <Handle type="source" position={Position.Right} id="right" className={css.handle} />
    </div>
  );
}
