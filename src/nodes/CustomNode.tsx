import { Handle, Position } from '@xyflow/react';

import css from './CustomNode.module.css';
import { useAppStore } from '../store';

export function CustomNode() {
  const isReconnectionFromSource = useAppStore((state) => state.isReconnectionFromSource);

  return (
    <div className={css.container}>
      <Handle
        type="source"
        position={Position.Left}
        isConnectableStart={false}
        isConnectableEnd={isReconnectionFromSource ? false : true}
        id="left"
        className={css.handle}
      />

      <Handle
        type="source"
        position={Position.Right}
        isConnectableEnd={isReconnectionFromSource ? true : false}
        id="right"
        className={css.handle}
      />
    </div>
  );
}
