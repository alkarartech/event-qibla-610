export interface Mosque {
  id: string;
  name: string;
  address: string;
  distance?: number; // in kilometers
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  prayer_times?: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    jummah: string;
  };
  facilities?: string[];
  image?: string;
  rating?: number;
}

export const mosques: Mosque[] = [
  {
    id: '1',
    name: 'Masjid Al-Noor',
    address: '123 Main Street, City Center',
    latitude: 37.7749,
    longitude: -122.4194,
    phone: '+1 (555) 123-4567',
    website: 'www.masjidalnoor.org',
    prayer_times: {
      fajr: '5:30 AM',
      dhuhr: '1:30 PM',
      asr: '4:45 PM',
      maghrib: '7:15 PM',
      isha: '8:45 PM',
      jummah: '1:15 PM',
    },
    facilities: ['Prayer Hall', 'Wudu Area', 'Library', 'Community Center'],
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1000',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Islamic Center',
    address: '456 Oak Avenue, Downtown',
    latitude: 37.7833,
    longitude: -122.4167,
    phone: '+1 (555) 987-6543',
    website: 'www.islamiccenter.org',
    prayer_times: {
      fajr: '5:15 AM',
      dhuhr: '1:15 PM',
      asr: '4:30 PM',
      maghrib: '7:00 PM',
      isha: '8:30 PM',
      jummah: '1:30 PM',
    },
    facilities: ['Prayer Hall', 'Wudu Area', 'Classroom', 'Parking'],
    image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1000',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Masjid Al-Rahman',
    address: '789 Pine Street, Westside',
    latitude: 37.7694,
    longitude: -122.4862,
    phone: '+1 (555) 456-7890',
    website: 'www.masjidalrahman.org',
    prayer_times: {
      fajr: '5:45 AM',
      dhuhr: '1:45 PM',
      asr: '5:00 PM',
      maghrib: '7:30 PM',
      isha: '9:00 PM',
      jummah: '1:45 PM',
    },
    facilities: ['Prayer Hall', 'Wudu Area', 'Bookstore', 'Children\'s Area'],
    image: 'https://images.unsplash.com/photo-1542324216541-c84c8ba6db04?q=80&w=1000',
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Masjid Al-Taqwa',
    address: '101 Cedar Road, Eastside',
    latitude: 37.8044,
    longitude: -122.2711,
    phone: '+1 (555) 789-0123',
    website: 'www.masjidaltaqwa.org',
    prayer_times: {
      fajr: '5:20 AM',
      dhuhr: '1:20 PM',
      asr: '4:40 PM',
      maghrib: '7:10 PM',
      isha: '8:40 PM',
      jummah: '1:30 PM',
    },
    facilities: ['Prayer Hall', 'Wudu Area', 'Conference Room'],
    image: 'https://images.unsplash.com/photo-1564769625688-8178d915b01b?q=80&w=1000',
    rating: 4.5,
  },
  {
    id: '5',
    name: 'Masjid Al-Huda',
    address: '202 Maple Boulevard, Northside',
    latitude: 37.8045,
    longitude: -122.4195,
    phone: '+1 (555) 234-5678',
    website: 'www.masjidalhuda.org',
    prayer_times: {
      fajr: '5:25 AM',
      dhuhr: '1:25 PM',
      asr: '4:50 PM',
      maghrib: '7:20 PM',
      isha: '8:50 PM',
      jummah: '1:15 PM',
    },
    facilities: ['Prayer Hall', 'Wudu Area', 'Islamic School', 'Gymnasium'],
    image: 'https://images.unsplash.com/photo-1581274050302-581149d3b4c1?q=80&w=1000',
    rating: 4.9,
  },
];