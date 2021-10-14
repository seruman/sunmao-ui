import { useCallback, useMemo, useState } from 'react';
import { GridCallbacks } from '@meta-ui/runtime';
import { Box, Button } from '@chakra-ui/react';
import { css } from '@emotion/react';
import { App } from '../metaUI';
import { StructureTree } from './StructureTree';
import {
  CreateComponentOperation,
  ModifyComponentPropertyOperation,
} from '../operations/Operations';
import { eventBus } from '../eventBus';
import { ComponentForm } from './ComponentForm';
import { ComponentList } from './ComponentsList';
import { useAppModel } from '../operations/useAppModel';

let count = 0;
export const Editor = () => {
  const [selectedComponentId, setSelectedComponentId] = useState('');
  const { app } = useAppModel();

  const Wrapper: React.FC<{ id: string }> = useMemo(() => {
    return props => {
      const style = css`
        height: 100%;
        box-shadow: 0 0 ${props.id === selectedComponentId ? 1 : 0}px red;
      `;
      const onClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setSelectedComponentId(() => props.id);
      };
      return (
        <div onClick={onClick} css={style}>
          {props.children}
        </div>
      );
    };
  }, [selectedComponentId]);

  const onClickUndo = useCallback(() => {
    eventBus.send('undo');
  }, []);

  const gridCallbacks: GridCallbacks = {
    onDragStop(id, layout) {
      console.log('dragstop');
      eventBus.send(
        'operation',
        new ModifyComponentPropertyOperation(id, 'layout', layout)
      );
    },
    onDrop(id, layout, item, e) {
      const component = e.dataTransfer?.getData('component') || '';
      const componentId = `component${count++}`;
      eventBus.send(
        'operation',
        new CreateComponentOperation(id, 'container', component, componentId)
      );

      const newLayout = [
        ...layout,
        {
          ...item,
          w: 3,
          i: componentId,
        },
      ];

      eventBus.send(
        'operation',
        new ModifyComponentPropertyOperation(id, 'layout', newLayout)
      );
    },
  };

  return (
    <Box display="flex" height="100vh" width="100vw">
      <Box flex="1">
        <StructureTree app={app} onSelectComponent={id => setSelectedComponentId(id)} />
        <Button onClick={onClickUndo}>撤销</Button>
      </Box>
      <Box flex="1">
        <strong>Drag Component to canvas!</strong>
        <ComponentList />
      </Box>
      <Box flex="3" borderRight="2px solid black">
        <App
          options={app}
          debugEvent={false}
          debugStore={false}
          gridCallbacks={gridCallbacks}
          componentWrapper={Wrapper}
        />
      </Box>
      <Box flex="1" borderRight="2px solid black">
        <ComponentForm app={app} selectedId={selectedComponentId} />
      </Box>
    </Box>
  );
};
