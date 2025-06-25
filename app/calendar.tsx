import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { globalStyles } from '@/constants/theme';
import useThemeStore from '@/hooks/useThemeStore';
import useEvents from '@/hooks/useEvents';
import { Event } from '@/mocks/events';
import { 
  gregorianToHijri, 
  hijriMonthNames, 
  getIslamicEventsForDate,
  isFirstDayOfHijriMonth,
  getHijriMonthsForGregorianMonth
} from '@/utils/hijriDate';
import { formatTime, getDaysInMonth, isSameDay } from '@/utils/dateUtils';

// Islamic Events Data with Numeric Months
const islamicEvents = [
  { name: "Martyrdom of Imam Hussain (A.S.)", day: 10, month: 1 },
  { name: "Birth of Sakina Binte Imam Hussain (A.S.)", day: 20, month: 1 },
  { name: "Martyrdom of Imam Zain-ul-AbEiden (A.S.)", day: 25, month: 1 },
  { name: "Birth of Imam Musa Kazim (A.S.)", day: 7, month: 2 },
  { name: "Martyrdom of Imam Ali Reza (A.S.)", day: 17, month: 2 },
  { name: "Arbaeen", day: 20, month: 2 },
  { name: "Martyrdom of Zinab", day: 24, month: 2 },
  { name: "Martyrdom The Holy Prophet (S.A.)", day: 28, month: 2 },
  { name: "Martyrdom of Imam Hassan Al-Mujtaba (A.S.)", day: 28, month: 2 },
  { name: "Martyrdom of Imam Hassan Askari (A.S.)", day: 8, month: 3 },
  { name: "Birth of Imam Jafar-e-Sadiq (A.S.)", day: 17, month: 3 },
  { name: "Birth of Holy Prophet Mohammed (S.A.W.S)", day: 17, month: 3 },
  { name: "Birth of Imam Hassan Al-Askari (A.S.)", day: 10, month: 4 },
  { name: "Birth of Imam Ali ibn Hussain Al-Sajjad (A.S.)", day: 15, month: 5 },
  { name: "Martyrdom of Fatima Zahra (S.A.)", day: 3, month: 6 },
  { name: "Birth of Fatima Al-Zahra (A.S.)", day: 20, month: 6 },
  { name: "Birth of Imam Mohammed Baqir (A.S.) & of Sakina Bint Imam Husain (A.S)", day: 1, month: 7 },
  { name: "Martyrdom of Imam Ali Al-Hadi (A.S.)", day: 3, month: 7 },
  { name: "Birth of Imam Mohammed Al-Jawad (A.S.)", day: 10, month: 7 },
  { name: "Birth of Imam Ali ibn Abi Talib Amir Al-Momineen (A.S.)", day: 13, month: 7 },
  { name: "Martyrdom of Imam Musa ibn Jafar Al-Kazim (A.S.)", day: 25, month: 7 },
  { name: "Birth of Zinab ibn Ali (A.S.)", day: 1, month: 8 },
  { name: "Birth of Imam Hussain (A.S.)", day: 3, month: 8 },
  { name: "Birth of Abbas ibn Ali (A.S)", day: 4, month: 8 },
  { name: "Birth of Ali Al-Akbar ibn Imam Hussain (A.S.)", day: 11, month: 8 },
  { name: "Birth of Imam Al-Mahdi (A.S.)", day: 15, month: 8 },
  { name: "Martyrdom of Abu Talib (A.S.)", day: 8, month: 9 },
  { name: "Martyrdom of Khadija Al-Kubra (S.A.)", day: 10, month: 9 },
  { name: "Birth of Imam Hassan (A.S.)", day: 15, month: 9 },
  { name: "Imam Ali ibn Abi Talib (A.S.) Struck", day: 19, month: 9 },
  { name: "Martyrdom Imam Ali ibn Abi Talib (A.S.)", day: 21, month: 9 },
  { name: "Laylat-Al-Qadar (The Night of Destiny)", day: 19, month: 9 },
  { name: "Laylat-Al-Qadar (The Night of Destiny)", day: 21, month: 9 },
  { name: "Laylat-Al-Qadar (The Night of Destiny)", day: 23, month: 9 },
  { name: "Eid Al-Fitr", day: 1, month: 10 },
  { name: "Martyrdom Imam Jafar ibn Mohammed Al-Sadiq (A.S.)", day: 25, month: 10 },
  { name: "Martyrdom of Fatima Bint Asad", day: 1, month: 11 },
  { name: "Birth Imam Ali ibn Musa Al-Rida (A.S.)", day: 11, month: 11 },
  { name: "Martyrdom of Imam Mohammed Al-Jawad (A.S.)", day: 29, month: 11 },
  { name: "Marriage of Imam Ali and Fatima Al-Zahra (A.S)", day: 1, month: 12 },
  { name: "Martyrdom of Imam Mohammed Baqir (A.S.)", day: 7, month: 12 },
  { name: "Martyrdom of Muslim Ibn Aqil (A.S.)", day: 9, month: 12 },
  { name: "Eid Al-Adha", day: 10, month: 12 },
  { name: "Birth of Imam Ali Al-Hadi (A.S.)", day: 15, month: 12 },
  { name: "Martyrdom of Zainab (A.S.)", day: 16, month: 12 },
  { name: "Eid Al-Ghadir", day: 18, month: 12 },
  { name: "Martyrdom of Children of Muslim Ibn Aqil (A.S.)", day: 22, month: 12 },
  { name: "Eid Mubahila", day: 24, month: 12 },
];

