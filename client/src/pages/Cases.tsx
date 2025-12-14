import { useState, useMemo, useCallback, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Settings, 
  User, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calculator,
  Plus,
  Minus,
  Trash2,
  Edit3,
  ChevronDown,
  Crown,
  Star,
  Network,
  Expand,
  Shrink,
  RotateCcw,
  X
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface EditableNode {
  id: string;
  label: string;
  rwa: number;
  level: number;
  parentId: string | null;
  childIds: string[];
}

interface TreeState {
  nodes: Record<string, EditableNode>;
  rootId: string;
  nextId: number;
}

type TreeAction =
  | { type: 'ADD_CHILD'; parentId: string; rwa?: number }
  | { type: 'REMOVE_NODE'; nodeId: string }
  | { type: 'UPDATE_RWA'; nodeId: string; rwa: number }
  | { type: 'RESET'; preset: TreeState };

function generateLabel(level: number, index: number): string {
  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  return `${labels[Math.min(level, labels.length - 1)]}${level > 0 ? index : ''}`;
}

function createInitialTree(tier: string): TreeState {
  const presets: Record<string, { structure: number[][]; rwas: number[] }> = {
    vip: {
      structure: [[1], [2], [5, 5]],
      rwas: [500, 500, 500],
    },
    star1: {
      structure: [[1], [2], [1, 1], [2, 2, 2, 2]],
      rwas: [500, 500, 500, 4500],
    },
    star2: {
      structure: [[1], [2], [2, 2], [2, 2, 2, 2]],
      rwas: [1000, 1000, 1500, 6500],
    },
    star3: {
      structure: [[1], [2], [2, 2], [2, 2, 2, 2]],
      rwas: [2000, 2000, 1000, 24000],
    },
  };

  const preset = presets[tier] || presets.vip;
  const nodes: Record<string, EditableNode> = {};
  let nextId = 1;

  const rootId = 'node-0';
  nodes[rootId] = {
    id: rootId,
    label: 'A',
    rwa: preset.rwas[0],
    level: 0,
    parentId: null,
    childIds: [],
  };

  let currentLevelIds = [rootId];
  
  for (let level = 1; level < preset.structure.length; level++) {
    const childCounts = preset.structure[level];
    const nextLevelIds: string[] = [];
    let childIndex = 0;
    let labelCounter = 1;

    for (let i = 0; i < currentLevelIds.length; i++) {
      const parentId = currentLevelIds[i];
      const numChildren = childCounts[childIndex] || 0;
      
      for (let j = 0; j < numChildren; j++) {
        const nodeId = `node-${nextId++}`;
        nodes[nodeId] = {
          id: nodeId,
          label: generateLabel(level, labelCounter++),
          rwa: preset.rwas[Math.min(level, preset.rwas.length - 1)],
          level,
          parentId,
          childIds: [],
        };
        nodes[parentId].childIds.push(nodeId);
        nextLevelIds.push(nodeId);
      }
      childIndex++;
    }
    currentLevelIds = nextLevelIds;
  }

  return { nodes, rootId, nextId };
}

function treeReducer(state: TreeState, action: TreeAction): TreeState {
  switch (action.type) {
    case 'ADD_CHILD': {
      const parent = state.nodes[action.parentId];
      if (!parent) return state;
      
      const newId = `node-${state.nextId}`;
      const siblingCount = parent.childIds.length;
      const newLevel = parent.level + 1;
      
      const existingAtLevel = Object.values(state.nodes).filter(n => n.level === newLevel);
      const labelIndex = existingAtLevel.length + 1;
      
      const newNode: EditableNode = {
        id: newId,
        label: generateLabel(newLevel, labelIndex),
        rwa: action.rwa || 500,
        level: newLevel,
        parentId: action.parentId,
        childIds: [],
      };

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [newId]: newNode,
          [action.parentId]: {
            ...parent,
            childIds: [...parent.childIds, newId],
          },
        },
        nextId: state.nextId + 1,
      };
    }

    case 'REMOVE_NODE': {
      if (action.nodeId === state.rootId) return state;
      
      const nodeToRemove = state.nodes[action.nodeId];
      if (!nodeToRemove) return state;

      const getAllDescendants = (nodeId: string): string[] => {
        const node = state.nodes[nodeId];
        if (!node) return [];
        return [nodeId, ...node.childIds.flatMap(getAllDescendants)];
      };

      const idsToRemove = new Set(getAllDescendants(action.nodeId));
      const newNodes = { ...state.nodes };
      
      idsToRemove.forEach(id => delete newNodes[id]);
      
      if (nodeToRemove.parentId && newNodes[nodeToRemove.parentId]) {
        newNodes[nodeToRemove.parentId] = {
          ...newNodes[nodeToRemove.parentId],
          childIds: newNodes[nodeToRemove.parentId].childIds.filter(id => id !== action.nodeId),
        };
      }

      return { ...state, nodes: newNodes };
    }

    case 'UPDATE_RWA': {
      const node = state.nodes[action.nodeId];
      if (!node) return state;
      
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.nodeId]: { ...node, rwa: Math.max(100, action.rwa) },
        },
      };
    }

    case 'RESET':
      return action.preset;

    default:
      return state;
  }
}

