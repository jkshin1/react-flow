// App.tsx
import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Handle,
  Position,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeProps,
  type NodeTypes,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ===== 타입 =====
type GroupData = { label: string };
type GroupNode = Node<GroupData, 'groupWithHandle'>;

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

const nodes_1: Node[] = [
  { id: 'G1', type: 'groupWithHandle', data: { label: 'Group-1' }, position: { x: 0, y: 0 } },
  { id: 'ID1', type: 'input',  data: { label: 'ID1' }, position: { x: 16, y: 16 }, parentId: 'G1', extent: 'parent' },
  { id: 'ID2', type: 'input',  data: { label: 'ID2' }, position: { x: 96, y: 16 }, parentId: 'G1', extent: 'parent' },

  { id: 'G2', type: 'groupWithHandle', data: { label: 'Group-2' }, position: { x: 280, y: 0 } },
  { id: 'ID3', type: 'input',  data: { label: 'ID3' }, position: { x: 16, y: 16 }, parentId: 'G2', extent: 'parent' },
  { id: 'ID4', type: 'input',  data: { label: 'ID4' }, position: { x: 96, y: 16 }, parentId: 'G2', extent: 'parent' },
];

const edges_1: Edge[] = [
  // Group-1 내부: ID1 OR ID2
  { id: 'e-1-2', source: 'ID1', target: 'ID2', label: 'OR' },
  // Group-2 내부: ID3 OR ID4
  { id: 'e-3-4', source: 'ID3', target: 'ID4', label: 'OR' },
  // 두 그룹 사이: AND
  { id: 'e-g1-g2', source: 'G1', sourceHandle: 'gsource', target: 'G2', label: 'AND' },
];

const nodes_2: Node[] = [
  { id: 'G3', type: 'groupWithHandle', data: { label: 'Group-3' }, position: { x: 0, y: 0 } },
  { id: 'ID5', type: 'input', data: { label: 'ID5' }, position: { x: 20, y: 20 }, parentId: 'G3', extent: 'parent' },

  { id: 'ID6', type: 'output', data: { label: 'ID6' }, position: { x: 300, y: 40 } },
];

const edges_2: Edge[] = [
  // (ID5) AND ID6  → 그룹 자체(괄호)와 AND 연결
  { id: 'e-g3-6', source: 'G3', sourceHandle: 'gsource', target: 'ID6', label: 'AND' },
];

const nodes_3: Node[] = [
  // 왼쪽 그룹: (ID12 AND ID13)
  { id: 'GA', type: 'groupWithHandle', data: { label: 'Group-A' }, position: { x: 0, y: 0 } },
  { id: 'ID12', type: 'input', data: { label: 'ID12' }, position: { x: 16, y: 16 }, parentId: 'GA', extent: 'parent' },
  { id: 'ID13', type: 'input', data: { label: 'ID13' }, position: { x: 96, y: 16 }, parentId: 'GA', extent: 'parent' },

  // 중앙 단일 노드: ID22
  { id: 'ID22', type: 'default', data: { label: 'ID22' }, position: { x: 300, y: 40 } },

  // 오른쪽 그룹: (ID24 OR ID25)
  { id: 'GB', type: 'groupWithHandle', data: { label: 'Group-B' }, position: { x: 520, y: 0 } },
  { id: 'ID24', type: 'input', data: { label: 'ID24' }, position: { x: 16, y: 16 }, parentId: 'GB', extent: 'parent' },
  { id: 'ID25', type: 'input', data: { label: 'ID25' }, position: { x: 96, y: 16 }, parentId: 'GB', extent: 'parent' },
];

const edges_3: Edge[] = [
  // (ID12 AND ID13)
  { id: 'e-12-13', source: 'ID12', target: 'ID13', label: 'AND' },

  // (ID24 OR ID25)
  { id: 'e-24-25', source: 'ID24', target: 'ID25', label: 'OR' },

  // (ID12 AND ID13) OR ID22
  { id: 'e-ga-22', source: 'GA', sourceHandle: 'gsource', target: 'ID22', label: 'OR' },

  // ... AND (ID24 OR ID25)
  { id: 'e-22-gb', source: 'ID22', target: 'GB', label: 'AND' },
];


