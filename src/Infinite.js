// Updated with enhanced styling and fixed duplication
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position
} from "reactflow";
import "reactflow/dist/style.css";

const Card = ({ children, className }) => (
  <div className={`border rounded shadow ${className || ''}`}>{children}</div>
);

const CardContent = ({ children, className }) => (
  <div className={`p-2 ${className || ''}`}>{children}</div>
);

const Button = ({ children, onClick, size = 'md' }) => (
  <button
    className={`border rounded px-2 py-1 bg-blue-500 text-white text-sm ${size === 'lg' ? 'text-lg' : ''}`}
    onClick={onClick}
  >
    {children}
  </button>
);

const Input = ({ value, onChange, ...props }) => (
  <input
    className="border p-1 text-xs w-full"
    value={value}
    onChange={onChange}
    {...props}
  />
);

const Textarea = ({ value, onChange, ...props }) => (
  <textarea
    className="border p-1 text-xs w-full"
    value={value}
    onChange={onChange}
    {...props}
  />
);


const SelectBox = ({ selected, onToggle }) => (
  <div
    className="absolute top-1 left-1 border border-black bg-white w-4 h-4 flex items-center justify-center cursor-pointer"
    onClick={onToggle}
  >
    {selected && <span className="text-blue-600">✓</span>}
  </div>
);

