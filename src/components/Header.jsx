import React from 'react';
import { format } from 'date-fns';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import useCalendarStore from '../store/calendarStore';

const Header = () => {
  const { 
    currentDate, 
    goToPrevMonth, 
    goToNextMonth, 
    goToToday, 
    openModal
  } = useCalendarStore();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-100">Event Calendar</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Event
          </button>
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-300" />
          </button>
          
          <h2 className="text-2xl font-semibold text-gray-100">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-300" />
          </button>
        </div>
        
        <button
          onClick={() => {
            goToToday();
            toast.success('Navigated to today');
          }}
          className="px-4 py-2 text-sm font-medium text-blue-400 bg-blue-900/30 border border-blue-700 rounded-md hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
        >
          Today
        </button>
      </div>
    </div>
  );
};

export default Header;