const initialNodes: Node[] = [
  {
    id: 'group-1',
    type: 'groupWithHandle',
    data: { label: 'Group' },
    position: { x: 0, y: 0 },
  },
  {
    id: 'ID12',
    type: 'input',
    data: { label: 'ID12' },
    position: { x: 16, y: 20 },
    parentId: 'group-1',
    extent: 'parent',
  },
  {
    id: 'ID21',
    type: 'input',
    data: { label: 'ID21' },
    position: { x: 110, y: 20 },
    parentId: 'group-1',
    extent: 'parent',
  },
  {
    id: 'ID23',
    type: 'output',
    data: { label: 'ID23' },
    position: { x: 320, y: 48 }, // 그룹 밖(최상위)
  },
];

const initialEdges: Edge[] = [
  // 그룹 내부: ID12 AND ID21
  { id: 'e-12-21', source: 'ID12', target: 'ID21', label: 'AND' },
  // 그룹(부모) ↔ ID23: (...) OR ID23
  { id: 'e-group-23', source: 'group-1', sourceHandle: 'gsource', target: 'ID23', label: 'OR' },
];

// ===== 유틸: 최외곽 괄호 1쌍만 제거 =====
function stripOuterParensSmart(s: string): string {
  const t = s.trim();
  if (!(t.startsWith('(') && t.endsWith(')'))) return t;

  // 바깥 괄호가 끝까지 유효한지 검사
  let depth = 0;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (depth === 0 && i < t.length - 1) {
      // 중간에 닫히면 바깥 괄호 아님
      return t;
    }
  }

  const inner = t.slice(1, -1).trim();
  // 내부에 연산자가 없으면 (단일 그룹) 유지
  if (!/\b(AND|OR)\b/.test(inner)) return t;
  return inner;
}
// ✅ AND 우선순위 유지 + OR 결합 시 AND 항은 괄호로 감싸기
function buildExpression(allNodes: Node[], allEdges: Edge[]): string {
  const nodes = allNodes.filter((n) => !n.hidden);
  const edges = allEdges.filter((e) => !e.hidden);

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const isGroup = (n: Node) => n.type === 'groupWithHandle' || n.type === 'group';
  const getChildren = (pid: string) => nodes.filter((c) => c.parentId === pid);
  const getOp = (e: Edge): 'AND' | 'OR' | null => {
    const raw = typeof e.label === 'string' ? e.label.trim().toUpperCase() : undefined;
    return raw === 'AND' || raw === 'OR' ? raw : null;
  };

  // 그룹/일반 노드 → 문자열
  const resolveNode = (id: string): string => {
    const n = nodeMap.get(id);
    if (!n) return id;

    // 일반 노드는 id 그대로
    if (!isGroup(n)) return n.id;

    // 그룹: 내부 식을 평평하게 만들고, 마지막에 한 번만 ()로 감싼다
    const children = getChildren(n.id);
    if (children.length === 0) return '()';

    const childIds = new Set(children.map((c) => c.id));
    const internalEdges = edges.filter(
      (e) => childIds.has(e.source) && childIds.has(e.target) && getOp(e)
    );

    // 내부 엣지가 없으면 자식 나열 (중첩 그룹은 알아서 ()가 들어감)
    if (internalEdges.length === 0) {
      const inner = children.map((c) => resolveNode(c.id)).join(' ');
      return `(${inner})`;
    }

    // 내부 인접(무향)으로 DFS → (괄호 없이) a OP b OP c ... 형태로 평평하게 출력
    const adj = new Map<string, Array<{ to: string; op: 'AND' | 'OR'; id: string }>>();
    for (const e of internalEdges) {
      const op = getOp(e)!;
      if (!adj.has(e.source)) adj.set(e.source, []);
      if (!adj.has(e.target)) adj.set(e.target, []);
      adj.get(e.source)!.push({ to: e.target, op, id: e.id });
      adj.get(e.target)!.push({ to: e.source, op, id: e.id });
    }

    const visitedEdges = new Set<string>();
    const visitedNodes = new Set<string>();

    const dfs = (cur: string): string => {
      visitedNodes.add(cur);
      let expr = resolveNode(cur); // 자식이 그룹이면 그때만 ( ... )
      for (const edge of adj.get(cur) ?? []) {
        if (visitedEdges.has(edge.id)) continue;
        visitedEdges.add(edge.id);
        const right = dfs(edge.to);
        expr = `${expr} ${edge.op} ${right}`; // ❗괄호를 추가하지 않음
      }
      return expr;
    };

    const parts: string[] = [];
    for (const c of children) {
      if (!visitedNodes.has(c.id)) parts.push(dfs(c.id));
    }
    const inner = parts.join(' AND '); // 내부가 여러 컴포넌트면 AND로 결합
    return `(${inner})`; // 그룹 외형만 괄호
  };

  // 최상위( parentId 없음 ) 노드들 사이의 AND/OR를 평평하게 출력
  const topIds = nodes.filter((n) => !n.parentId).map((n) => n.id);
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
        expr = `${expr} ${edge.op} ${right}`; // ❗괄호 없이 평평하게
        if (!seenNodesTop.has(edge.to)) stack.push(edge.to);
      }
    }
    return expr;
  };

  const componentExprs: string[] = [];
  for (const n of nodes) {
    if (n.parentId) continue;                // 자식은 시작점 아님(그룹에서 표현됨)
    if (seenNodesTop.has(n.id)) continue;

    const hasAdj = (topAdj.get(n.id) ?? []).length > 0;
    if (hasAdj) {
      componentExprs.push(dfsTop(n.id));
    } else {
      componentExprs.push(resolveNode(n.id)); // 고립 최상위 노드(그룹/일반)
      seenNodesTop.add(n.id);
    }
  }

  // 컴포넌트가 여러 개면 AND로 결합
  return componentExprs.join(' AND ');
}