const OptionsButton = ({ onDelete, onDuplicate }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute top-1 right-1 cursor-pointer">
      <div
        className="text-xs bg-gray-200 rounded px-1"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      >
        ☰
        {open && (
          <div className="absolute mt-1 bg-white shadow-md border rounded z-10">
            <div onClick={onDelete} className="px-2 py-1 hover:bg-red-100 cursor-pointer">Delete</div>
            <div onClick={onDuplicate} className="px-2 py-1 hover:bg-blue-100 cursor-pointer">Duplicate</div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProConInput = ({ label, items, setItems }) => {
  const [text, setText] = useState("");
  const postItem = () => {
    if (text.trim()) {
      setItems([...items, text]);
      setText("");
    }
  };
  return (
    <div>
      <div className="text-xs font-semibold">{label}</div>
      <div className="flex gap-1">
        <Input
          className="text-xs"
          placeholder={`Add ${label.toLowerCase()}...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button size="sm" onClick={postItem}>Post</Button>
      </div>
      <ul className="list-disc list-inside text-xs mt-1">
        {items.map((item, idx) => <li key={idx}>{item}</li>)}
      </ul>
    </div>
  );
};

const nodeStyles = {
  reason: {
    bg: "bg-yellow-100",
    border: "border-yellow-400 border-2",
  },
  option: {
    bg: "bg-blue-100",
    border: "border-blue-400 border-2",
  },
  outcome: {
    bg: "bg-green-100",
    border: "border-green-400 border-2",
  },
  event: {
    bg: "bg-gray-200",
    border: "border-gray-500 border-2",
  },
  boxzero: {
    bg: "bg-purple-100",
    border: "border-purple-400 border-2",
  },
};

const NodeWrapper = ({ children, data, title, type }) => (
  <Card className={`relative w-72 ${nodeStyles[type].border} ${nodeStyles[type].bg}`}>
    <CardContent className="p-3 space-y-2">
      <SelectBox selected={data.selected} onToggle={data.onToggle} />
      <OptionsButton onDelete={data.onDelete} onDuplicate={data.onDuplicate} />
      <div className="text-sm font-bold mb-2">{title}</div>
      {children}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </CardContent>
  </Card>
);

const nodeTypes = {
  reason: ({ data }) => <NodeWrapper data={data} title="Reason" type="reason"><Textarea value={data.label} onChange={(e) => data.onChange(e.target.value)} /></NodeWrapper>,
  option: ({ data }) => <NodeWrapper data={data} title="Option" type="option">
    <Input value={data.label} onChange={(e) => data.onChange(e.target.value)} />
    <ProConInput label="Pros" items={data.pros} setItems={data.setPros} />
    <ProConInput label="Cons" items={data.cons} setItems={data.setCons} />
  </NodeWrapper>,
  outcome: ({ data }) => <NodeWrapper data={data} title="Outcome" type="outcome">
    <Input value={data.label} onChange={(e) => data.onChange(e.target.value)} />
    <Input placeholder="Probability (%)" type="number" value={data.probability} onChange={(e) => data.onProbabilityChange(e.target.value)} />
    <ProConInput label="Pros" items={data.pros} setItems={data.setPros} />
    <ProConInput label="Cons" items={data.cons} setItems={data.setCons} />
  </NodeWrapper>,
  event: ({ data }) => <NodeWrapper data={data} title="Event" type="event"><Textarea value={data.label} onChange={(e) => data.onChange(e.target.value)} /></NodeWrapper>,
  boxzero: ({ data }) => <NodeWrapper data={data} title="Decision Topic" type="boxzero"><Textarea value={data.label} onChange={(e) => data.onChange(e.target.value)} /></NodeWrapper>
};


const Infinite = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [connectionType, setConnectionType] = useState("solid");
  const [background, setBackground] = useState("crocodile");
  const [gridVisible, setGridVisible] = useState(true);
  const [showWorkspace, setShowWorkspace] = useState(false);

  const backgroundColors = {
    crocodile: "#3a5f3a",
    white: "#ffffff",
    gray: "#888888",
    black: "#000000"
  };

  const gridColor = background === "white" ? "#888" : "#fff";

  const addNode = (type, copiedData = null) => {
    const id = uuidv4();
    const newNode = {
      id,
      type,
      position: { x: 500, y: 300 },
      data: {
        label: copiedData?.label || "",
        probability: copiedData?.probability || "",
        pros: copiedData?.pros ? [...copiedData.pros] : [],
        cons: copiedData?.cons ? [...copiedData.cons] : [],
        selected: false,
        onChange: (val) => updateNodeData(id, { label: val }),
        onProbabilityChange: (val) => updateNodeData(id, { probability: val }),
        setPros: (items) => updateNodeData(id, { pros: items }),
        setCons: (items) => updateNodeData(id, { cons: items }),
        onToggle: () => toggleSelect(id),
        onDelete: () => deleteNode(id),
        onDuplicate: () => duplicateNode(id),
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const updateNodeData = (id, updates) => {
    setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data: { ...node.data, ...updates } } : node));
  };

  const deleteNode = (id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  };

  const duplicateNode = (id) => {
    const original = nodes.find((n) => n.id === id);
    if (!original) return;
    
    const newId = uuidv4();
    const newNode = {
      ...original,
      id: newId,
      position: { 
        x: original.position.x + 50,
        y: original.position.y + 50 
      },
      data: {
        ...original.data,
        selected: false,
        onChange: (val) => updateNodeData(newId, { label: val }),
        onProbabilityChange: (val) => updateNodeData(newId, { probability: val }),
        setPros: (items) => updateNodeData(newId, { pros: items }),
        setCons: (items) => updateNodeData(newId, { cons: items }),
        onToggle: () => toggleSelect(newId),
        onDelete: () => deleteNode(newId),
        onDuplicate: () => duplicateNode(newId),
      }
    };
    
    setNodes((nds) => [...nds, newNode]);

    // Duplicate connected edges
    const originalEdges = edges.filter(e => e.source === id || e.target === id);
    const newEdges = originalEdges.map(edge => ({
      ...edge,
      id: uuidv4(),
      source: edge.source === id ? newId : edge.source,
      target: edge.target === id ? newId : edge.target
    }));
    
    setEdges(eds => [...eds, ...newEdges]);
  };    
  const toggleSelect = (id) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, selected: !n.data.selected } } : n));
  };

  const onConnect = (params) => {
    setEdges((eds) => addEdge({ ...params, style: connectionType === "dashed" ? { strokeDasharray: "5,5" } : {} }, eds));
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {!showWorkspace ? (
        <div className="flex items-center justify-center h-full">
          <Button size="lg" onClick={() => { setShowWorkspace(true); addNode("boxzero"); }}>
            New +
          </Button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 p-2 bg-gray-100 shadow items-center">
            <Button onClick={() => addNode("reason")}>Add Reason</Button>
            <Button onClick={() => addNode("option")}>Add Option</Button>
            <Button onClick={() => addNode("outcome")}>Add Outcome</Button>
            <Button onClick={() => addNode("event")}>Add Event</Button>
            <select onChange={(e) => setConnectionType(e.target.value)} className="text-xs border p-1">
              <option value="solid">Solid Connection</option>
              <option value="dashed">Dashed (Probability Influence)</option>
            </select>
            <select onChange={(e) => setBackground(e.target.value)} className="text-xs border p-1">
              <option value="crocodile">Crocodile Green</option>
              <option value="white">White</option>
              <option value="gray">Gray</option>
              <option value="black">Black</option>
            </select>
            <label className="text-xs flex items-center gap-1">
              <input type="checkbox" checked={gridVisible} onChange={() => setGridVisible(!gridVisible)} /> Grid
            </label>
          </div>
          <div className="flex-1" style={{ backgroundColor: backgroundColors[background], height: 'calc(100vh - 40px)', width: '100%' }}>
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
              >
                {gridVisible && <Background color={gridColor} variant={BackgroundVariant.Lines} gap={20} />}
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        </>
      )}
    </div>
  );
};

export default Infinite;
