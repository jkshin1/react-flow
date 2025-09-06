// App.tsx
import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Handle,
  Position,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeProps,
  type NodeTypes,
  type Connection,
  type IsValidConnection, // ✅ 추가
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ===== 타입 =====
type GroupData = { label: string };
type GroupNode = Node<GroupData, 'groupWithHandle'>;
type DatasetKey = 'initial' | 'set1' | 'set2' | 'set3';

// ===== 커스텀 그룹 노드(핸들 포함) =====
function GroupWithHandle({ data }: NodeProps<GroupNode>) {
  return (
    <div
      style={{
        width: 200,
        height: 140,
        border: '1px solid #bbb',
        background: '#f9f9f9',
        borderRadius: 8,
        boxSizing: 'border-box',
        padding: 8,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{data.label}</div>
      <Handle id="gtarget" type="target" position={Position.Left} />
      <Handle id="gsource" type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = {
  groupWithHandle: GroupWithHandle,
} satisfies NodeTypes;

// ===== 샘플 데이터셋들 =====

// set1: (ID1 OR ID2) AND (ID3 OR ID4)
const nodes_1: Node[] = [
  { id: 'G1', type: 'groupWithHandle', data: { label: 'Group-1' }, position: { x: 0, y: 0 } },
  { id: 'ID1', type: 'input', data: { label: 'ID1' }, position: { x: 16, y: 16 }, parentId: 'G1', extent: 'parent' },
  { id: 'ID2', type: 'input', data: { label: 'ID2' }, position: { x: 96, y: 16 }, parentId: 'G1', extent: 'parent' },

  { id: 'G2', type: 'groupWithHandle', data: { label: 'Group-2' }, position: { x: 280, y: 0 } },
  { id: 'ID3', type: 'input', data: { label: 'ID3' }, position: { x: 16, y: 16 }, parentId: 'G2', extent: 'parent' },
  { id: 'ID4', type: 'input', data: { label: 'ID4' }, position: { x: 96, y: 16 }, parentId: 'G2', extent: 'parent' },
];
const edges_1: Edge[] = [
  { id: 'e-1-2', source: 'ID1', target: 'ID2', label: 'OR' },
  { id: 'e-3-4', source: 'ID3', target: 'ID4', label: 'OR' },
  { id: 'e-g1-g2', source: 'G1', sourceHandle: 'gsource', target: 'G2', label: 'AND' },
];

// set2: (ID5) AND ID6
const nodes_2: Node[] = [
  { id: 'G3', type: 'groupWithHandle', data: { label: 'Group-3' }, position: { x: 0, y: 0 } },
  { id: 'ID5', type: 'input', data: { label: 'ID5' }, position: { x: 20, y: 20 }, parentId: 'G3', extent: 'parent' },
  { id: 'ID6', type: 'output', data: { label: 'ID6' }, position: { x: 300, y: 40 } },
];
const edges_2: Edge[] = [
  { id: 'e-g3-6', source: 'G3', sourceHandle: 'gsource', target: 'ID6', label: 'AND' },
];

// set3: (ID12 AND ID13) OR ID22 AND (ID24 OR ID25)
const nodes_3: Node[] = [
  { id: 'GA', type: 'groupWithHandle', data: { label: 'Group-A' }, position: { x: 0, y: 0 } },
  { id: 'ID12', type: 'input', data: { label: 'ID12' }, position: { x: 16, y: 16 }, parentId: 'GA', extent: 'parent' },
  { id: 'ID13', type: 'input', data: { label: 'ID13' }, position: { x: 96, y: 16 }, parentId: 'GA', extent: 'parent' },

  { id: 'ID22', type: 'default', data: { label: 'ID22' }, position: { x: 300, y: 40 } },

  { id: 'GB', type: 'groupWithHandle', data: { label: 'Group-B' }, position: { x: 520, y: 0 } },
  { id: 'ID24', type: 'input', data: { label: 'ID24' }, position: { x: 16, y: 16 }, parentId: 'GB', extent: 'parent' },
  { id: 'ID25', type: 'input', data: { label: 'ID25' }, position: { x: 96, y: 16 }, parentId: 'GB', extent: 'parent' },
];
const edges_3: Edge[] = [
  { id: 'e-12-13', source: 'ID12', target: 'ID13', label: 'AND' },
  { id: 'e-24-25', source: 'ID24', target: 'ID25', label: 'OR' },
  { id: 'e-ga-22', source: 'GA', sourceHandle: 'gsource', target: 'ID22', label: 'OR' },
  { id: 'e-22-gb', source: 'ID22', target: 'GB', label: 'AND' },
];

// initial: (ID12 AND ID21) OR ID23
const initialNodes: Node[] = [
  { id: 'group-1', type: 'groupWithHandle', data: { label: 'Group' }, position: { x: 0, y: 0 } },
  { id: 'ID12', type: 'input', data: { label: 'ID12' }, position: { x: 16, y: 20 }, parentId: 'group-1', extent: 'parent' },
  { id: 'ID21', type: 'input', data: { label: 'ID21' }, position: { x: 110, y: 20 }, parentId: 'group-1', extent: 'parent' },
  { id: 'ID23', type: 'output', data: { label: 'ID23' }, position: { x: 320, y: 48 } },
];
const initialEdges: Edge[] = [
  { id: 'e-12-21', source: 'ID12', target: 'ID21', label: 'AND' },
  { id: 'e-group-23', source: 'group-1', sourceHandle: 'gsource', target: 'ID23', label: 'OR' },
];

// ===== 데이터셋 스위처 =====
const datasets: Record<DatasetKey, { nodes: Node[]; edges: Edge[] }> = {
  initial: { nodes: initialNodes, edges: initialEdges },
  set1: { nodes: nodes_1, edges: edges_1 },
  set2: { nodes: nodes_2, edges: edges_2 },
  set3: { nodes: nodes_3, edges: edges_3 },
};

// ===== 유틸: 최외곽 괄호 1쌍만 제거 =====
function stripOuterParensSmart(s: string): string {
  const t = s.trim();
  if (!(t.startsWith('(') && t.endsWith(')'))) return t;
  let depth = 0;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (depth === 0 && i < t.length - 1) return t;
  }
  const inner = t.slice(1, -1).trim();
  if (!/\b(AND|OR)\b/.test(inner)) return t;
  return inner;
}

// ===== 유틸: 정렬 & OP 정규화 =====
const DEFAULT_EDGE_LABEL: 'AND' | 'OR' = 'AND';
const getOp = (e: Edge): 'AND' | 'OR' | null => {
  const raw = typeof e.label === 'string' ? e.label.trim().toUpperCase() : '';
  return raw === 'AND' || raw === 'OR' ? raw : null;
};
const opOrder = (op: 'AND' | 'OR') => (op === 'AND' ? 0 : 1);
const sortAdj = <T extends { to: string; op: 'AND' | 'OR' }>(arr: T[]) =>
  arr.sort((a, b) => opOrder(a.op) - opOrder(b.op) || a.to.localeCompare(b.to));

// ===== 유틸: 표현식 생성기 (괄호=그룹표시 전용) =====
function buildExpression(allNodes: Node[], allEdges: Edge[]): string {
  const nodes = allNodes.filter((n) => !n.hidden);
  const edges = allEdges.filter((e) => !e.hidden);

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const isGroup = (n: Node) => n.type === 'groupWithHandle' || n.type === 'group';
  const getChildren = (pid: string) =>
    nodes
      .filter((c) => c.parentId === pid)
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id));

  const resolveNode = (id: string): string => {
    const n = nodeMap.get(id);
    if (!n) return id;
    if (!isGroup(n)) return n.id;

    const children = getChildren(n.id);
    if (children.length === 0) return '()';

    const childIds = new Set(children.map((c) => c.id));
    const internalEdges = edges.filter(
      (e) => childIds.has(e.source) && childIds.has(e.target) && getOp(e)
    );

    if (internalEdges.length === 0) {
      const inner = children.map((c) => resolveNode(c.id)).join(' ');
      return `(${inner})`;
    }

    const adj = new Map<string, Array<{ to: string; op: 'AND' | 'OR'; id: string }>>();
    for (const e of internalEdges) {
      const op = getOp(e)!;
      if (!adj.has(e.source)) adj.set(e.source, []);
      if (!adj.has(e.target)) adj.set(e.target, []);
      adj.get(e.source)!.push({ to: e.target, op, id: e.id });
      adj.get(e.target)!.push({ to: e.source, op, id: e.id });
    }
    for (const [k, v] of adj) adj.set(k, sortAdj(v));

    const visitedEdges = new Set<string>();
    const visitedNodes = new Set<string>();

    const dfs = (cur: string): string => {
      visitedNodes.add(cur);
      let expr = resolveNode(cur);
      for (const edge of adj.get(cur) ?? []) {
        if (visitedEdges.has(edge.id)) continue;
        visitedEdges.add(edge.id);
        const right = dfs(edge.to);
        expr = `${expr} ${edge.op} ${right}`;
      }
      return expr;
    };

    const parts: string[] = [];
    for (const c of children) {
      if (!visitedNodes.has(c.id)) parts.push(dfs(c.id));
    }
    const inner = parts.join(' AND ');
    return `(${inner})`;
  };

  const topIds = nodes
    .filter((n) => !n.parentId)
    .map((n) => n.id)
    .sort();

  const isTop = new Set(topIds);
  const usableEdges = edges.filter((e) => getOp(e));
  const topAdj = new Map<string, Array<{ to: string; op: 'AND' | 'OR'; id: string }>>();
  for (const id of topIds) topAdj.set(id, []);
  for (const e of usableEdges) {
    if (isTop.has(e.source) && isTop.has(e.target)) {
      const op = getOp(e)!;
      topAdj.get(e.source)!.push({ to: e.target, op, id: e.id });
      topAdj.get(e.target)!.push({ to: e.source, op, id: e.id });
    }
  }
  for (const [k, v] of topAdj) topAdj.set(k, sortAdj(v));

  const seenEdgesTop = new Set<string>();
  const seenNodesTop = new Set<string>();

  const dfsTop = (start: string): string => {
    let expr = resolveNode(start);
    const stack = [start];
    while (stack.length) {
      const cur = stack.pop()!;
      seenNodesTop.add(cur);
      for (const edge of topAdj.get(cur) ?? []) {
        if (seenEdgesTop.has(edge.id)) continue;
        seenEdgesTop.add(edge.id);
        const right = resolveNode(edge.to);
        expr = `${expr} ${edge.op} ${right}`;
        if (!seenNodesTop.has(edge.to)) stack.push(edge.to);
      }
    }
    return expr;
  };

  const componentExprs: string[] = [];
  for (const n of nodes) {
    if (n.parentId) continue;
    if (seenNodesTop.has(n.id)) continue;

    const hasAdj = (topAdj.get(n.id) ?? []).length > 0;
    if (hasAdj) {
      componentExprs.push(dfsTop(n.id));
    } else {
      componentExprs.push(resolveNode(n.id));
      seenNodesTop.add(n.id);
    }
  }

  return componentExprs.join(' AND ');
}

// ===== 스코프 판정: 자식↔외부(또는 다른 그룹) 연결 금지 =====
function areSameScope(a?: string, b?: string): boolean {
  if (!a && !b) return true; // 둘 다 최상위
  if (a && b && a === b) return true; // 같은 parentId
  return false;
}

// ===== 메인 =====
export default function App() {
  const [active, setActive] = useState<DatasetKey>('initial');
  const [nodes, setNodes] = useState<Node[]>(datasets[active].nodes);
  const [edges, setEdges] = useState<Edge[]>(datasets[active].edges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // ✅ ReactFlow가 요구하는 시그니처: (connection | edge) => boolean
  const isValidConnectionCb: IsValidConnection = useCallback(
    (c) => {
      const source = (c as Connection).source ?? (c as Edge).source ?? null;
      const target = (c as Connection).target ?? (c as Edge).target ?? null;
      if (!source || !target) return false;
      if (source === target) return false;

      const s = nodes.find((n) => n.id === source);
      const t = nodes.find((n) => n.id === target);
      if (!s || !t) return false;
      return areSameScope(s.parentId, t.parentId);
    },
    [nodes]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      // 동일 로직으로 유효성 체크
      if (!isValidConnectionCb(connection)) {
        console.warn('자식 노드는 외부/다른 그룹과 연결할 수 없습니다.', connection);
        return;
      }
      setEdges((eds) => {
        const exists = eds.some(
          (e) =>
            e.source === connection.source &&
            e.target === connection.target &&
            (e.sourceHandle ?? '') === (connection.sourceHandle ?? '') &&
            (e.targetHandle ?? '') === (connection.targetHandle ?? '')
        );
        if (exists) return eds;

        const withLabel = {
          ...connection,
          label: (connection as any)?.label ?? DEFAULT_EDGE_LABEL,
        } as Edge;
        return addEdge(withLabel, eds);
      });
    },
    [isValidConnectionCb]
  );

  const memoNodeTypes = useMemo(() => nodeTypes, []);

  const onConfirm = useCallback(() => {
    const visibleNodes = nodes.filter((n) => !n.hidden);
    const visibleEdges = edges.filter((e) => !e.hidden);
    const rawFormula = buildExpression(visibleNodes, visibleEdges);
    const formula = stripOuterParensSmart(rawFormula);
    console.log({ nodes: visibleNodes, edges: visibleEdges, formula });
    alert(formula);
  }, [nodes, edges]);

  const switchDataset = useCallback((k: DatasetKey) => {
    setActive(k);
    // 간단한 샬로우 클론(리액트 상태 추적 안정성)
    setNodes(datasets[k].nodes.map((n) => ({ ...n })));
    setEdges(datasets[k].edges.map((e) => ({ ...e })));
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={memoNodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnectionCb} // ✅ 타입 일치
        fitView
      >
        <Background />
        <MiniMap pannable zoomable />
        <Controls />
      </ReactFlow>

      {/* 하단 좌측: 데이터셋 스위처 */}
      <div style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 1000, display: 'flex', gap: 8 }}>
        <select
          value={active}
          onChange={(e) => switchDataset(e.target.value as DatasetKey)}
          style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ccc', background: '#fff' }}
        >
          <option value="initial">initial — (ID12 AND ID21) OR ID23</option>
          <option value="set1">(ID1 OR ID2) AND (ID3 OR ID4)</option>
          <option value="set2">(ID5) AND ID6</option>
          <option value="set3">(ID12 AND ID13) OR ID22 AND (ID24 OR ID25)</option>
        </select>
      </div>

      {/* 하단 우측: 확인 버튼 */}
      <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1000 }}>
        <button
          onClick={onConfirm}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
}
