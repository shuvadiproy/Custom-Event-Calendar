import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  parseISO,
  addDays,
  addWeeks,
  addMonths as addMonthsToDate,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  subDays,
  addHours
} from 'date-fns';

const useCalendarStore = create(
  persist(
    (set, get) => ({
      // Current view state
      currentDate: new Date(),
      viewMode: 'month', // 'month', 'week', 'day'
      
      // Events
      events: [],
      
      // UI state
      isModalOpen: false,
      editingEvent: null,
      selectedDate: null,
      
      // Navigation
      goToNextMonth: () => {
        set(state => ({
          currentDate: addMonths(state.currentDate, 1)
        }));
      },
      
      goToPrevMonth: () => {
        set(state => ({
          currentDate: subMonths(state.currentDate, 1)
        }));
      },
      
      goToToday: () => {
        set({ currentDate: new Date() });
      },
      
      // Event management
      addEvent: (event) => {
        const newEvent = {
          ...event,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        set(state => ({
          events: [...state.events, newEvent]
        }));
      },
      
      updateEvent: (eventId, updates) => {
        set(state => ({
          events: state.events.map(event => 
            event.id === eventId ? { ...event, ...updates } : event
          )
        }));
      },
      
      deleteEvent: (eventId) => {
        set(state => ({
          events: state.events.filter(event => event.id !== eventId)
        }));
      },
      
      // UI actions
      openModal: (date = null, event = null) => {
        set({
          isModalOpen: true,
          selectedDate: date,
          editingEvent: event
        });
      },
      
      closeModal: () => {
        set({
          isModalOpen: false,
          editingEvent: null,
          selectedDate: null
        });
      },
      
      // Calendar data
      getCalendarDays: () => {
        const { currentDate } = get();
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      },
      
      // Get events for a specific date
      getEventsForDate: (date) => {
        const { events } = get();
        const targetDate = startOfDay(date);
        
        return events.filter(event => {
          const eventDate = startOfDay(parseISO(event.date));
          
          // Check if it's a recurring event
          if (event.recurrence) {
            return get().isRecurringEventOnDate(event, targetDate);
          }
          
          // Check if it's a one-time event
          return isSameDay(eventDate, targetDate);
        });
      },
      
      // Check if a recurring event occurs on a specific date
      isRecurringEventOnDate: (event, targetDate) => {
        const eventDate = parseISO(event.date);
        const { recurrence } = event;
        
        if (!recurrence) return false;
        
        switch (recurrence.type) {
          case 'daily':
            return isAfter(targetDate, subDays(eventDate, 1));
            
          case 'weekly':
            const eventDayOfWeek = format(eventDate, 'EEEE');
            const targetDayOfWeek = format(targetDate, 'EEEE');
            return eventDayOfWeek === targetDayOfWeek && 
                   isAfter(targetDate, subDays(eventDate, 1));
                   
          case 'monthly':
            const eventDay = format(eventDate, 'd');
            const targetDay = format(targetDate, 'd');
            return eventDay === targetDay && 
                   isAfter(targetDate, subDays(eventDate, 1));
                   
          case 'custom':
            // Handle custom recurrence logic
            return get().checkCustomRecurrence(event, targetDate);
            
          default:
            return false;
        }
      },
      
      // Check custom recurrence
      checkCustomRecurrence: (event, targetDate) => {
        const eventDate = parseISO(event.date);
        const { recurrence } = event;
        
        if (recurrence.type !== 'custom') return false;
        
        const interval = recurrence.interval || 1;
        const unit = recurrence.unit || 'weeks';
        
        let currentDate = eventDate;
        const maxIterations = 100; // Prevent infinite loops
        let iterations = 0;
        
        while (iterations < maxIterations) {
          if (isSameDay(currentDate, targetDate)) {
            return true;
          }
          
          if (isAfter(currentDate, targetDate)) {
            break;
          }
          
          switch (unit) {
            case 'days':
              currentDate = addDays(currentDate, interval);
              break;
            case 'weeks':
              currentDate = addWeeks(currentDate, interval);
              break;
            case 'months':
              currentDate = addMonthsToDate(currentDate, interval);
              break;
            default:
              return false;
          }
          
          iterations++;
        }
        
        return false;
      },
      
      // Check for event conflicts
      checkEventConflicts: (newEvent, excludeEventId = null) => {
        const { events } = get();
        const newEventStart = parseISO(newEvent.date);
        const newEventEnd = newEvent.endTime ? 
          parseISO(`${format(newEventStart, 'yyyy-MM-dd')}T${newEvent.endTime}`) :
          addHours(newEventStart, 1);
        
        return events
          .filter(event => event.id !== excludeEventId)
          .some(event => {
            const eventStart = parseISO(event.date);
            const eventEnd = event.endTime ? 
              parseISO(`${format(eventStart, 'yyyy-MM-dd')}T${event.endTime}`) :
              addHours(eventStart, 1);
            
            // Check for overlap
            return (newEventStart < eventEnd && newEventEnd > eventStart);
          });
      },

      // Get conflicting events with details
      getConflictingEvents: (newEvent, excludeEventId = null) => {
        const { events } = get();
        const newEventStart = parseISO(newEvent.date);
        const newEventEnd = newEvent.endTime ? 
          parseISO(`${format(newEventStart, 'yyyy-MM-dd')}T${newEvent.endTime}`) :
          addHours(newEventStart, 1);
        
        return events
          .filter(event => event.id !== excludeEventId)
          .filter(event => {
            const eventStart = parseISO(event.date);
            const eventEnd = event.endTime ? 
              parseISO(`${format(eventStart, 'yyyy-MM-dd')}T${event.endTime}`) :
              addHours(eventStart, 1);
            
            // Check for overlap
            return (newEventStart < eventEnd && newEventEnd > eventStart);
          })
          .map(event => ({
            ...event,
            conflictType: get().getConflictType(newEventStart, newEventEnd, event)
          }));
      },

      // Determine the type of conflict
      getConflictType: (newEventStart, newEventEnd, existingEvent) => {
        const eventStart = parseISO(existingEvent.date);
        const eventEnd = existingEvent.endTime ? 
          parseISO(`${format(eventStart, 'yyyy-MM-dd')}T${existingEvent.endTime}`) :
          addHours(eventStart, 1);
        
        if (newEventStart >= eventStart && newEventEnd <= eventEnd) {
          return 'contained'; // New event is completely within existing event
        } else if (eventStart >= newEventStart && eventEnd <= newEventEnd) {
          return 'contains'; // New event completely contains existing event
        } else if (newEventStart < eventStart && newEventEnd > eventStart) {
          return 'overlaps_start'; // New event overlaps with start of existing event
        } else {
          return 'overlaps_end'; // New event overlaps with end of existing event
        }
      },

      // Check if event conflicts with recurring events
      checkRecurringEventConflicts: (newEvent, excludeEventId = null) => {
        const { events } = get();
        const newEventStart = parseISO(newEvent.date);
        const newEventEnd = newEvent.endTime ? 
          parseISO(`${format(newEventStart, 'yyyy-MM-dd')}T${newEvent.endTime}`) :
          addHours(newEventStart, 1);
        
        return events
          .filter(event => event.id !== excludeEventId && event.recurrence)
          .some(event => {
            // Check if the new event conflicts with this recurring event
            return get().isRecurringEventOnDate(event, newEventStart) && 
                   get().checkTimeConflict(newEventStart, newEventEnd, event);
          });
      },

      // Check time conflict between two events on the same day
      checkTimeConflict: (newEventStart, newEventEnd, existingEvent) => {
        const eventStart = parseISO(existingEvent.date);
        const eventEnd = existingEvent.endTime ? 
          parseISO(`${format(eventStart, 'yyyy-MM-dd')}T${existingEvent.endTime}`) :
          addHours(eventStart, 1);
        
        // Extract time components for comparison
        const newStartTime = format(newEventStart, 'HH:mm');
        const newEndTime = format(newEventEnd, 'HH:mm');
        const existingStartTime = format(eventStart, 'HH:mm');
        const existingEndTime = format(eventEnd, 'HH:mm');
        
        // Check for time overlap
        return (newStartTime < existingEndTime && newEndTime > existingStartTime);
      }
    }),
    {
      name: 'calendar-storage',
      partialize: (state) => ({ 
        events: state.events
      })
    }
  )
);

export default useCalendarStore; 