// ===== 스코프 판정: 자식↔외부(또는 다른 그룹) 연결 금지 =====
function areSameScope(a?: string, b?: string): boolean {
  if (!a && !b) return true;         // 둘 다 최상위
  if (a && b && a === b) return true; // 같은 parentId
  return false;
}

// ===== 메인 =====
export default function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // 자식↔외부/다른 그룹 금지
  const isConnectionAllowed = useCallback(
    (conn: Connection) => {
      const { source, target } = conn;
      if (!source || !target) return false;
      const s = nodes.find((n) => n.id === source);
      const t = nodes.find((n) => n.id === target);
      if (!s || !t) return false;
      return areSameScope(s.parentId, t.parentId);
    },
    [nodes]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!isConnectionAllowed(connection)) {
        console.warn('자식 노드는 외부/다른 그룹과 연결할 수 없습니다.', connection);
        return;
      }
      setEdges((eds) => addEdge(connection, eds));
    },
    [isConnectionAllowed]
  );

  const memoNodeTypes = useMemo(() => nodeTypes, []);

  const onConfirm = useCallback(() => {
    const visibleNodes = nodes.filter((n) => !n.hidden);
    const visibleEdges = edges.filter((e) => !e.hidden);

    const rawFormula = buildExpression(visibleNodes, visibleEdges);
    const formula = stripOuterParensSmart(rawFormula); // 최외곽 괄호 제거

    console.log({ nodes: visibleNodes, edges: visibleEdges, formula });
    alert(formula);
  }, [nodes, edges]);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={memoNodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />

      {/* 우측 하단 확인 버튼 */}
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
