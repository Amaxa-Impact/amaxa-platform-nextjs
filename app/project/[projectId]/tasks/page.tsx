"use client"

import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { api } from '@/convex/_generated/api'
import { useQuery, useMutation } from 'convex/react'
import type { Id } from '@/convex/_generated/dataModel'
import { memo, useCallback, useMemo, useState, useRef, useEffect } from 'react'
import {
  ReactFlow,
  useReactFlow,
  useOnViewportChange,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeMouseHandler,
  type Viewport,
  MarkerType,
} from '@xyflow/react'
import { TaskNode } from '@/components/dashboard/sidebar/TaskNode'
import type { TaskNodeData } from '@/components/dashboard/sidebar/TaskNode'
import { useDashboardContext } from '@/components/dashboard/context'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { IconPlus, IconTrash, IconCopy } from '@tabler/icons-react'
import { useConvexAuth } from 'convex/react'
import { Cursor } from '@/components/dashboard/cursor'
import usePresence from '@/hooks/use-presence'


const nodeTypes: NodeTypes = {
  task: TaskNode,
  default: TaskNode,
}

const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
}

type CursorPresenceData = {
  x: number
  y: number
  name: string
  color: string
  emoji: string
}

function getStableUserId(): string {
  if (typeof window === 'undefined') return 'ssr'
  
  const storageKey = 'presence-user-id'
  let storedId = sessionStorage.getItem(storageKey)
  
  if (!storedId) {
    storedId = crypto.randomUUID()
    sessionStorage.setItem(storageKey, storedId)
  }
  
  return storedId
}

function getUserColor(userId: string): string {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
  ]
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export default function RouteComponent() {
  return (
      <TasksFlowContent />
  )
}