const levelStyles: Record<number, { bg: string; border: string; icon: string; gradient: string }> = {
  0: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', icon: 'text-amber-500', gradient: 'from-amber-500/30 to-orange-500/40' },
  1: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', icon: 'text-cyan-500', gradient: 'from-cyan-500/25 to-teal-500/35' },
  2: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', icon: 'text-blue-500', gradient: 'from-blue-500/20 to-indigo-500/30' },
  3: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', icon: 'text-purple-500', gradient: 'from-purple-500/20 to-violet-500/30' },
  4: { bg: 'bg-rose-500/20', border: 'border-rose-500/50', icon: 'text-rose-500', gradient: 'from-rose-500/20 to-pink-500/30' },
};

function getIcon(level: number) {
  if (level === 0) return Crown;
  if (level === 1) return User;
  if (level === 2) return Users;
  return Star;
}

interface InteractiveNodeProps {
  node: EditableNode;
  nodes: Record<string, EditableNode>;
  onAddChild: (nodeId: string) => void;
  onRemove: (nodeId: string) => void;
  onEdit: (nodeId: string) => void;
  isMobile: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  maxLevel?: number;
}

const lineColors: Record<number, string> = {
  0: 'bg-amber-400 dark:bg-amber-500',
  1: 'bg-cyan-400 dark:bg-cyan-500',
  2: 'bg-blue-400 dark:bg-blue-500',
  3: 'bg-purple-400 dark:bg-purple-500',
  4: 'bg-rose-400 dark:bg-rose-500',
};

