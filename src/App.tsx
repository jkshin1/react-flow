import { useState, useCallback } from 'react';
// ReactFlow를 default import에서 named import로 변경합니다.
import {
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// 초기 노드 설정
const initialNodes: Node[] = [
  {
    id: 'group-1',
    type: 'group', // 노드 타입을 'group'으로 지정
    data: { label: 'Group Node' },
    position: { x: 0, y: 0 },
    style: {
      width: 170,
      height: 140,
    },
  },
  {
    id: '1-A',
    type: 'input',
    data: { label: 'Child Node' },
    position: { x: 10, y: 10 },
    parentId: 'group-1', // 부모 노드를 'group-1'로 지정
    extent: 'parent', // 노드가 부모 노드 경계 안에서만 움직이도록 설정
  },
  {
    id: '2',
    type: 'output',
    data: { label: 'Regular Node' },
    position: { x: 250, y: 50 },
  },
];

// 초기 엣지 설정
const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'group-1', target: '2', label: 'edge' }, // 그룹 노드와 일반 노드를 연결
];

function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      />
    </div>
  );
}

export default App;