function TasksFlowContent() {
  const { projectId } = useParams<{ projectId: Id<'projects'> }>()
  const { userRole } = useDashboardContext()
  const { isAuthenticated } = useConvexAuth()
  const { user } = useAuth()
  
  const { screenToFlowPosition, flowToScreenPosition } = useReactFlow()

  const project = useQuery(
    api.projects.get, { projectId },
  )
  const convexNodes = useQuery(
    api.tasks.listForProject, { projectId },
  )
  const convexEdges = useQuery(
    api.edges.listForProject, { projectId },
  )

  const createTask = useMutation(api.tasks.create)
  const updatePosition = useMutation(api.tasks.updatePosition)
  const updateTaskData = useMutation(api.tasks.updateData)
  const removeTask = useMutation(api.tasks.remove)
  const createEdge = useMutation(api.edges.create)
  const removeEdge = useMutation(api.edges.remove)

  const userIdRef = useRef<string | null>(null)
  if (userIdRef.current === null) {
    userIdRef.current = getStableUserId()
  }
  const userId = userIdRef.current

  const roomId = `project:${projectId}:tasks`
  const userColor = getUserColor(userId)
  
  const userName = user?.firstName ?? ''
  const initialPresenceData: CursorPresenceData = useMemo(
    () => ({
      x: 0,
      y: 0,
      name: userName,
      color: userColor,
      emoji: '👤',
    }),
    [userName, userColor],
  )

  const [_myPresenceData, othersPresence, updatePresence] = usePresence(
    roomId,
    userId,
    initialPresenceData,
  )

  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    nodeId?: string
    edgeId?: string
  } | null>(null)

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  
  // Track viewport changes to trigger cursor position updates on pan/zoom
  const [_viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 })
  useOnViewportChange({
    onChange: setViewport,
  })

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (reactFlowWrapper.current && isAuthenticated) {
        const flowPosition = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })
        updatePresence({ x: flowPosition.x, y: flowPosition.y })
      }
    },
    [updatePresence, isAuthenticated, screenToFlowPosition],
  )

  const initialNodes = useMemo(
    () => (convexNodes || []) as Node[],
    [convexNodes],
  )
  const initialEdges = useMemo(
    () => (convexEdges || []) as Edge[],
    [convexEdges],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    if (convexNodes) {
      setNodes(convexNodes as Node[])
    }
  }, [convexNodes, setNodes])

  useEffect(() => {
    if (convexEdges) {
      setEdges(convexEdges as Edge[])
    }
  }, [convexEdges, setEdges])

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (connection.source && connection.target) {
        setEdges((eds) => addEdge(connection, eds))

        await createEdge({
          projectId,
          source: connection.source as Id<'tasks'>,
          target: connection.target as Id<'tasks'>,
          type: 'smoothstep',
          sourceHandle: connection.sourceHandle ?? undefined,
          targetHandle: connection.targetHandle ?? undefined,
        })
      }
    },
    [setEdges, createEdge, projectId],
  )

  const onNodeDragStop = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      await updatePosition({
        taskId: node.id as Id<'tasks'>,
        position: node.position,
      })
    },
    [updatePosition],
  )

  const handleStatusChange = useCallback(
    async (taskId: string, status: TaskNodeData['status']) => {
      await updateTaskData({
        taskId: taskId as Id<'tasks'>,
        data: { status },
      })
    },
    [updateTaskData],
  )

  const handleDataChange = useCallback(
    async (taskId: string, data: Partial<TaskNodeData>) => {
      await updateTaskData({
        taskId: taskId as Id<'tasks'>,
        data,
      })
    },
    [updateTaskData],
  )

  const addNewTask = useCallback(
    async (position?: { x: number; y: number }) => {
      let pos: { x: number; y: number }
      
      if (position) {
        // Context menu position is in screen coords relative to wrapper, convert to flow
        if (reactFlowWrapper.current) {
          const rect = reactFlowWrapper.current.getBoundingClientRect()
          pos = screenToFlowPosition({
            x: rect.left + position.x,
            y: rect.top + position.y,
          })
        } else {
          pos = position
        }
      } else {
        pos = {
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100,
        }
      }

      await createTask({
        projectId,
        type: 'task',
        position: pos,
        data: {
          label: `New Task`,
          status: 'todo',
          priority: 'medium',
        },
      })
    },
    [createTask, projectId, screenToFlowPosition],
  )

  const deleteTask = useCallback(
    async (taskId: string) => {
      await removeTask({ taskId: taskId as Id<'tasks'> })
    },
    [removeTask],
  )

  const deleteEdge = useCallback(
    async (edgeId: string) => {
      await removeEdge({ edgeId: edgeId as Id<'edges'> })
    },
    [removeEdge],
  )

  const handlePaneContextMenu = useCallback((event: MouseEvent | React.MouseEvent) => {
    event.preventDefault()
    if (reactFlowWrapper.current) {
      const rect = reactFlowWrapper.current.getBoundingClientRect()
      setContextMenu({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })
    }
  }, [])

  const handleNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault()
    if (reactFlowWrapper.current) {
      const rect = reactFlowWrapper.current.getBoundingClientRect()
      setContextMenu({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        nodeId: node.id,
      })
    }
  }, [])

  const handleEdgeContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent, edge: Edge) => {
      event.preventDefault()
      if (reactFlowWrapper.current) {
        const rect = reactFlowWrapper.current.getBoundingClientRect()
        setContextMenu({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          edgeId: edge.id,
        })
      }
    },
    [],
  )

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const nodesForRender = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: {
          ...(n.data as TaskNodeData),
          onStatusChange: (status: TaskNodeData['status']) =>
            handleStatusChange(n.id, status),
          onDataChange: (data: Partial<TaskNodeData>) =>
            handleDataChange(n.id, data),
        },
      })),
    [nodes, handleStatusChange, handleDataChange],
  )

  const layoutStyle = useMemo(
    () => ({
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
    }),
    [],
  )

  // Function to render cursors - converts flow coordinates to screen coordinates
  // This properly handles different zoom levels between users
  // Viewport state triggers re-render when user zooms/pans
  const getCursorScreenPosition = (flowX: number, flowY: number) => {
    if (!reactFlowWrapper.current) return { x: 0, y: 0 }
    
    const rect = reactFlowWrapper.current.getBoundingClientRect()
    
    const screenPosition = flowToScreenPosition({
      x: flowX,
      y: flowY,
    })
    
    return {
      x: screenPosition.x - rect.left,
      y: screenPosition.y - rect.top,
    }
  }

  return (
    <div style={layoutStyle}>
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-2xl font-bold">{project?.name ?? 'Project'}</h1>
        <div className="flex items-center gap-4">
          {othersPresence && othersPresence.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {othersPresence.length} other{othersPresence.length !== 1 ? 's' : ''} here
              </span>
              <div className="flex -space-x-2">
                {othersPresence.slice(0, 5).map((p) => {
                  const data = p.data as CursorPresenceData
                  const name = data.name || `User ${p.user.slice(0, 4)}`
                  const initials = name
                    .split(' ')
                    .filter(Boolean)
                    .map(word => word[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || name.slice(0, 2).toUpperCase()
                  
                  return (
                    <div
                      key={p.user}
                      className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: data.color || '#3b82f6' }}
                      title={name}
                    >
                      {initials}
                    </div>
                  )
                })}
                {othersPresence.length > 5 && (
                  <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                    +{othersPresence.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}

          {userRole && (
            <Button
              type="button"
              onClick={() => addNewTask()}
              className="px-4 py-2"
              variant="outline"
            >
              <IconPlus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      <div
        ref={reactFlowWrapper}
        className="flex-1 relative"
        onPointerMove={handleMouseMove}
        role="application"
        aria-label="Task flow canvas"
      >
        <TasksGraph
          nodes={nodesForRender}
          edges={edges}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onPaneContextMenu={handlePaneContextMenu}
          onNodeContextMenu={handleNodeContextMenu}
          onEdgeContextMenu={handleEdgeContextMenu}
        />

        {othersPresence
          ?.filter((p) => {
            const data = p.data as CursorPresenceData
            return data.x !== 0 || data.y !== 0
          })
          .map((presence) => {
            const data = presence.data as CursorPresenceData
            const pos = getCursorScreenPosition(data.x, data.y)
            
            return (
              <Cursor
                key={presence.user}
                x={pos.x}
                y={pos.y}
                name={data.name || `User ${presence.user.slice(0, 4)}`}
                color={data.color}
              />
            )
          })}

        {contextMenu && (
          <div
            className="fixed z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <ContextMenu
              open
              onOpenChange={(open) => !open && closeContextMenu()}
            >
              <ContextMenuTrigger >
                <div className="w-0 h-0" />
              </ContextMenuTrigger>
              <ContextMenuContent
                className="w-48"
              >
                {contextMenu.nodeId ? (
                  <>
                    <ContextMenuItem
                      onClick={() => {
                        closeContextMenu()
                      }}
                    >
                      <IconCopy className="w-4 h-4 mr-2" />
                      Duplicate Task
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      variant="destructive"
                      onClick={() => {
                        if (contextMenu.nodeId) {
                          deleteTask(contextMenu.nodeId)
                        }
                        closeContextMenu()
                      }}
                    >
                      <IconTrash className="w-4 h-4 mr-2" />
                      Delete Task
                    </ContextMenuItem>
                  </>
                ) : contextMenu.edgeId ? (
                  <ContextMenuItem
                    variant="destructive"
                    onClick={() => {
                      if (contextMenu.edgeId) {
                        deleteEdge(contextMenu.edgeId)
                      }
                      closeContextMenu()
                    }}
                  >
                    <IconTrash className="w-4 h-4 mr-2" />
                    Delete Connection
                  </ContextMenuItem>
                ) : (
                  <ContextMenuItem
                    onClick={() => {
                      addNewTask({ x: contextMenu.x, y: contextMenu.y })
                      closeContextMenu()
                    }}
                  >
                    <IconPlus className="w-4 h-4 mr-2" />
                    Add Task Here
                  </ContextMenuItem>
                )}
              </ContextMenuContent>
            </ContextMenu>
          </div>
        )}
      </div>
    </div>
  )
}

type TasksGraphProps = {
  nodes: Node[]
  edges: Edge[]
  onConnect: (connection: Connection) => void
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onNodeDragStop: NodeMouseHandler
  onPaneContextMenu: (event: MouseEvent | React.MouseEvent) => void
  onNodeContextMenu: NodeMouseHandler
  onEdgeContextMenu: (event: MouseEvent | React.MouseEvent, edge: Edge) => void
}

const TasksGraph = memo(function TasksGraph({
  nodes,
  edges,
  onConnect,
  onNodesChange,
  onEdgesChange,
  onNodeDragStop,
  onPaneContextMenu,
  onNodeContextMenu,
  onEdgeContextMenu,
}: TasksGraphProps) {
  const layoutStyle = useMemo(
    () => ({
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
    }),
    [],
  )
  const fitViewOptions = useMemo(() => ({ padding: 0.2 }), [])
  const proOptions = useMemo(() => ({ hideAttribution: true }), [])
  const snapGrid = useMemo(() => [15, 15] as [number, number], [])

  return (
    <div style={layoutStyle}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        zoomOnScroll={true}
        onlyRenderVisibleElements
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={proOptions}
        snapToGrid
        snapGrid={snapGrid}
        colorMode="dark"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
})
