import React from 'react';
import { format, isSameDay, isSameMonth, isToday } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import useCalendarStore from '../store/calendarStore';

const Calendar = () => {
  const { 
    currentDate, 
    getCalendarDays, 
    getEventsForDate,
    openModal,
    getConflictingEvents,
    checkRecurringEventConflicts
  } = useCalendarStore();

  const calendarDays = getCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const eventId = result.draggableId;
    const sourceDate = calendarDays[parseInt(source.droppableId)];
    const destinationDate = calendarDays[parseInt(destination.droppableId)];

    // Check for conflicts before updating
    const event = useCalendarStore.getState().events.find(e => e.id === eventId);
    if (event) {
      const updatedEvent = {
        ...event,
        date: format(destinationDate, 'yyyy-MM-dd\'T\'HH:mm')
      };
      
      const conflicts = getConflictingEvents(updatedEvent, eventId);
      const hasRecurringConflicts = checkRecurringEventConflicts(updatedEvent, eventId);
      
      if (conflicts.length > 0 || hasRecurringConflicts) {
        const conflictMessage = `⚠️ Moving event will create ${conflicts.length} conflict${conflicts.length !== 1 ? 's' : ''}${hasRecurringConflicts && conflicts.length > 0 ? ' and' : ''}${hasRecurringConflicts ? ' recurring conflicts' : ''}`;
        toast(conflictMessage, {
          icon: '⚠️',
          style: {
            background: '#92400e',
            color: '#fed7aa',
            border: '1px solid #ea580c',
          },
        });
      } else {
        toast.success('Event moved successfully');
      }
    }

    // Update the event date
    useCalendarStore.getState().updateEvent(eventId, {
      date: format(destinationDate, 'yyyy-MM-dd\'T\'HH:mm')
    });
  };

  // Check if an event has conflicts
  const hasEventConflicts = (event) => {
    const conflicts = getConflictingEvents(event, event.id);
    const hasRecurringConflicts = checkRecurringEventConflicts(event, event.id);
    return conflicts.length > 0 || hasRecurringConflicts;
  };

  // Get conflict count for an event
  const getConflictCount = (event) => {
    const conflicts = getConflictingEvents(event, event.id);
    const hasRecurringConflicts = checkRecurringEventConflicts(event, event.id);
    let count = conflicts.length;
    if (hasRecurringConflicts) count += 1;
    return count;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow border border-gray-700">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-px bg-gray-700">
        {weekDays.map(day => (
          <div
            key={day}
            className="bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 gap-px bg-gray-700">
          {calendarDays.map((day, index) => {
            const events = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);

            return (
              <Droppable key={index} droppableId={index.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`calendar-day ${
                      isTodayDate ? 'today' : ''
                    } ${
                      !isCurrentMonth ? 'other-month' : ''
                    } ${
                      snapshot.isDraggingOver ? 'bg-blue-900/50' : ''
                    }`}
                    onClick={() => openModal(day)}
                  >
                    <div className="text-sm font-medium mb-2 text-gray-100">
                      {format(day, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {events.map((event, eventIndex) => {
                        const hasConflicts = hasEventConflicts(event);
                        const conflictCount = hasConflicts ? getConflictCount(event) : 0;
                        
                        return (
                          <Draggable
                            key={event.id}
                            draggableId={event.id}
                            index={eventIndex}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`event-item ${hasConflicts ? 'conflict' : ''}`}
                                style={{
                                  backgroundColor: event.color || '#3b82f6',
                                  ...provided.draggableProps.style
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (hasConflicts) {
                                    const conflictMessage = `⚠️ This event has ${conflictCount} conflict${conflictCount !== 1 ? 's' : ''}. Click to edit and resolve.`;
                                    toast(conflictMessage, {
                                      icon: '⚠️',
                                      style: {
                                        background: '#92400e',
                                        color: '#fed7aa',
                                        border: '1px solid #ea580c',
                                      },
                                    });
                                  }
                                  openModal(day, event);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="truncate text-xs">
                                    {event.title}
                                  </span>
                                  {hasConflicts && (
                                    <div className="flex items-center ml-1">
                                      <ExclamationTriangleIcon 
                                        className="h-3 w-3 text-red-300" 
                                        title={`${conflictCount} conflict${conflictCount !== 1 ? 's' : ''}`}
                                      />
                                      {conflictCount > 1 && (
                                        <span className="text-xs text-red-300 ml-1">
                                          {conflictCount}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Conflict indicator tooltip */}
                                {hasConflicts && (
                                  <div className="conflict-tooltip">
                                    {conflictCount} conflict{conflictCount !== 1 ? 's' : ''} detected
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Calendar;