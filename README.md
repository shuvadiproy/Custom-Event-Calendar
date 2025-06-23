# 🗓️ Custom Event Calendar

A dynamic, interactive Event Calendar built with React that allows users to manage their schedule with drag-and-drop rescheduling, recurring events, and local persistence.

## 🌐 Live Demo

**[View Live Demo](https://custom-eventcalendar.netlify.app/)** - Try out the calendar features online!

## ✨ Features

- **Monthly Calendar View** with navigation and today highlighting
- **Event Management** - Create, edit, delete events with color coding
- **Recurring Events** - Daily, weekly, monthly, and custom intervals
- **Drag-and-Drop** - Reschedule events by dragging to different days
- **Conflict Detection** - Real-time conflict warnings with visual indicators
- **Local Storage** - All events persist across browser sessions

## 🛠️ Tech Stack

- **React 18** with functional components and hooks
- **Zustand** for state management
- **Tailwind CSS** for styling
- **date-fns** for date manipulation
- **@hello-pangea/dnd** for drag-and-drop
- **Headless UI** for modals
- **Vite** for build tool

## 📱 Compatibility

This project is tested and runs perfectly on Google Chrome for both desktop and mobile devices.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📱 Usage

- **Add Event**: Click "Add Event" button or any calendar day
- **Edit Event**: Click on any event in the calendar
- **Move Event**: Drag and drop events to different days
- **Recurring Events**: Set recurrence when creating/editing events

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Calendar.jsx    # Main calendar grid
│   ├── EventModal.jsx  # Event add/edit modal
│   └── Header.jsx      # Navigation header
├── store/              # State management
│   └── calendarStore.js # Zustand store
├── App.jsx             # Main app component
└── index.css          # Global styles
```

## 🎨 Features

### Event Colors
7 predefined colors: Blue, Red, Green, Yellow, Purple, Pink, Gray

### Conflict Management
- Real-time conflict detection
- Visual conflict indicators
- Conflict count display
- Toast notifications for warnings

### Recurring Events
- Daily, weekly, monthly patterns
- Custom intervals (every X days/weeks/months)
- Automatic conflict detection for recurring events
