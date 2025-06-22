import React from 'react';
import { Toaster } from 'react-hot-toast';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import Header from './components/Header';
import useCalendarStore from './store/calendarStore';

function App() {
  const { isModalOpen, closeModal } = useCalendarStore();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header />
        <Calendar />
      </div>
      
      {isModalOpen && <EventModal onClose={closeModal} />}
      
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
          },
          success: {
            style: {
              background: '#065f46',
              color: '#d1fae5',
              border: '1px solid #047857',
            },
          },
          error: {
            style: {
              background: '#7f1d1d',
              color: '#fecaca',
              border: '1px solid #dc2626',
            },
          },
          warning: {
            style: {
              background: '#92400e',
              color: '#fed7aa',
              border: '1px solid #ea580c',
            },
          },
        }}
      />
    </div>
  );
}

export default App; 