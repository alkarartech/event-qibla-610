export interface Event {
  id: string;
  title: string;
  description: string;
  mosque_id: string;
  mosque_name: string;
  date: string;
  time: string;
  address: string;
  latitude: number;
  longitude: number;
  category: 'lecture' | 'workshop' | 'community' | 'charity' | 'other';
  image?: string;
  organizer?: string;
  contact?: string;
}

export const events: Event[] = [
  {
    id: '1',
    title: 'Friday Night Lecture Series',
    description: 'Join us for our weekly Friday night lecture series focusing on the teachings of the Quran and Sunnah. This week\'s topic: "Building a Strong Muslim Community".',
    mosque_id: '1',
    mosque_name: 'Masjid Al-Noor',
    date: '2025-06-27',
    time: '8:00 PM - 9:30 PM',
    address: '123 Main Street, City Center',
    latitude: 37.7749,
    longitude: -122.4194,
    category: 'lecture',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1000',
    organizer: 'Imam Abdullah',
    contact: 'imam@masjidalnoor.org',
  },
  {
    id: '2',
    title: 'Islamic Calligraphy Workshop',
    description: 'Learn the beautiful art of Islamic calligraphy in this hands-on workshop. All materials will be provided. Suitable for beginners and intermediate levels.',
    mosque_id: '2',
    mosque_name: 'Islamic Center',
    date: '2025-06-29',
    time: '2:00 PM - 4:00 PM',
    address: '456 Oak Avenue, Downtown',
    latitude: 37.7833,
    longitude: -122.4167,
    category: 'workshop',
    image: 'https://images.unsplash.com/photo-1569563406093-ab0637690781?q=80&w=1000',
    organizer: 'Sister Aisha',
    contact: 'workshops@islamiccenter.org',
  },
  {
    id: '3',
    title: 'Community Iftar Dinner',
    description: 'Join us for a community iftar dinner during Ramadan. Everyone is welcome. Please RSVP to help us prepare accordingly.',
    mosque_id: '3',
    mosque_name: 'Masjid Al-Rahman',
    date: '2025-07-05',
    time: '7:30 PM - 9:30 PM',
    address: '789 Pine Street, Westside',
    latitude: 37.7694,
    longitude: -122.4862,
    category: 'community',
    image: 'https://images.unsplash.com/photo-1532635241-17e820acc59f?q=80&w=1000',
    organizer: 'Community Affairs Committee',
    contact: 'events@masjidalrahman.org',
  },
  {
    id: '4',
    title: 'Charity Food Drive',
    description: 'Help us collect non-perishable food items for local families in need. Drop off your donations at the mosque during the specified times.',
    mosque_id: '4',
    mosque_name: 'Masjid Al-Taqwa',
    date: '2025-07-12',
    time: '10:00 AM - 4:00 PM',
    address: '101 Cedar Road, Eastside',
    latitude: 37.8044,
    longitude: -122.2711,
    category: 'charity',
    image: 'https://images.unsplash.com/photo-1593113598332-cd59a93f9f81?q=80&w=1000',
    organizer: 'Charity Committee',
    contact: 'charity@masjidaltaqwa.org',
  },
  {
    id: '5',
    title: 'Youth Quran Competition',
    description: 'Annual Quran recitation competition for youth ages 8-18. Prizes will be awarded in different age categories.',
    mosque_id: '5',
    mosque_name: 'Masjid Al-Huda',
    date: '2025-07-19',
    time: '11:00 AM - 3:00 PM',
    address: '202 Maple Boulevard, Northside',
    latitude: 37.8045,
    longitude: -122.4195,
    category: 'other',
    image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1000',
    organizer: 'Education Committee',
    contact: 'education@masjidalhuda.org',
  },
  {
    id: '6',
    title: 'Islamic Finance Seminar',
    description: 'Learn about Islamic finance principles and halal investment options in this informative seminar led by financial experts.',
    mosque_id: '1',
    mosque_name: 'Masjid Al-Noor',
    date: '2025-07-26',
    time: '6:00 PM - 8:00 PM',
    address: '123 Main Street, City Center',
    latitude: 37.7749,
    longitude: -122.4194,
    category: 'lecture',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1000',
    organizer: 'Brother Yusuf',
    contact: 'seminars@masjidalnoor.org',
  },
];