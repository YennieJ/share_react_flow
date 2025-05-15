import { Handle, Position } from '@xyflow/react';

import css from './CustomNode.module.css';
import { useAppStore } from '../store';

export function CustomNode() {
  const isSourceHandleReconnecting = useAppStore((state) => state.isSourceHandleReconnecting);

  return (
    <div className={css.container}>
      <Handle
        type="source"
        position={Position.Left}
        isConnectableStart={false}
        isConnectableEnd={isSourceHandleReconnecting ? false : true}
        id="left"
        className={css.handle}
      />

      <Handle
        type="source"
        position={Position.Right}
        isConnectableEnd={isSourceHandleReconnecting ? true : false}
        id="right"
        className={css.handle}
      />
    </div>
  );
}
