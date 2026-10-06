/**
 * Dedicated Data Registry: Indian States and Union Territories with Meteorological Reference Coordinates
 * 
 * Provides standardized geographic coordinates (Latitude, Longitude),
 * state codes, administrative capitals, zones, and alias matchers for all 28 states
 * and 8 union territories of the Republic of India.
 */

export interface StateCoordinateItem {
  id: string;
  name: string;
  code: string;
  capital: string;
  zone: 'North' | 'South' | 'East' | 'West' | 'Central' | 'North-East' | 'Union Territory';
  lat: number;
  lon: number;
  coordinates: [number, number]; // [Latitude, Longitude]
  aliases?: string[];
}

export const INDIA_STATE_COORDINATES: StateCoordinateItem[] = [
  // --- South Zone ---
  {
    id: 'tamil-nadu',
    name: 'Tamil Nadu',
    code: 'TN',
    capital: 'Chennai',
    zone: 'South',
    lat: 13.0827,
    lon: 80.2707,
    coordinates: [13.0827, 80.2707],
    aliases: ['Tamilnadu', 'Madras State']
  },
  {
    id: 'kerala',
    name: 'Kerala',
    code: 'KL',
    capital: 'Thiruvananthapuram',
    zone: 'South',
    lat: 8.5241,
    lon: 76.9366,
    coordinates: [8.5241, 76.9366],
    aliases: ['Trivandrum', 'Keralam']
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    code: 'KA',
    capital: 'Bengaluru',
    zone: 'South',
    lat: 12.9716,
    lon: 77.5946,
    coordinates: [12.9716, 77.5946],
    aliases: ['Bangalore', 'Mysore State']
  },
  {
    id: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    code: 'AP',
    capital: 'Amaravati',
    zone: 'South',
    lat: 16.5062,
    lon: 80.6480,
    coordinates: [16.5062, 80.6480],
    aliases: ['Andhra', 'AP']
  },
  {
    id: 'telangana',
    name: 'Telangana',
    code: 'TG',
    capital: 'Hyderabad',
    zone: 'South',
    lat: 17.3850,
    lon: 78.4867,
    coordinates: [17.3850, 78.4867],
    aliases: ['Telengana', 'TS']
  },

  // --- West Zone ---
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    code: 'MH',
    capital: 'Mumbai',
    zone: 'West',
    lat: 19.0760,
    lon: 72.8777,
    coordinates: [19.0760, 72.8777],
    aliases: ['Bombay State', 'Maha']
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    code: 'GJ',
    capital: 'Gandhinagar',
    zone: 'West',
    lat: 23.2156,
    lon: 72.6369,
    coordinates: [23.2156, 72.6369],
    aliases: ['Gujrat']
  },
  {
    id: 'goa',
    name: 'Goa',
    code: 'GA',
    capital: 'Panaji',
    zone: 'West',
    lat: 15.4909,
    lon: 73.8278,
    coordinates: [15.4909, 73.8278],
    aliases: ['Panjim']
  },

  // --- North Zone ---
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    code: 'RJ',
    capital: 'Jaipur',
    zone: 'North',
    lat: 26.9124,
    lon: 75.7873,
    coordinates: [26.9124, 75.7873],
    aliases: ['Rajputana']
  },
  {
    id: 'punjab',
    name: 'Punjab',
    code: 'PB',
    capital: 'Chandigarh',
    zone: 'North',
    lat: 30.7333,
    lon: 76.7794,
    coordinates: [30.7333, 76.7794],
    aliases: ['East Punjab']
  },
  {
    id: 'haryana',
    name: 'Haryana',
    code: 'HR',
    capital: 'Chandigarh',
    zone: 'North',
    lat: 29.0588,
    lon: 76.0856,
    coordinates: [29.0588, 76.0856],
    aliases: []
  },
  {
    id: 'himachal-pradesh',
    name: 'Himachal Pradesh',
    code: 'HP',
    capital: 'Shimla',
    zone: 'North',
    lat: 31.1048,
    lon: 77.1734,
    coordinates: [31.1048, 77.1734],
    aliases: ['Himachal']
  },
  {
    id: 'uttarakhand',
    name: 'Uttarakhand',
    code: 'UK',
    capital: 'Dehradun',
    zone: 'North',
    lat: 30.3165,
    lon: 78.0322,
    coordinates: [30.3165, 78.0322],
    aliases: ['Uttaranchal', 'UA']
  },
  {
    id: 'uttar-pradesh',
    name: 'Uttar Pradesh',
    code: 'UP',
    capital: 'Lucknow',
    zone: 'North',
    lat: 26.8467,
    lon: 80.9462,
    coordinates: [26.8467, 80.9462],
    aliases: ['United Provinces']
  },

  // --- Central Zone ---
  {
    id: 'madhya-pradesh',
    name: 'Madhya Pradesh',
    code: 'MP',
    capital: 'Bhopal',
    zone: 'Central',
    lat: 23.2599,
    lon: 77.4126,
    coordinates: [23.2599, 77.4126],
    aliases: ['Central Provinces', 'MP']
  },
  {
    id: 'chhattisgarh',
    name: 'Chhattisgarh',
    code: 'CG',
    capital: 'Raipur',
    zone: 'Central',
    lat: 21.2514,
    lon: 81.6296,
    coordinates: [21.2514, 81.6296],
    aliases: ['Chattisgarh']
  },

  // --- East Zone ---
  {
    id: 'bihar',
    name: 'Bihar',
    code: 'BR',
    capital: 'Patna',
    zone: 'East',
    lat: 25.5941,
    lon: 85.1376,
    coordinates: [25.5941, 85.1376],
    aliases: []
  },
  {
    id: 'jharkhand',
    name: 'Jharkhand',
    code: 'JH',
    capital: 'Ranchi',
    zone: 'East',
    lat: 23.3441,
    lon: 85.3096,
    coordinates: [23.3441, 85.3096],
    aliases: []
  },
  {
    id: 'west-bengal',
    name: 'West Bengal',
    code: 'WB',
    capital: 'Kolkata',
    zone: 'East',
    lat: 22.5726,
    lon: 88.3639,
    coordinates: [22.5726, 88.3639],
    aliases: ['Bengal', 'Paschim Banga']
  },
  {
    id: 'odisha',
    name: 'Odisha',
    code: 'OD',
    capital: 'Bhubaneswar',
    zone: 'East',
    lat: 20.2961,
    lon: 85.8245,
    coordinates: [20.2961, 85.8245],
    aliases: ['Orissa']
  },

  // --- North-East Zone ---
  {
    id: 'assam',
    name: 'Assam',
    code: 'AS',
    capital: 'Dispur',
    zone: 'North-East',
    lat: 26.1445,
    lon: 91.7362,
    coordinates: [26.1445, 91.7362],
    aliases: ['Asom', 'Guwahati']
  },
  {
    id: 'sikkim',
    name: 'Sikkim',
    code: 'SK',
    capital: 'Gangtok',
    zone: 'North-East',
    lat: 27.3314,
    lon: 88.6138,
    coordinates: [27.3314, 88.6138],
    aliases: []
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    code: 'ML',
    capital: 'Shillong',
    zone: 'North-East',
    lat: 25.5788,
    lon: 91.8933,
    coordinates: [25.5788, 91.8933],
    aliases: []
  },
  {
    id: 'tripura',
    name: 'Tripura',
    code: 'TR',
    capital: 'Agartala',
    zone: 'North-East',
    lat: 23.8315,
    lon: 91.2868,
    coordinates: [23.8315, 91.2868],
    aliases: []
  },
  {
    id: 'manipur',
    name: 'Manipur',
    code: 'MN',
    capital: 'Imphal',
    zone: 'North-East',
    lat: 24.8170,
    lon: 93.9368,
    coordinates: [24.8170, 93.9368],
    aliases: []
  },
  {
    id: 'mizoram',
    name: 'Mizoram',
    code: 'MZ',
    capital: 'Aizawl',
    zone: 'North-East',
    lat: 23.7271,
    lon: 92.7176,
    coordinates: [23.7271, 92.7176],
    aliases: []
  },
  {
    id: 'nagaland',
    name: 'Nagaland',
    code: 'NL',
    capital: 'Kohima',
    zone: 'North-East',
    lat: 25.6751,
    lon: 94.1086,
    coordinates: [25.6751, 94.1086],
    aliases: []
  },
  {
    id: 'arunachal-pradesh',
    name: 'Arunachal Pradesh',
    code: 'AR',
    capital: 'Itanagar',
    zone: 'North-East',
    lat: 27.0844,
    lon: 93.6053,
    coordinates: [27.0844, 93.6053],
    aliases: ['NEFA', 'Arunachal']
  },

  // --- Union Territories ---
  {
    id: 'delhi',
    name: 'Delhi',
    code: 'DL',
    capital: 'New Delhi',
    zone: 'Union Territory',
    lat: 28.6139,
    lon: 77.2090,
    coordinates: [28.6139, 77.2090],
    aliases: ['Delhi (NCT)', 'NCT of Delhi', 'National Capital Territory of Delhi', 'New Delhi']
  },
  {
    id: 'jammu-and-kashmir',
    name: 'Jammu & Kashmir',
    code: 'JK',
    capital: 'Srinagar',
    zone: 'Union Territory',
    lat: 34.0837,
    lon: 74.7973,
    coordinates: [34.0837, 74.7973],
    aliases: ['Jammu and Kashmir', 'J&K', 'Kashmir']
  },
  {
    id: 'ladakh',
    name: 'Ladakh',
    code: 'LA',
    capital: 'Leh',
    zone: 'Union Territory',
    lat: 34.1526,
    lon: 77.5771,
    coordinates: [34.1526, 77.5771],
    aliases: ['Leh Ladakh']
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    code: 'CH',
    capital: 'Chandigarh',
    zone: 'Union Territory',
    lat: 30.7333,
    lon: 76.7794,
    coordinates: [30.7333, 76.7794],
    aliases: []
  },
  {
    id: 'puducherry',
    name: 'Puducherry',
    code: 'PY',
    capital: 'Puducherry',
    zone: 'Union Territory',
    lat: 11.9416,
    lon: 79.8083,
    coordinates: [11.9416, 79.8083],
    aliases: ['Pondicherry']
  },
  {
    id: 'andaman-and-nicobar',
    name: 'Andaman & Nicobar',
    code: 'AN',
    capital: 'Port Blair',
    zone: 'Union Territory',
    lat: 11.6234,
    lon: 92.7265,
    coordinates: [11.6234, 92.7265],
    aliases: ['Andaman and Nicobar', 'Andaman and Nicobar Islands', 'Andaman & Nicobar Islands']
  },
  {
    id: 'lakshadweep',
    name: 'Lakshadweep',
    code: 'LD',
    capital: 'Kavaratti',
    zone: 'Union Territory',
    lat: 10.5667,
    lon: 72.6417,
    coordinates: [10.5667, 72.6417],
    aliases: ['Laccadive Islands']
  },
  {
    id: 'dadra-and-nagar-haveli-and-daman-and-diu',
    name: 'Dadra & Nagar Haveli and Daman & Diu',
    code: 'DH',
    capital: 'Daman',
    zone: 'Union Territory',
    lat: 20.4283,
    lon: 72.8397,
    coordinates: [20.4283, 72.8397],
    aliases: [
      'DNHDD',
      'Dadra and Nagar Haveli',
      'Daman and Diu',
      'Dadra & Nagar Haveli',
      'Daman & Diu'
    ]
  }
];

/**
 * Normalizes text string for reliable matching across variations
 */
export function normalizeStateQuery(input: string): string {
  return (input || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Finds a state coordinate entry by name, ID, code, or known aliases
 */
export function findStateCoordinates(query: string): StateCoordinateItem | undefined {
  if (!query) return undefined;
  const norm = normalizeStateQuery(query);

  return INDIA_STATE_COORDINATES.find((item) => {
    if (normalizeStateQuery(item.name) === norm) return true;
    if (normalizeStateQuery(item.id) === norm) return true;
    if (normalizeStateQuery(item.code) === norm) return true;
    if (normalizeStateQuery(item.capital) === norm) return true;
    if (item.aliases && item.aliases.some((a) => normalizeStateQuery(a) === norm)) return true;
    return false;
  });
}

/**
 * Calculates Euclidean/Haversine approximate distance to find nearest state
 */
export function findNearestStateCoordinates(lat: number, lon: number): StateCoordinateItem {
  let closest = INDIA_STATE_COORDINATES[0];
  let minDistanceSq = Number.MAX_VALUE;

  for (const item of INDIA_STATE_COORDINATES) {
    const dLat = item.lat - lat;
    const dLon = item.lon - lon;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closest = item;
    }
  }

  return closest;
}
