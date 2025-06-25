// Prayer time calculation utility based on PrayTimes.js
const DMath = {
  dtr: (d: number) => (d * Math.PI) / 180.0,
  rtd: (r: number) => (r * 180.0) / Math.PI,
  sin: (d: number) => Math.sin(DMath.dtr(d)),
  cos: (d: number) => Math.cos(DMath.dtr(d)),
  tan: (d: number) => Math.tan(DMath.dtr(d)),
  arcsin: (d: number) => DMath.rtd(Math.asin(d)),
  arccos: (d: number) => DMath.rtd(Math.acos(d)),
  arctan: (d: number) => DMath.rtd(Math.atan(d)),
  arccot: (x: number) => DMath.rtd(Math.atan(1 / x)),
  arctan2: (y: number, x: number) => DMath.rtd(Math.atan2(y, x)),
  fixAngle: (a: number) => DMath.fix(a, 360),
  fixHour: (a: number) => DMath.fix(a, 24),
  fix: (a: number, b: number) => {
    a = a - b * Math.floor(a / b);
    return a < 0 ? a + b : a;
  },
};

interface PrayerTimeParams {
  fajr?: number | string;
  isha?: number | string;
  maghrib?: number | string;
  midnight?: string;
}

interface MethodParams {
  name: string;
  params: PrayerTimeParams;
}

interface Methods {
  [key: string]: MethodParams;
}

interface Settings {
  imsak: string;
  dhuhr: string;
  asr: string;
  highLats: string;
  [key: string]: any;
}

interface Offsets {
  [key: string]: number;
}

interface Times {
  [key: string]: number | string;
}

