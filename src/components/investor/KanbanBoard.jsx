import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Star, Calendar, Building2 } from 'lucide-react';

const COLUMNS = [
  { id: 'Contacted', color: 'border-blue-500/50', headerBg: 'bg-blue-900/30', dot: 'bg-blue-400' },
  { id: 'NDA Sent', color: 'border-yellow-500/50', headerBg: 'bg-yellow-900/30', dot: 'bg-yellow-400' },
  { id: 'Meeting Scheduled', color: 'border-cyan-500/50', headerBg: 'bg-cyan-900/30', dot: 'bg-cyan-400' },
  { id: 'Follow-up Needed', color: 'border-orange-500/50', headerBg: 'bg-orange-900/30', dot: 'bg-orange-400' },
  { id: 'Negotiating', color: 'border-purple-500/50', headerBg: 'bg-purple-900/30', dot: 'bg-purple-400' },
  { id: 'Passed', color: 'border-slate-500/50', headerBg: 'bg-slate-900/30', dot: 'bg-slate-400' },
];

export default function KanbanBoard({ meetings, onStatusChange, onCardClick }) {
  const onDragEnd = (result) => {
    if (!result.destination || result.source.droppableId === result.destination.droppableId) return;
    onStatusChange(result.draggableId, result.destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const items = meetings.filter(m => m.status === col.id);
          return (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}
                  className={`flex-1 min-w-[250px] rounded-xl border ${col.color} bg-slate-800/30`}>
                  <div className={`${col.headerBg} px-4 py-2.5 rounded-t-xl border-b ${col.color} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                      <h3 className="font-bold text-white text-sm">{col.id}</h3>
                    </div>
                    <span className="bg-slate-700/70 text-slate-300 text-xs px-2 py-0.5 rounded-full font-bold">{items.length}</span>
                  </div>
                  <div className="p-2 space-y-2 min-h-[300px]">
                    {items.map((m, idx) => (
                      <Draggable key={m.id} draggableId={m.id} index={idx}>
                        {(prov, snap) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                            onClick={() => onCardClick?.(m)}
                            className={`bg-slate-800 border rounded-lg p-3 cursor-pointer hover:border-cyan-500/50 transition-all ${
                              snap.isDragging ? 'shadow-lg shadow-cyan-500/20 border-cyan-500/60 scale-105' : 'border-slate-700'}`}>
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold text-white text-sm">{m.investor_name}</h4>
                            </div>
                            {m.company && (
                              <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                                <Building2 className="w-3 h-3" />{m.company}
                              </p>
                            )}
                            <div className="text-yellow-400 text-xs mb-1">{'⭐'.repeat(parseInt(m.interest_level || 3))}</div>
                            {m.meeting_date && (
                              <p className="flex items-center gap-1 text-xs text-slate-500">
                                <Calendar className="w-3 h-3" />{m.meeting_date}
                              </p>
                            )}
                            {m.pillars_discussed?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {m.pillars_discussed.slice(0, 2).map(p => (
                                  <span key={p} className="bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">{p}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}