function InteractiveNode({ 
  node, 
  nodes, 
  onAddChild, 
  onRemove, 
  onEdit, 
  isMobile,
  isExpanded,
  onToggle,
  maxLevel = 4
}: InteractiveNodeProps) {
  const formatRwa = (value: number) => new Intl.NumberFormat('en-US').format(value);
  const style = levelStyles[Math.min(node.level, 4)];
  const lineColor = lineColors[Math.min(node.level, 4)];
  const childLineColor = lineColors[Math.min(node.level + 1, 4)];
  const IconComponent = getIcon(node.level);
  const hasChildren = node.childIds.length > 0;
  const canAddChildren = node.level < maxLevel;
  
  const sizeClasses = isMobile ? 'px-3 py-2 min-w-[70px]' : 'px-4 py-3 min-w-[100px]';
  const iconSize = isMobile ? 'w-4 h-4' : 'w-5 h-5';
  const textSize = isMobile ? 'text-xs' : 'text-sm';
  const lineHeight = isMobile ? 20 : 28;
  const nodeGap = isMobile ? 8 : 16;

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={`relative ${sizeClasses} rounded-xl bg-gradient-to-br ${style.gradient} border-2 ${style.border} shadow-lg text-center cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105`}
          onClick={() => onEdit(node.id)}
          data-testid={`node-${node.id}`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <IconComponent className={`${iconSize} ${style.icon}`} />
            <span className={`${textSize} font-bold`}>{node.label}</span>
            {hasChildren && (
              <button 
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="ml-1 p-0.5 rounded hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
              >
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className={`${iconSize} opacity-70`} />
                </motion.div>
              </button>
            )}
          </div>
          <span className={`font-mono ${textSize} font-semibold opacity-80`}>${formatRwa(node.rwa)}</span>
          
          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${style.bg} border ${style.border} flex items-center justify-center`}>
            <span className="text-[9px] font-bold opacity-70">L{node.level}</span>
          </div>
        </motion.div>

        <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
          {canAddChildren && (
            <Button
              size="icon"
              variant="default"
              className="h-6 w-6 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-md"
              onClick={(e) => { e.stopPropagation(); onAddChild(node.id); }}
              data-testid={`btn-add-child-${node.id}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          )}
          {node.level > 0 && (
            <Button
              size="icon"
              variant="destructive"
              className="h-6 w-6 rounded-full shadow-md"
              onClick={(e) => { e.stopPropagation(); onRemove(node.id); }}
              data-testid={`btn-remove-${node.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center"
          >
            <div 
              className={`w-0.5 ${childLineColor} rounded-full`}
              style={{ height: lineHeight }}
            />
            
            <div className="relative flex justify-center" style={{ gap: nodeGap }}>
              {node.childIds.length > 1 && (
                <div 
                  className={`absolute top-0 h-0.5 ${childLineColor} rounded-full`}
                  style={{ 
                    left: `calc(50% / ${node.childIds.length})`,
                    right: `calc(50% / ${node.childIds.length})`,
                  }}
                />
              )}
              
              {node.childIds.map((childId, idx) => (
                <div key={childId} className="flex flex-col items-center">
                  <div 
                    className={`w-0.5 ${childLineColor} rounded-full`}
                    style={{ height: lineHeight }}
                  />
                  <ExpandableInteractiveNode
                    node={nodes[childId]}
                    nodes={nodes}
                    onAddChild={onAddChild}
                    onRemove={onRemove}
                    onEdit={onEdit}
                    isMobile={isMobile}
                    maxLevel={maxLevel}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExpandableInteractiveNode(props: Omit<InteractiveNodeProps, 'isExpanded' | 'onToggle'>) {
  const [isExpanded, setIsExpanded] = useState(props.node.level < 3);
  return (
    <InteractiveNode 
      {...props} 
      isExpanded={isExpanded} 
      onToggle={() => setIsExpanded(!isExpanded)} 
    />
  );
}

interface NodeEditorProps {
  node: EditableNode | null;
  open: boolean;
  onClose: () => void;
  onUpdateRwa: (nodeId: string, rwa: number) => void;
  onRemove: (nodeId: string) => void;
  t: any;
}

function NodeEditor({ node, open, onClose, onUpdateRwa, onRemove, t }: NodeEditorProps) {
  const [inputValue, setInputValue] = useState('');
  
  const handleOpen = useCallback(() => {
    if (node) setInputValue(node.rwa.toString());
  }, [node]);

  const formatUsd = (value: number) => new Intl.NumberFormat('en-US').format(value);
  
  if (!node) return null;

  const style = levelStyles[Math.min(node.level, 4)];
  const IconComponent = getIcon(node.level);

  const handleChange = (delta: number) => {
    const newValue = Math.max(100, node.rwa + delta);
    onUpdateRwa(node.id, newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 100) {
      onUpdateRwa(node.id, num);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); else handleOpen(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${style.bg} ${style.border} border`}>
              <IconComponent className={`w-5 h-5 ${style.icon}`} />
            </div>
            {t.editNode || '编辑节点'} {node.label}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium mb-2 block">{t.investmentAmount || '业绩金额'} (USD)</label>
            <div className="flex items-center gap-2">
              <Button 
                size="icon" 
                variant="outline"
                onClick={() => handleChange(-100)}
                data-testid="btn-usd-minus"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="text-center font-mono text-lg"
                min={100}
                step={100}
                data-testid="input-node-usd"
              />
              <Button 
                size="icon" 
                variant="outline"
                onClick={() => handleChange(100)}
                data-testid="btn-usd-plus"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              ${formatUsd(node.rwa)} USD
            </p>
          </div>

          <div className="flex gap-2">
            {node.level > 0 && (
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={() => { onRemove(node.id); onClose(); }}
                data-testid="btn-delete-node"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t.delete || '删除'}
              </Button>
            )}
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
              data-testid="btn-close-editor"
            >
              {t.done || '完成'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Cases() {
  const { t } = useLanguage();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [activeTab, setActiveTab] = useState('vip');
  const [mobileView, setMobileView] = useState<'tree' | 'results' | 'settings'>('tree');
  const [dailyRate, setDailyRate] = useState(1.25);
  const [streamingRate, setStreamingRate] = useState(0.3);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [showFormulas, setShowFormulas] = useState(false);
  
  const [trees, setTrees] = useState<Record<string, TreeState>>(() => ({
    vip: createInitialTree('vip'),
    star1: createInitialTree('star1'),
    star2: createInitialTree('star2'),
    star3: createInitialTree('star3'),
  }));

  const currentTree = trees[activeTab];

  const dispatch = useCallback((action: TreeAction) => {
    setTrees(prev => ({
      ...prev,
      [activeTab]: treeReducer(prev[activeTab], action),
    }));
  }, [activeTab]);

  const tierConfig: Record<string, { teamDividendPercent: number; minPerformance: number; streamingManagementPercent: number }> = {
    vip: { teamDividendPercent: 10, minPerformance: 6000, streamingManagementPercent: 0 },
    star1: { teamDividendPercent: 20, minPerformance: 20000, streamingManagementPercent: 5 },
    star2: { teamDividendPercent: 30, minPerformance: 60000, streamingManagementPercent: 10 },
    star3: { teamDividendPercent: 40, minPerformance: 200000, streamingManagementPercent: 15 },
  };

  const calculations = useMemo(() => {
    const nodes = Object.values(currentTree.nodes);
    const config = tierConfig[activeTab];
    
    const nodesByLevel: Record<number, EditableNode[]> = {};
    nodes.forEach(node => {
      if (!nodesByLevel[node.level]) nodesByLevel[node.level] = [];
      nodesByLevel[node.level].push(node);
    });

    const selfTotal = nodesByLevel[0]?.reduce((sum, n) => sum + n.rwa, 0) || 0;
    const directTotal = nodesByLevel[1]?.reduce((sum, n) => sum + n.rwa, 0) || 0;
    const indirectTotal = nodesByLevel[2]?.reduce((sum, n) => sum + n.rwa, 0) || 0;
    const level3Total = nodesByLevel[3]?.reduce((sum, n) => sum + n.rwa, 0) || 0;
    const level4Total = nodesByLevel[4]?.reduce((sum, n) => sum + n.rwa, 0) || 0;
    
    const totalInvestment = selfTotal + directTotal + indirectTotal + level3Total + level4Total;
    const teamPerformance = totalInvestment - selfTotal;

    const customRwaDividend = totalInvestment * (dailyRate / 100);
    const streamingReward = totalInvestment * (streamingRate / 100);
    
    const directRefRewardA = directTotal * (dailyRate / 100) * 0.20;
    const directRefRewardB = indirectTotal * (dailyRate / 100) * 0.20;
    const directRefRewardC = level3Total * (dailyRate / 100) * 0.20;
    const directRefReward = directRefRewardA + directRefRewardB + directRefRewardC;
    
    const indirectRefRewardA = indirectTotal * (dailyRate / 100) * 0.10;
    const indirectRefRewardB = level3Total * (dailyRate / 100) * 0.10;
    const indirectRefReward = indirectRefRewardA + indirectRefRewardB;
    
    const teamReward = teamPerformance * (dailyRate / 100) * (config.teamDividendPercent / 100);
    const streamingManagementReward = teamPerformance * 0.003 * (config.streamingManagementPercent / 100);
    
    const totalDailyIncome = customRwaDividend + streamingReward + directRefReward + indirectRefReward + teamReward + streamingManagementReward;
    const dailyRatio = totalInvestment > 0 ? (totalDailyIncome / totalInvestment) * 100 : 0;
    const monthlyIncome = totalDailyIncome * 30;
    const total180DayProfit = totalDailyIncome * 180;
    const paybackDays = totalDailyIncome > 0 ? Math.ceil(totalInvestment / totalDailyIncome) : 0;
    
    const nodeCount = {
      level0: nodesByLevel[0]?.length || 0,
      level1: nodesByLevel[1]?.length || 0,
      level2: nodesByLevel[2]?.length || 0,
      level3: nodesByLevel[3]?.length || 0,
      level4: nodesByLevel[4]?.length || 0,
    };

    return {
      selfTotal, directTotal, indirectTotal, level3Total, level4Total,
      totalInvestment, teamPerformance,
      customRwaDividend, streamingReward,
      directRefRewardA, directRefRewardB, directRefRewardC, directRefReward,
      indirectRefRewardA, indirectRefRewardB, indirectRefReward,
      teamReward, streamingManagementReward,
      totalDailyIncome, dailyRatio, monthlyIncome, total180DayProfit, paybackDays,
      nodeCount, minPerformance: config.minPerformance,
      meetsMinimum: teamPerformance >= config.minPerformance,
    };
  }, [currentTree, activeTab, dailyRate, streamingRate]);

  const formatUsd = (value: number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value);
  
  const formatRwa = (value: number) => new Intl.NumberFormat('en-US').format(value);

  const handleAddChild = (parentId: string) => {
    dispatch({ type: 'ADD_CHILD', parentId, rwa: 500 });
  };

  const handleRemoveNode = (nodeId: string) => {
    dispatch({ type: 'REMOVE_NODE', nodeId });
    if (editingNodeId === nodeId) setEditingNodeId(null);
  };

  const handleUpdateRwa = (nodeId: string, rwa: number) => {
    dispatch({ type: 'UPDATE_RWA', nodeId, rwa });
  };

  const handleReset = () => {
    setTrees(prev => ({
      ...prev,
      [activeTab]: createInitialTree(activeTab),
    }));
  };

  const editingNode = editingNodeId ? currentTree.nodes[editingNodeId] : null;

  const TierTabs = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 w-full h-auto p-1">
        <TabsTrigger value="vip" className="text-xs py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white" data-testid="tab-vip">VIP</TabsTrigger>
        <TabsTrigger value="star1" className="text-xs py-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white" data-testid="tab-star1">1★</TabsTrigger>
        <TabsTrigger value="star2" className="text-xs py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white" data-testid="tab-star2">2★</TabsTrigger>
        <TabsTrigger value="star3" className="text-xs py-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white" data-testid="tab-star3">3★</TabsTrigger>
      </TabsList>
    </Tabs>
  );

  const TreePanel = (
    <Card className="p-3 card-luxury h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Network className="w-4 h-4 text-primary" />
          {t.orgStructure || '组织架构'}
        </h3>
        <Button size="sm" variant="outline" onClick={handleReset} className="h-7 text-xs gap-1" data-testid="btn-reset-tree">
          <RotateCcw className="w-3 h-3" />
          {t.reset || '重置'}
        </Button>
      </div>
      
      <div className="overflow-auto pb-4" style={{ maxHeight: isMobile ? '300px' : '400px' }}>
        <div className="flex justify-center min-w-fit py-4">
          <ExpandableInteractiveNode
            node={currentTree.nodes[currentTree.rootId]}
            nodes={currentTree.nodes}
            onAddChild={handleAddChild}
            onRemove={handleRemoveNode}
            onEdit={setEditingNodeId}
            isMobile={isMobile}
          />
        </div>
      </div>

      <div className="border-t border-border/40 pt-3 mt-2">
        <div className="flex flex-wrap justify-center gap-2 text-[9px]">
          {[
            { level: 0, label: 'A', name: t.selfLabel || '自己', color: 'amber' },
            { level: 1, label: 'B', name: t.directLabel || '直推', color: 'cyan' },
            { level: 2, label: 'C', name: t.indirectLabel || '间推', color: 'blue' },
            { level: 3, label: 'D', name: t.level3Label || '三代', color: 'purple' },
            { level: 4, label: 'E', name: t.level4Label || '四代', color: 'rose' },
          ].filter(l => calculations.nodeCount[`level${l.level}` as keyof typeof calculations.nodeCount] > 0).map(l => {
            const Icon = getIcon(l.level);
            return (
              <div key={l.level} className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-${l.color}-500/15 border border-${l.color}-500/30`}>
                <Icon className={`w-2.5 h-2.5 text-${l.color}-600`} />
                <span>{l.label}: {l.name}</span>
              </div>
            );
          })}
        </div>
        <p className="text-center text-[9px] text-muted-foreground mt-2">
          {(t as any).clickToEdit || '点击节点编辑 · 悬停显示添加/删除按钮'}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{t.totalInvestment || '总投资'}</span>
          <span className="font-mono font-semibold">${formatRwa(calculations.totalInvestment)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{t.teamPerformance || '团队业绩'}</span>
          <span className={`font-mono font-semibold ${calculations.meetsMinimum ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            ${formatRwa(calculations.teamPerformance)}
            {!calculations.meetsMinimum && ` (需 $${formatRwa(calculations.minPerformance)}+)`}
          </span>
        </div>
      </div>
    </Card>
  );

  const ResultsPanel = (
    <Card className="p-3 card-luxury h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-500" />
          {t.incomeBreakdown || '收益明细'}
        </h3>
        <Button 
          size="sm" 
          variant={showFormulas ? "default" : "outline"} 
          onClick={() => setShowFormulas(!showFormulas)} 
          className="h-6 text-[10px] gap-1"
          data-testid="btn-toggle-formulas"
        >
          {showFormulas ? '隐藏公式' : '显示公式'}
        </Button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
          <div className="flex justify-between items-center">
            <span>{t.customRwaDividend || 'RWA分红'}</span>
            <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">{formatUsd(calculations.customRwaDividend)}</span>
          </div>
          {showFormulas && (
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">
              = 总业绩 ${formatRwa(calculations.totalInvestment)} × {dailyRate}% = {formatUsd(calculations.customRwaDividend)}
            </p>
          )}
        </div>
        
        <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30">
          <div className="flex justify-between items-center">
            <span>{t.streamingReward || '推流奖励'}</span>
            <span className="font-mono font-semibold text-violet-600 dark:text-violet-400">{formatUsd(calculations.streamingReward)}</span>
          </div>
          {showFormulas && (
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">
              = 总业绩 ${formatRwa(calculations.totalInvestment)} × {streamingRate}% = {formatUsd(calculations.streamingReward)}
            </p>
          )}
        </div>
        
        <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 space-y-1">
          <div className="flex justify-between items-center">
            <span>{t.directReferralReward || '直推奖励'} (20%)</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{formatUsd(calculations.directRefReward)}</span>
          </div>
          {showFormulas && (
            <div className="text-[10px] text-muted-foreground mt-1 font-mono space-y-0.5">
              <p>A→B: ${formatRwa(calculations.directTotal)} × {dailyRate}% × 20% = {formatUsd(calculations.directRefRewardA)}</p>
              {calculations.directRefRewardB > 0 && <p>B→C: ${formatRwa(calculations.indirectTotal)} × {dailyRate}% × 20% = {formatUsd(calculations.directRefRewardB)}</p>}
              {calculations.directRefRewardC > 0 && <p>C→D: ${formatRwa(calculations.level3Total)} × {dailyRate}% × 20% = {formatUsd(calculations.directRefRewardC)}</p>}
            </div>
          )}
        </div>
        
        <div className="p-2 rounded-lg bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 space-y-1">
          <div className="flex justify-between items-center">
            <span>{t.indirectReferralReward || '间推奖励'} (10%)</span>
            <span className="font-mono font-semibold text-teal-600 dark:text-teal-400">{formatUsd(calculations.indirectRefReward)}</span>
          </div>
          {showFormulas && (
            <div className="text-[10px] text-muted-foreground mt-1 font-mono space-y-0.5">
              <p>A→C: ${formatRwa(calculations.indirectTotal)} × {dailyRate}% × 10% = {formatUsd(calculations.indirectRefRewardA)}</p>
              {calculations.indirectRefRewardB > 0 && <p>B→D: ${formatRwa(calculations.level3Total)} × {dailyRate}% × 10% = {formatUsd(calculations.indirectRefRewardB)}</p>}
            </div>
          )}
        </div>
        
        <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
          <div className="flex justify-between items-center">
            <span>{t.teamReward || '团队分红'} ({tierConfig[activeTab].teamDividendPercent}%)</span>
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{formatUsd(calculations.teamReward)}</span>
          </div>
          {showFormulas && (
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">
              = 团队业绩 ${formatRwa(calculations.teamPerformance)} × {dailyRate}% × {tierConfig[activeTab].teamDividendPercent}% = {formatUsd(calculations.teamReward)}
            </p>
          )}
        </div>
        
        {calculations.streamingManagementReward > 0 && (
          <div className="p-2 rounded-lg bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/30">
            <div className="flex justify-between items-center">
              <span>{t.streamingManagementReward || '推流管理'} ({tierConfig[activeTab].streamingManagementPercent}%)</span>
              <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">{formatUsd(calculations.streamingManagementReward)}</span>
            </div>
            {showFormulas && (
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                = 团队业绩 ${formatRwa(calculations.teamPerformance)} × 0.3% × {tierConfig[activeTab].streamingManagementPercent}% = {formatUsd(calculations.streamingManagementReward)}
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t-2 border-primary/30">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-center">
            <p className="text-[10px] text-muted-foreground">{t.totalDailyIncome || '日收益'}</p>
            <p className="font-mono text-base font-bold text-primary">{formatUsd(calculations.totalDailyIncome)}</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-center">
            <p className="text-[10px] text-muted-foreground">{t.dailyRatio || '日收益率'}</p>
            <p className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">{calculations.dailyRatio.toFixed(2)}%</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 text-center">
            <p className="text-[10px] text-muted-foreground">{t.monthlyIncome || '月收益'}</p>
            <p className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{formatUsd(calculations.monthlyIncome)}</p>
          </div>
          <div className="p-2 rounded-lg bg-violet-500/10 text-center">
            <p className="text-[10px] text-muted-foreground">{t.total180DayProfit || '180天收益'}</p>
            <p className="font-mono text-sm font-bold text-violet-600 dark:text-violet-400">{formatUsd(calculations.total180DayProfit)}</p>
          </div>
        </div>
        
        <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-center">
          <p className="text-[10px] text-muted-foreground">{t.paybackPeriod || '回本周期'}</p>
          <p className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">
            {calculations.paybackDays} {t.days || '天'}
          </p>
        </div>
      </div>
    </Card>
  );

  const SettingsPanel = (
    <Card className="p-3 card-luxury">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
        <Settings className="w-4 h-4 text-violet-500" />
        {t.baseParams || '基础参数'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">{t.customRwaRate || '定制RWA日利率'}</span>
            <span className="font-mono text-sm font-bold text-primary">{dailyRate.toFixed(2)}%</span>
          </div>
          <Slider
            min={1.0}
            max={1.5}
            step={0.05}
            value={[dailyRate]}
            onValueChange={([v]) => setDailyRate(v)}
            data-testid="slider-daily-rate"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>1.0%</span>
            <span>1.5%</span>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">{t.streamingRateSetting || '推流日利率'}</span>
            <span className="font-mono text-sm font-bold text-primary">{streamingRate.toFixed(2)}%</span>
          </div>
          <Slider
            min={0.2}
            max={0.4}
            step={0.02}
            value={[streamingRate]}
            onValueChange={([v]) => setStreamingRate(v)}
            data-testid="slider-streaming-rate"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0.2%</span>
            <span>0.4%</span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
            {t.cases || '案例模拟'}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 ml-3">
            {t.casesDesc || '自定义组织结构，模拟收益'}
          </p>
        </div>
      </div>

      {TierTabs}
      
      <div className={`p-2 rounded-lg text-center ${calculations.meetsMinimum ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30' : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30'}`}>
        <span className="text-sm font-semibold">
          {activeTab.toUpperCase().replace('STAR', '★').replace('VIP', 'VIP')} - {t.teamPerformance || '团队业绩'}: {formatRwa(tierConfig[activeTab].minPerformance)} RWA+
        </span>
      </div>

      {isMobile ? (
        <>
          <Tabs value={mobileView} onValueChange={(v) => setMobileView(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="tree" className="text-xs" data-testid="tab-mobile-tree">
                <Network className="w-3 h-3 mr-1" />
                {t.orgStructure || '架构'}
              </TabsTrigger>
              <TabsTrigger value="results" className="text-xs" data-testid="tab-mobile-results">
                <Calculator className="w-3 h-3 mr-1" />
                {(t as any).results || '结果'}
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs" data-testid="tab-mobile-settings">
                <Settings className="w-3 h-3 mr-1" />
                {(t as any).settings || '设置'}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={mobileView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {mobileView === 'tree' && TreePanel}
              {mobileView === 'results' && ResultsPanel}
              {mobileView === 'settings' && SettingsPanel}
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            {TreePanel}
            {SettingsPanel}
          </div>
          {ResultsPanel}
        </div>
      )}

      <NodeEditor
        node={editingNode}
        open={!!editingNodeId}
        onClose={() => setEditingNodeId(null)}
        onUpdateRwa={handleUpdateRwa}
        onRemove={handleRemoveNode}
        t={t}
      />
    </div>
  );
}