export function PrayTimes(method?: string) {
  const timeNames = {
    imsak: 'Imsak',
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    sunset: 'Sunset',
    maghrib: 'Maghrib',
    isha: 'Isha',
    midnight: 'Midnight',
  };

  const methods: Methods = {
    MWL: { name: 'Muslim World League', params: { fajr: 18, isha: 17 } },
    ISNA: { name: 'Islamic Society of North America (ISNA)', params: { fajr: 15, isha: 15 } },
    Egypt: { name: 'Egyptian General Authority of Survey', params: { fajr: 19.5, isha: 17.5 } },
    Makkah: { name: 'Umm Al-Qura University, Makkah', params: { fajr: 18.5, isha: '90 min' } },
    Karachi: { name: 'University of Islamic Sciences, Karachi', params: { fajr: 18, isha: 18 } },
    Tehran: { name: 'Institute of Geophysics, University of Tehran', params: { fajr: 17.7, isha: 14, maghrib: 4.5, midnight: 'Jafari' } },
    Jafari: { name: 'Shia Ithna-Ashari, Leva Institute, Qum', params: { fajr: 16, isha: 14, maghrib: 4, midnight: 'Jafari' } },
  };

  const defaultParams = { maghrib: '0 min', midnight: 'Standard' };
  let calcMethod = method || 'MWL';
  const setting: Settings = { imsak: '10 min', dhuhr: '0 min', asr: 'Standard', highLats: 'NightMiddle' };
  const timeFormat = '24h';
  const timeSuffixes = ['am', 'pm'];
  const invalidTime = '-----';
  const numIterations = 1;
  const offset: Offsets = {};
  let lat: number, lng: number, elv: number, timeZone: number, jDate: number;

  for (let i in methods) {
    const params = methods[i].params;
    for (let j in defaultParams) {
      if (typeof params[j as keyof PrayerTimeParams] === 'undefined') {
        params[j as keyof PrayerTimeParams] = defaultParams[j as keyof typeof defaultParams];
      }
    }
  }

  const params = methods[calcMethod].params;
  for (let id in params) setting[id] = params[id];
  for (let i in timeNames) offset[i] = 0;

  return {
    setMethod: function (newMethod: string) {
      if (methods[newMethod]) {
        this.adjust(methods[newMethod].params);
        calcMethod = newMethod;
      }
    },
    adjust: function (params: PrayerTimeParams) {
      for (let id in params) setting[id] = params[id];
    },
    tune: function (timeOffsets: Offsets) {
      for (let i in timeOffsets) offset[i] = timeOffsets[i];
    },
    getTimes: function (date: number[], coords: number[], timezone?: number, dst?: boolean | string, format?: string) {
      lat = 1 * coords[0];
      lng = 1 * coords[1];
      elv = coords[2] ? 1 * coords[2] : 0;
      timeZone = timezone || this.getTimeZone(date);
      if (typeof dst === 'undefined' || dst === 'auto') dst = this.getDst(date);
      timeZone = 1 * timeZone + (1 * (dst ? 1 : 0));
      jDate = this.julian(date[0], date[1], date[2]) - lng / (15 * 24);
      return this.computeTimes();
    },
    getFormattedTime: function (time: number, format?: string, suffixes?: string[]) {
      if (isNaN(time)) return invalidTime;
      if (format === 'Float') return time;
      suffixes = suffixes || timeSuffixes;
      time = DMath.fixHour(time + 0.5 / 60);
      const hours = Math.floor(time);
      const minutes = Math.floor((time - hours) * 60);
      const suffix = format === '12h' ? suffixes[hours < 12 ? 0 : 1] : '';
      const hour = format === '24h' ? this.twoDigitsFormat(hours) : ((hours + 12 - 1) % 12 + 1);
      return `${hour}:${this.twoDigitsFormat(minutes)}${suffix ? ' ' + suffix : ''}`;
    },
    midDay: function (time: number) {
      const eqt = this.sunPosition(jDate + time).equation;
      return DMath.fixHour(12 - eqt);
    },
    sunAngleTime: function (angle: number, time: number, direction?: string) {
      const decl = this.sunPosition(jDate + time).declination;
      const noon = this.midDay(time);
      const t = (1 / 15) * DMath.arccos((-DMath.sin(angle) - DMath.sin(decl) * DMath.sin(lat)) / (DMath.cos(decl) * DMath.cos(lat)));
      return noon + (direction === 'ccw' ? -t : t);
    },
    asrTime: function (factor: number, time: number) {
      const decl = this.sunPosition(jDate + time).declination;
      const angle = -DMath.arccot(factor + DMath.tan(Math.abs(lat - decl)));
      return this.sunAngleTime(angle, time);
    },
    sunPosition: function (jd: number) {
      const D = jd - 2451545.0;
      const g = DMath.fixAngle(357.529 + 0.98560028 * D);
      const q = DMath.fixAngle(280.459 + 0.98564736 * D);
      const L = DMath.fixAngle(q + 1.915 * DMath.sin(g) + 0.020 * DMath.sin(2 * g));
      const R = 1.00014 - 0.01671 * DMath.cos(g) - 0.00014 * DMath.cos(2 * g);
      const e = 23.439 - 0.00000036 * D;
      const RA = DMath.arctan2(DMath.cos(e) * DMath.sin(L), DMath.cos(L)) / 15;
      const eqt = q / 15 - DMath.fixHour(RA);
      const decl = DMath.arcsin(DMath.sin(e) * DMath.sin(L));
      return { declination: decl, equation: eqt };
    },
    julian: function (year: number, month: number, day: number) {
      if (month <= 2) {
        year -= 1;
        month += 12;
      }
      const A = Math.floor(year / 100);
      const B = 2 - A + Math.floor(A / 4);
      return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
    },
    computePrayerTimes: function (times: Times) {
      times = this.dayPortion(times);
      const params = setting;
      const imsak = this.sunAngleTime(this.eval(params.imsak), times.imsak as number, 'ccw');
      const fajr = this.sunAngleTime(this.eval(params.fajr), times.fajr as number, 'ccw');
      const sunrise = this.sunAngleTime(this.riseSetAngle(), times.sunrise as number, 'ccw');
      const dhuhr = this.midDay(times.dhuhr as number);
      const asr = this.asrTime(this.asrFactor(params.asr), times.asr as number);
      const sunset = this.sunAngleTime(this.riseSetAngle(), times.sunset as number);
      const maghrib = this.sunAngleTime(this.eval(params.maghrib), times.maghrib as number);
      const isha = this.sunAngleTime(this.eval(params.isha), times.isha as number);
      return { imsak, fajr, sunrise, dhuhr, asr, sunset, maghrib, isha };
    },
    computeTimes: function () {
      let times: Times = { imsak: 5, fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, sunset: 18, maghrib: 18, isha: 18 };
      for (let i = 1; i <= numIterations; i++) times = this.computePrayerTimes(times);
      times = this.adjustTimes(times);
      times.midnight = setting.midnight === 'Jafari' 
        ? (times.sunset as number) + this.timeDiff(times.sunset as number, times.fajr as number) / 2 
        : (times.sunset as number) + this.timeDiff(times.sunset as number, times.sunrise as number) / 2;
      times = this.tuneTimes(times);
      return this.modifyFormats(times);
    },
    adjustTimes: function (times: Times) {
      for (let i in times) times[i] = (times[i] as number) + timeZone - lng / 15;
      if (setting.highLats !== 'None') times = this.adjustHighLats(times);
      if (this.isMin(setting.imsak)) times.imsak = (times.fajr as number) - this.eval(setting.imsak) / 60;
      if (this.isMin(setting.maghrib)) times.maghrib = (times.sunset as number) + this.eval(setting.maghrib) / 60;
      if (this.isMin(setting.isha)) times.isha = (times.maghrib as number) + this.eval(setting.isha) / 60;
      times.dhuhr = (times.dhuhr as number) + this.eval(setting.dhuhr) / 60;
      return times;
    },
    asrFactor: function (asrParam: string) {
      const factors: { [key: string]: number } = { Standard: 1, Hanafi: 2 };
      const factor = factors[asrParam];
      return factor || this.eval(asrParam);
    },
    riseSetAngle: function () {
      const angle = 0.0347 * Math.sqrt(elv);
      return 0.833 + angle;
    },
    tuneTimes: function (times: Times) {
      for (let i in times) times[i] = (times[i] as number) + offset[i] / 60;
      return times;
    },
    modifyFormats: function (times: Times) {
      for (let i in times) times[i] = this.getFormattedTime(times[i] as number, timeFormat);
      return times;
    },
    adjustHighLats: function (times: Times) {
      const params = setting;
      const nightTime = this.timeDiff(times.sunset as number, times.sunrise as number);
      times.imsak = this.adjustHLTime(times.imsak as number, times.sunrise as number, this.eval(params.imsak), nightTime, 'ccw');
      times.fajr = this.adjustHLTime(times.fajr as number, times.sunrise as number, this.eval(params.fajr), nightTime, 'ccw');
      times.isha = this.adjustHLTime(times.isha as number, times.sunset as number, this.eval(params.isha), nightTime);
      times.maghrib = this.adjustHLTime(times.maghrib as number, times.sunset as number, this.eval(params.maghrib), nightTime);
      return times;
    },
    adjustHLTime: function (time: number, base: number, angle: number, night: number, direction?: string) {
      const portion = this.nightPortion(angle, night);
      const timeDiff = direction === 'ccw' ? this.timeDiff(time, base) : this.timeDiff(base, time);
      if (isNaN(time) || timeDiff > portion) time = base + (direction === 'ccw' ? -portion : portion);
      return time;
    },
    nightPortion: function (angle: number, night: number) {
      let portion = 1 / 2;
      if (setting.highLats === 'AngleBased') portion = (1 / 60) * angle;
      if (setting.highLats === 'OneSeventh') portion = 1 / 7;
      return portion * night;
    },
    dayPortion: function (times: Times) {
      for (let i in times) times[i] = (times[i] as number) / 24;
      return times;
    },
    getTimeZone: function (date: number[]) {
      const year = date[0];
      const t1 = this.gmtOffset([year, 0, 1]);
      const t2 = this.gmtOffset([year, 6, 1]);
      return Math.min(t1, t2);
    },
    getDst: function (date: number[]) {
      return 1 * (this.gmtOffset(date) !== this.getTimeZone(date) ? 1 : 0);
    },
    gmtOffset: function (date: number[]) {
      const localDate = new Date(date[0], date[1] - 1, date[2], 12, 0, 0, 0);
      const GMTString = localDate.toGMTString();
      const GMTDate = new Date(GMTString.substring(0, GMTString.lastIndexOf(' ') - 1));
      return (localDate.getTime() - GMTDate.getTime()) / (1000 * 60 * 60);
    },
    eval: function (str: string | number) {
      return 1 * (str + '').split(/[^0-9.+-]/)[0];
    },
    isMin: function (arg: string | number) {
      return (arg + '').indexOf('min') !== -1;
    },
    timeDiff: function (time1: number, time2: number) {
      return DMath.fixHour(time2 - time1);
    },
    twoDigitsFormat: function (num: number) {
      return num < 10 ? '0' + num : num;
    },
  };
}

// Helper function to get prayer times based on mosque denomination
export function getPrayerTimes(latitude: number, longitude: number, denomination: string = 'Sunni') {
  const date = new Date();
  const coords = [latitude, longitude, 0];
  const dateArray = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  
  // Select calculation method based on denomination
  let method = 'MWL'; // Default for Sunni
  
  if (denomination === 'Shia') {
    method = 'Jafari';
  } else if (denomination === 'Sunni') {
    // Different Sunni schools might use different methods
    // For simplicity, we're using MWL for all Sunni mosques
    method = 'MWL';
  }
  
  const prayTimes = PrayTimes(method);
  return prayTimes.getTimes(dateArray, coords, undefined, undefined, '12h');
}