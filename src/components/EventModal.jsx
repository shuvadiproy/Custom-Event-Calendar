import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import useCalendarStore from '../store/calendarStore';

const EventModal = ({ onClose }) => {
  const { 
    editingEvent, 
    selectedDate, 
    addEvent, 
    updateEvent, 
    deleteEvent,
    getConflictingEvents,
    checkRecurringEventConflicts
  } = useCalendarStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    color: '#3b82f6',
    recurrence: {
      type: 'none',
      interval: 1,
      unit: 'weeks'
    }
  });

  const [errors, setErrors] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [hasRecurringConflicts, setHasRecurringConflicts] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      const eventDate = parseISO(editingEvent.date);
      setFormData({
        title: editingEvent.title || '',
        description: editingEvent.description || '',
        date: format(eventDate, 'yyyy-MM-dd'),
        time: format(eventDate, 'HH:mm'),
        endTime: editingEvent.endTime || '',
        color: editingEvent.color || '#3b82f6',
        recurrence: editingEvent.recurrence || {
          type: 'none',
          interval: 1,
          unit: 'weeks'
        }
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: format(selectedDate, 'yyyy-MM-dd')
      }));
    }
  }, [editingEvent, selectedDate]);

  // Check for conflicts when form data changes
  useEffect(() => {
    if (formData.title && formData.date && formData.time) {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: `${formData.date}T${formData.time}`,
        endTime: formData.endTime || null,
        color: formData.color,
        recurrence: formData.recurrence.type === 'none' ? null : formData.recurrence
      };

      const detectedConflicts = getConflictingEvents(eventData, editingEvent?.id);
      const recurringConflicts = checkRecurringEventConflicts(eventData, editingEvent?.id);
      
      setConflicts(detectedConflicts);
      setHasRecurringConflicts(recurringConflicts);

      // Show toast warnings for conflicts
      if (detectedConflicts.length > 0 || recurringConflicts) {
        const conflictMessage = `⚠️ Event conflicts detected: ${detectedConflicts.length} existing event${detectedConflicts.length !== 1 ? 's' : ''}${recurringConflicts && detectedConflicts.length > 0 ? ' and' : ''}${recurringConflicts ? ' recurring events' : ''}`;
        toast(conflictMessage, {
          icon: '⚠️',
          style: {
            background: '#92400e',
            color: '#fed7aa',
            border: '1px solid #ea580c',
          },
        });
      }
    } else {
      setConflicts([]);
      setHasRecurringConflicts(false);
    }
  }, [formData, editingEvent?.id, getConflictingEvents, checkRecurringEventConflicts]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRecurrenceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      toast.error('Title is required');
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
      toast.error('Date is required');
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
      toast.error('Time is required');
    }
    
    if (formData.endTime && formData.time >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
      toast.error('End time must be after start time');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const eventData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: `${formData.date}T${formData.time}`,
      endTime: formData.endTime || null,
      color: formData.color,
      recurrence: formData.recurrence.type === 'none' ? null : formData.recurrence
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
      toast.success('Event updated successfully');
    } else {
      addEvent(eventData);
      toast.success('Event created successfully');
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (editingEvent && window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(editingEvent.id);
      toast.success('Event deleted successfully');
      onClose();
    }
  };

  const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Gray', value: '#6b7280' }
  ];

  return (
    <Dialog open={true} onClose={onClose} className="modal-overlay">
      <Dialog.Panel className="modal-content">
        <div className="flex items-center justify-between mb-4">
          <Dialog.Title className="text-lg font-medium text-gray-100">
            {editingEvent ? 'Edit Event' : 'Add Event'}
          </Dialog.Title>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-100 placeholder-gray-400 ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Event title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-100 placeholder-gray-400"
              rows="3"
              placeholder="Event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-100 ${
                  errors.date ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-400">{errors.date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-100 ${
                  errors.time ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-400">{errors.time}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              End Time (Optional)
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-100 ${
                errors.endTime ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-400">{errors.endTime}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Color
            </label>
            <div className="flex space-x-2">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange('color', color.value)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color.value ? 'border-gray-300' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Recurrence
            </label>
            <select
              value={formData.recurrence.type}
              onChange={(e) => handleRecurrenceChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-100"
            >
              <option value="none">No Recurrence</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>

            {formData.recurrence.type === 'custom' && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="1"
                  value={formData.recurrence.interval}
                  onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-100"
                />
                <select
                  value={formData.recurrence.unit}
                  onChange={(e) => handleRecurrenceChange('unit', e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-100"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            )}
          </div>

          {/* Conflict Warning */}
          {(conflicts.length > 0 || hasRecurringConflicts) && (
            <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded-md">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <p className="text-sm text-yellow-200">
                  ⚠️ This event conflicts with {conflicts.length} existing event{conflicts.length !== 1 ? 's' : ''}
                  {hasRecurringConflicts && conflicts.length > 0 ? ' and' : ''}
                  {hasRecurringConflicts ? ' recurring events' : ''}.
                </p>
              </div>
              {conflicts.length > 0 && (
                <div className="mt-2 text-xs text-yellow-300">
                  <p>Conflicting events:</p>
                  <ul className="list-disc list-inside mt-1">
                    {conflicts.slice(0, 3).map(conflict => (
                      <li key={conflict.id}>
                        {conflict.title} at {format(parseISO(conflict.date), 'h:mm a')}
                      </li>
                    ))}
                    {conflicts.length > 3 && (
                      <li>... and {conflicts.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <div className="flex space-x-2">
              {editingEvent && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md text-red-300 bg-gray-800 hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
              >
                {editingEvent ? 'Update' : 'Add'} Event
              </button>
            </div>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
};

export default EventModal; 