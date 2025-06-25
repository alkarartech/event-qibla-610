import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Event } from '@/mocks/events';
import useThemeStore from '@/hooks/useThemeStore';

interface CalendarViewProps {
  events: Event[];
  onEventPress: (eventId: string) => void;
}

export default function CalendarView({ events, onEventPress }: CalendarViewProps) {
  const { isDarkMode } = useThemeStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: 0, date: null });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ 
        day: i, 
        date,
        hasEvents: events.some(event => {
          const eventDate = new Date(event.date);
          return eventDate.getDate() === i && 
                 eventDate.getMonth() === month && 
                 eventDate.getFullYear() === year;
        })
      });
    }
    
    return days;
  };

  // Get events for selected date
  const getEventsForSelectedDate = () => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === selectedDate.getDate() && 
             eventDate.getMonth() === selectedDate.getMonth() && 
             eventDate.getFullYear() === selectedDate.getFullYear();
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Format month and year
  const formatMonthYear = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const calendarDays = generateCalendarDays();
  const selectedDateEvents = getEventsForSelectedDate();

  return (
    <View style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <ChevronLeft size={24} color={isDarkMode ? Colors.white : Colors.text} />
        </TouchableOpacity>
        <Text style={[
          styles.monthYear,
          isDarkMode && styles.monthYearDark
        ]}>
          {formatMonthYear(currentMonth)}
        </Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <ChevronRight size={24} color={isDarkMode ? Colors.white : Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdayHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <Text 
            key={index} 
            style={[
              styles.weekdayText,
              isDarkMode && styles.weekdayTextDark
            ]}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              item.day === 0 && styles.emptyCell,
              item.date && 
                selectedDate.getDate() === item.day && 
                selectedDate.getMonth() === currentMonth.getMonth() && 
                selectedDate.getFullYear() === currentMonth.getFullYear() && 
                styles.selectedCell
            ]}
            onPress={() => {
              if (item.day !== 0) {
                setSelectedDate(item.date!);
              }
            }}
            disabled={item.day === 0}
          >
            {item.day !== 0 && (
              <>
                <Text style={[
                  styles.dayText,
                  item.date && 
                    selectedDate.getDate() === item.day && 
                    selectedDate.getMonth() === currentMonth.getMonth() && 
                    selectedDate.getFullYear() === currentMonth.getFullYear() && 
                    styles.selectedDayText,
                  isDarkMode && styles.dayTextDark
                ]}>
                  {item.day}
                </Text>
                {item.hasEvents && <View style={styles.eventDot} />}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Events for Selected Date */}
      <View style={styles.eventsContainer}>
        <Text style={[
          styles.eventsTitle,
          isDarkMode && styles.eventsTitleDark
        ]}>
          Events for {selectedDate.toLocaleDateString()}
        </Text>
        
        <ScrollView style={styles.eventsList}>
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventItem,
                  isDarkMode && styles.eventItemDark
                ]}
                onPress={() => onEventPress(event.id)}
              >
                <Text style={[
                  styles.eventTime,
                  isDarkMode && styles.eventTimeDark
                ]}>
                  {event.time}
                </Text>
                <Text style={[
                  styles.eventTitle,
                  isDarkMode && styles.eventTitleDark
                ]}>
                  {event.title}
                </Text>
                <Text style={[
                  styles.eventLocation,
                  isDarkMode && styles.eventLocationDark
                ]}>
                  {event.mosque_name}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[
              styles.noEventsText,
              isDarkMode && styles.noEventsTextDark
            ]}>
              No events for this date
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  monthYearDark: {
    color: Colors.white,
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  weekdayTextDark: {
    color: '#AAAAAA',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  selectedCell: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: Colors.text,
  },
  dayTextDark: {
    color: Colors.white,
  },
  selectedDayText: {
    color: Colors.white,
    fontWeight: '600',
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  eventsContainer: {
    flex: 1,
    marginTop: 16,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  eventsTitleDark: {
    color: Colors.white,
  },
  eventsList: {
    flex: 1,
  },
  eventItem: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  eventItemDark: {
    backgroundColor: '#2a2a2a',
  },
  eventTime: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventTimeDark: {
    color: Colors.primaryLight,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  eventTitleDark: {
    color: Colors.white,
  },
  eventLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  eventLocationDark: {
    color: '#AAAAAA',
  },
  noEventsText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  noEventsTextDark: {
    color: '#AAAAAA',
  },
});