// Add days to a date
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Format date to string
export const formatDate = (date: Date, format: string = 'yyyy-MM-dd'): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return format
    .replace('yyyy', year.toString())
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('dd', day.toString().padStart(2, '0'));
};

// Get the first day of the month
export const getFirstDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

// Get the last day of the month
export const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0);
};

// Get days in month
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

// Check if two dates are the same day
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Format time based on 12/24 hour preference
export const formatTime = (timeString: string, use24HourFormat: boolean): string => {
  if (use24HourFormat) {
    // Convert to 24-hour format if it's in 12-hour format
    if (timeString.includes('AM') || timeString.includes('PM')) {
      const [timePart, period] = timeString.split(' ');
      const [hours, minutes] = timePart.split(':').map(Number);
      
      let hour24 = hours;
      if (period === 'PM' && hours < 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;
      
      return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    return timeString;
  } else {
    // Convert to 12-hour format if it's in 24-hour format
    if (!timeString.includes('AM') && !timeString.includes('PM')) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      
      return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    return timeString;
  }
};