// Calendar view modes
type ViewMode = 'month' | 'week' | 'day' | 'year';

export default function CalendarScreen() {
  const router = useRouter();
  const { isDarkMode, use24HourFormat } = useThemeStore();
  const { savedEvents, refreshSavedEvents } = useEvents();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  
  // Refresh saved events when component mounts
  useEffect(() => {
    refreshSavedEvents();
  }, [refreshSavedEvents]);
  
  // Get events for the selected date
  const getEventsForDate = (date: Date) => {
    return savedEvents.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };
  
  // Get events for the selected date
  const eventsForSelectedDate = getEventsForDate(selectedDate);
  
  // Get Hijri date for the selected date
  const selectedHijriDate = gregorianToHijri(selectedDate);
  
  // Get Islamic events for the selected date
  const islamicEventsForSelectedDate = getIslamicEventsForDate(selectedHijriDate, islamicEvents);
  
  // Navigate to previous period based on current view mode
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    setCurrentDate(newDate);
    // Also update selected date in day view
    if (viewMode === 'day') {
      setSelectedDate(newDate);
    }
  };
  
  // Navigate to next period based on current view mode
  const goToNext = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    setCurrentDate(newDate);
    // Also update selected date in day view
    if (viewMode === 'day') {
      setSelectedDate(newDate);
    }
  };
  
  // Format date based on view mode
  const formatDateHeader = () => {
    const options: Intl.DateTimeFormatOptions = {};
    const hijriDate = gregorianToHijri(currentDate);
    const hijriMonthName = hijriMonthNames[hijriDate.month - 1];
    
    switch (viewMode) {
      case 'day':
        options.weekday = 'long';
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        return `${currentDate.toLocaleDateString('default', options)}
${hijriMonthName} ${hijriDate.day}, ${hijriDate.year} Hijri`;
      case 'week':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const startMonth = startOfWeek.toLocaleString('default', { month: 'short' });
        const endMonth = endOfWeek.toLocaleString('default', { month: 'short' });
        
        const startHijri = gregorianToHijri(startOfWeek);
        const endHijri = gregorianToHijri(endOfWeek);
        
        return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${currentDate.getFullYear()}
${hijriMonthNames[startHijri.month - 1]} ${startHijri.day} - ${hijriMonthNames[endHijri.month - 1]} ${endHijri.day}, ${hijriDate.year} Hijri`;
      case 'month':
        options.year = 'numeric';
        options.month = 'long';
        return `${currentDate.toLocaleDateString('default', options)}
${hijriMonthName} ${hijriDate.year} Hijri`;
      case 'year':
        options.year = 'numeric';
        return `${currentDate.getFullYear()}
${hijriDate.year} Hijri`;
    }
    
    return currentDate.toLocaleDateString('default', options);
  };
  
  // Generate days for the month view
  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and number of days in month
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = getDaysInMonth(year, month);
    
    // Create array for all days in the month view
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: 0, date: null });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const hijriDate = gregorianToHijri(date);
      const hasEvents = savedEvents.some(event => {
        const eventDate = new Date(event.date);
        return isSameDay(eventDate, date);
      });
      
      const hasIslamicEvents = getIslamicEventsForDate(hijriDate, islamicEvents).length > 0;
      
      days.push({ 
        day: i, 
        date,
        hijriDay: hijriDate.day,
        hijriMonth: hijriDate.month,
        hasEvents,
        hasIslamicEvents,
        isNewHijriMonth: isFirstDayOfHijriMonth(date)
      });
    }
    
    return days;
  };
  
  // Generate months for the year view
  const generateYearMonths = () => {
    const year = currentDate.getFullYear();
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(year, i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const hasEvents = savedEvents.some(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === i && eventDate.getFullYear() === year;
      });
      
      // Get hijri months that overlap with this gregorian month
      const hijriMonths = getHijriMonthsForGregorianMonth(year, i);
      const hijriMonthsText = hijriMonths.join(' / ');
      
      months.push({ 
        month: i, 
        name: monthName, 
        hasEvents,
        hijriMonths: hijriMonthsText
      });
    }
    
    return months;
  };
  
  // Generate hours for the day view
  const generateDayHours = () => {
    const hours = [];
    const startHour = 0; // Start at 12 AM
    const endHour = 23; // End at 11 PM
    
    for (let i = startHour; i <= endHour; i++) {
      const hour = use24HourFormat ? i : (i % 12 || 12);
      const ampm = i < 12 ? 'AM' : 'PM';
      const label = use24HourFormat ? `${i.toString().padStart(2, '0')}:00` : `${hour}:00 ${ampm}`;
      
      // Check if there are events during this hour
      const eventsThisHour = eventsForSelectedDate.filter(event => {
        const eventTime = event.time;
        const eventHour = parseInt(eventTime.split(':')[0]);
        return eventHour === i;
      });
      
      hours.push({ 
        hour: i, 
        label,
        events: eventsThisHour
      });
    }
    
    return hours;
  };
  
  // Handle event press
  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };
  
  // Handle event details close
  const handleCloseEventDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };
  
  // Handle view event details
  const handleViewEventDetails = () => {
    if (selectedEvent) {
      setShowEventDetails(false);
      router.push(`/event/${selectedEvent.id}`);
    }
  };
  
  // Handle day cell click with double-click detection
  const handleDayCellClick = useCallback((date: Date) => {
    const now = new Date().getTime();
    const DOUBLE_CLICK_DELAY = 300; // ms
    
    if (now - lastClickTime < DOUBLE_CLICK_DELAY) {
      // Double click detected
      setSelectedDate(date);
      setViewMode('day');
    } else {
      // Single click
      setSelectedDate(date);
    }
    
    setLastClickTime(now);
  }, [lastClickTime]);
  
  // Render month view
  const renderMonthView = () => {
    const days = generateMonthDays();
    
    return (
      <View style={styles.monthContainer}>
        {/* Weekday headers */}
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
        
        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {days.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                item.day === 0 && styles.emptyCell,
                item.date && 
                  isSameDay(selectedDate, item.date) && 
                  styles.selectedCell
              ]}
              onPress={() => {
                if (item.day !== 0 && item.date) {
                  handleDayCellClick(item.date);
                }
              }}
              disabled={item.day === 0}
            >
              {item.day !== 0 && (
                <>
                  <View style={styles.dateContainer}>
                    <Text style={[
                      styles.dayText,
                      item.date && 
                        isSameDay(selectedDate, item.date) && 
                        styles.selectedDayText,
                      isDarkMode && styles.dayTextDark
                    ]}>
                      {item.day}
                    </Text>
                    <Text style={[
                      styles.hijriDayText,
                      item.isNewHijriMonth && styles.newHijriMonthText
                    ]}>
                      {item.hijriDay}
                    </Text>
                  </View>
                  
                  <View style={styles.eventIndicators}>
                    {item.hasEvents && (
                      <View style={[styles.eventDot, { backgroundColor: Colors.primary }]} />
                    )}
                    {item.hasIslamicEvents && (
                      <View style={[styles.eventDot, { backgroundColor: '#E91E63' }]} />
                    )}
                  </View>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Events for selected date in month view */}
        <View style={styles.monthViewEventsContainer}>
          <Text style={[
            styles.monthViewEventsTitle,
            isDarkMode && styles.monthViewEventsTitleDark
          ]}>
            Events for {selectedDate.toLocaleDateString()}
          </Text>
          
          {/* Islamic Events Section */}
          {islamicEventsForSelectedDate.length > 0 && (
            <View style={styles.islamicEventsSection}>
              <Text style={[
                styles.islamicEventsSectionTitle,
                isDarkMode && styles.islamicEventsSectionTitleDark
              ]}>
                Islamic Events:
              </Text>
              {islamicEventsForSelectedDate.map((event, index) => (
                <Text 
                  key={`islamic-${index}`}
                  style={[
                    styles.islamicEventText,
                    isDarkMode && styles.islamicEventTextDark
                  ]}
                >
                  • {event.name}
                </Text>
              ))}
            </View>
          )}
          
          {/* User Events Section */}
          <Text style={[
            styles.userEventsSectionTitle,
            isDarkMode && styles.userEventsSectionTitleDark
          ]}>
            Your Events:
          </Text>
          
          {eventsForSelectedDate.length > 0 ? (
            eventsForSelectedDate.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.monthViewEventItem,
                  isDarkMode && styles.monthViewEventItemDark
                ]}
                onPress={() => handleEventPress(event)}
              >
                <View style={styles.eventTimeContainer}>
                  <Clock size={16} color={Colors.primary} />
                  <Text style={styles.eventTime}>
                    {formatTime(event.time, use24HourFormat)}
                  </Text>
                </View>
                
                <View style={styles.eventContent}>
                  <Text style={[
                    styles.eventTitle,
                    isDarkMode && styles.eventTitleDark
                  ]}>
                    {event.title}
                  </Text>
                  
                  <View style={styles.eventLocationContainer}>
                    <MapPin size={14} color={isDarkMode ? '#AAAAAA' : Colors.textSecondary} />
                    <Text style={[
                      styles.eventLocation,
                      isDarkMode && styles.eventLocationDark
                    ]}>
                      {event.mosque_name}
                    </Text>
                  </View>
                </View>
                
                <ChevronRight size={16} color={isDarkMode ? Colors.white : Colors.textSecondary} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[
              styles.noEventsText,
              isDarkMode && styles.noEventsTextDark
            ]}>
              No events scheduled for this day
            </Text>
          )}
        </View>
      </View>
    );
  };
  
  // Render year view
  const renderYearView = () => {
    const months = generateYearMonths();
    
    return (
      <View style={styles.yearContainer}>
        {months.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.monthCell,
              selectedDate.getMonth() === item.month && 
                selectedDate.getFullYear() === currentDate.getFullYear() && 
                styles.selectedMonthCell
            ]}
            onPress={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(item.month);
              setCurrentDate(newDate);
              setSelectedDate(newDate);
              setViewMode('month');
            }}
          >
            <Text style={[
              styles.monthCellText,
              selectedDate.getMonth() === item.month && 
                selectedDate.getFullYear() === currentDate.getFullYear() && 
                styles.selectedMonthCellText,
              isDarkMode && styles.monthCellTextDark
            ]}>
              {item.name}
            </Text>
            <Text style={styles.hijriMonthsText}>
              {item.hijriMonths}
            </Text>
            {item.hasEvents && (
              <View style={styles.monthEventDot} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Render day view
  const renderDayView = () => {
    const hours = generateDayHours();
    
    return (
      <ScrollView style={styles.dayContainer}>
        <Text style={[
          styles.dayViewDate,
          isDarkMode && styles.dayViewDateDark
        ]}>
          {selectedDate.toLocaleDateString('default', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        <Text style={[
          styles.hijriDateText,
          isDarkMode && styles.hijriDateTextDark
        ]}>
          {hijriMonthNames[selectedHijriDate.month - 1]} {selectedHijriDate.day}, {selectedHijriDate.year} Hijri
        </Text>
        
        {islamicEventsForSelectedDate.length > 0 && (
          <View style={styles.islamicEventsContainer}>
            <Text style={[
              styles.islamicEventsTitle,
              isDarkMode && styles.islamicEventsTitleDark
            ]}>
              Islamic Events:
            </Text>
            {islamicEventsForSelectedDate.map((event, index) => (
              <Text 
                key={index}
                style={[
                  styles.islamicEventText,
                  isDarkMode && styles.islamicEventTextDark
                ]}
              >
                • {event.name}
              </Text>
            ))}
          </View>
        )}
        
        <View style={styles.eventsContainer}>
          <Text style={[
            styles.eventsTitle,
            isDarkMode && styles.eventsTitleDark
          ]}>
            Your Events:
          </Text>
          
          {eventsForSelectedDate.length > 0 ? (
            eventsForSelectedDate.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventItem,
                  isDarkMode && styles.eventItemDark
                ]}
                onPress={() => handleEventPress(event)}
              >
                <View style={styles.eventTimeContainer}>
                  <Clock size={16} color={Colors.primary} />
                  <Text style={styles.eventTime}>
                    {formatTime(event.time, use24HourFormat)}
                  </Text>
                </View>
                
                <View style={styles.eventContent}>
                  <Text style={[
                    styles.eventTitle,
                    isDarkMode && styles.eventTitleDark
                  ]}>
                    {event.title}
                  </Text>
                  
                  <View style={styles.eventLocationContainer}>
                    <MapPin size={14} color={isDarkMode ? '#AAAAAA' : Colors.textSecondary} />
                    <Text style={[
                      styles.eventLocation,
                      isDarkMode && styles.eventLocationDark
                    ]}>
                      {event.mosque_name}
                    </Text>
                  </View>
                </View>
                
                <ChevronRight size={16} color={isDarkMode ? Colors.white : Colors.textSecondary} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[
              styles.noEventsText,
              isDarkMode && styles.noEventsTextDark
            ]}>
              No events scheduled for this day
            </Text>
          )}
        </View>
        
        <View style={styles.timelineContainer}>
          {hours.map((hour, index) => (
            <View key={index} style={styles.timelineHour}>
              <Text style={[
                styles.timelineHourText,
                isDarkMode && styles.timelineHourTextDark
              ]}>
                {hour.label}
              </Text>
              <View style={[
                styles.timelineLine,
                isDarkMode && styles.timelineLineDark
              ]}>
                {hour.events.length > 0 && (
                  <View style={styles.timelineEvent}>
                    {hour.events.map(event => (
                      <TouchableOpacity
                        key={event.id}
                        style={styles.timelineEventBlock}
                        onPress={() => handleEventPress(event)}
                      >
                        <Text style={styles.timelineEventText} numberOfLines={1}>
                          {event.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };
  
  return (
    <View style={[
      styles.container,
      isDarkMode && styles.containerDark
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={isDarkMode ? Colors.white : Colors.text} />
        </TouchableOpacity>
        
        <Text style={[
          styles.headerTitle,
          isDarkMode && styles.headerTitleDark
        ]}>
          Calendar
        </Text>
        
        <View style={styles.placeholder} />
      </View>
      
      {/* Calendar Controls */}
      <View style={styles.controls}>
        <View style={styles.navigationControls}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={goToPrevious}
          >
            <ChevronLeft size={24} color={isDarkMode ? Colors.white : Colors.text} />
          </TouchableOpacity>
          
          <Text style={[
            styles.currentPeriod,
            isDarkMode && styles.currentPeriodDark
          ]}>
            {formatDateHeader()}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={goToNext}
          >
            <ChevronRight size={24} color={isDarkMode ? Colors.white : Colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.viewControls}>
          <TouchableOpacity
            style={[
              styles.viewButton,
              viewMode === 'day' && styles.activeViewButton
            ]}
            onPress={() => setViewMode('day')}
          >
            <Text style={[
              styles.viewButtonText,
              viewMode === 'day' && styles.activeViewButtonText
            ]}>
              Day
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewButton,
              viewMode === 'month' && styles.activeViewButton
            ]}
            onPress={() => setViewMode('month')}
          >
            <Text style={[
              styles.viewButtonText,
              viewMode === 'month' && styles.activeViewButtonText
            ]}>
              Month
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewButton,
              viewMode === 'year' && styles.activeViewButton
            ]}
            onPress={() => setViewMode('year')}
          >
            <Text style={[
              styles.viewButtonText,
              viewMode === 'year' && styles.activeViewButtonText
            ]}>
              Year
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Calendar Content */}
      <View style={styles.calendarContent}>
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'year' && renderYearView()}
        {viewMode === 'day' && renderDayView()}
      </View>
      
      {/* Event Details Modal */}
      <Modal
        visible={showEventDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseEventDetails}
      >
        <View style={styles.eventModalOverlay}>
          <View style={[
            styles.eventModalContent,
            isDarkMode && styles.eventModalContentDark
          ]}>
            <View style={styles.eventModalHeader}>
              <Text style={[
                styles.eventModalTitle,
                isDarkMode && styles.eventModalTitleDark
              ]}>
                Event Details
              </Text>
              <TouchableOpacity onPress={handleCloseEventDetails}>
                <X size={24} color={isDarkMode ? Colors.white : Colors.text} />
              </TouchableOpacity>
            </View>
            
            {selectedEvent && (
              <View style={styles.eventModalBody}>
                <Text style={[
                  styles.eventModalEventTitle,
                  isDarkMode && styles.eventModalEventTitleDark
                ]}>
                  {selectedEvent.title}
                </Text>
                
                <View style={styles.eventModalDetail}>
                  <CalendarIcon size={18} color={Colors.primary} />
                  <Text style={[
                    styles.eventModalDetailText,
                    isDarkMode && styles.eventModalDetailTextDark
                  ]}>
                    {selectedEvent.date} • {formatTime(selectedEvent.time, use24HourFormat)}
                  </Text>
                </View>
                
                <View style={styles.eventModalDetail}>
                  <MapPin size={18} color={Colors.primary} />
                  <Text style={[
                    styles.eventModalDetailText,
                    isDarkMode && styles.eventModalDetailTextDark
                  ]}>
                    {selectedEvent.mosque_name}
                  </Text>
                </View>
                
                <Text style={[
                  styles.eventModalDescription,
                  isDarkMode && styles.eventModalDescriptionDark
                ]}>
                  {selectedEvent.description}
                </Text>
                
                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={handleViewEventDetails}
                >
                  <Text style={styles.viewDetailsButtonText}>
                    View Full Details
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  headerTitleDark: {
    color: Colors.white,
  },
  placeholder: {
    width: 40,
  },
  controls: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  currentPeriod: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  currentPeriodDark: {
    color: Colors.white,
  },
  viewControls: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeViewButton: {
    backgroundColor: Colors.primary,
  },
  viewButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  activeViewButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  calendarContent: {
    flex: 1,
  },
  monthContainer: {
    flex: 1,
  },
  weekdayHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  weekdayTextDark: {
    color: '#AAAAAA',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  selectedCell: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  dayTextDark: {
    color: Colors.white,
  },
  hijriDayText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  newHijriMonthText: {
    color: '#E91E63',
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: Colors.white,
    fontWeight: '600',
  },
  eventIndicators: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 2,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  yearContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  monthCell: {
    width: '25%',
    aspectRatio: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedMonthCell: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
  },
  monthCellText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  monthCellTextDark: {
    color: Colors.white,
  },
  hijriMonthsText: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  selectedMonthCellText: {
    color: Colors.white,
    fontWeight: '600',
  },
  monthEventDot: {
    position: 'absolute',
    bottom: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  dayContainer: {
    flex: 1,
    padding: 16,
  },
  dayViewDate: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  dayViewDateDark: {
    color: Colors.white,
  },
  hijriDateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  hijriDateTextDark: {
    color: '#AAAAAA',
  },
  islamicEventsContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FCE4EC',
    borderRadius: 8,
  },
  islamicEventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E91E63',
    marginBottom: 8,
  },
  islamicEventsTitleDark: {
    color: '#F48FB1',
  },
  islamicEventText: {
    fontSize: 14,
    color: '#C2185B',
    marginBottom: 4,
  },
  islamicEventTextDark: {
    color: '#F48FB1',
  },
  eventsContainer: {
    marginBottom: 24,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  eventsTitleDark: {
    color: Colors.white,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 8,
    ...globalStyles.shadow,
  },
  eventItemDark: {
    backgroundColor: '#1E1E1E',
  },
  eventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  eventTime: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  eventContent: {
    flex: 1,
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
  eventLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  eventLocationDark: {
    color: '#AAAAAA',
  },
  noEventsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  noEventsTextDark: {
    color: '#AAAAAA',
  },
  timelineContainer: {
    marginTop: 24,
  },
  timelineHour: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineHourText: {
    width: 80,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  timelineHourTextDark: {
    color: '#AAAAAA',
  },
  timelineLine: {
    flex: 1,
    height: 30,
    backgroundColor: Colors.border,
    position: 'relative',
  },
  timelineLineDark: {
    backgroundColor: '#333333',
  },
  timelineEvent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  timelineEventBlock: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    padding: 4,
    margin: 2,
    flex: 1,
  },
  timelineEventText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  eventModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: '85%',
    padding: 20,
    ...globalStyles.shadow,
  },
  eventModalContentDark: {
    backgroundColor: '#1E1E1E',
  },
  eventModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  eventModalTitleDark: {
    color: Colors.white,
  },
  eventModalBody: {
    
  },
  eventModalEventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  eventModalEventTitleDark: {
    color: Colors.white,
  },
  eventModalDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventModalDetailText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
  },
  eventModalDetailTextDark: {
    color: Colors.white,
  },
  eventModalDescription: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  eventModalDescriptionDark: {
    color: '#DDDDDD',
  },
  viewDetailsButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  monthViewEventsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
  },
  monthViewEventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  monthViewEventsTitleDark: {
    color: Colors.white,
  },
  monthViewEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 8,
    ...globalStyles.shadow,
  },
  monthViewEventItemDark: {
    backgroundColor: '#1E1E1E',
  },
  islamicEventsSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FCE4EC',
    borderRadius: 8,
  },
  islamicEventsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E91E63',
    marginBottom: 8,
  },
  islamicEventsSectionTitleDark: {
    color: '#F48FB1',
  },
  userEventsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  userEventsSectionTitleDark: {
    color: Colors.white,
  },
});