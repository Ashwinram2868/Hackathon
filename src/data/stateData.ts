import { StateInfo } from '../types/weather';
import {
  INDIA_STATE_COORDINATES,
  findStateCoordinates,
  findNearestStateCoordinates,
  normalizeStateQuery,
  StateCoordinateItem
} from './stateCoordinates';

export {
  INDIA_STATE_COORDINATES,
  findStateCoordinates,
  findNearestStateCoordinates,
  normalizeStateQuery
};
export type { StateCoordinateItem };

/**
 * Descriptions and major urban centers mapped by state ID
 */
const STATE_PROFILES: Record<string, { description: string; majorCities: string[] }> = {
  'tamil-nadu': {
    description: 'Coromandel Coast region subject to Northeast Monsoon systems & coastal depressions.',
    majorCities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli']
  },
  'kerala': {
    description: 'Gateway to the Southwest Monsoon with dense Western Ghats orographic precipitation.',
    majorCities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad']
  },
  'karnataka': {
    description: 'Deccan plateau with coastal belt prone to high coastal surges and rain shadow zones.',
    majorCities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Shivamogga']
  },
  'andhra-pradesh': {
    description: 'Extended Bay of Bengal coastline with high cyclonic depression vulnerability.',
    majorCities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati']
  },
  'telangana': {
    description: 'Semi-arid Deccan plateau terrain with summer heatwaves and heavy monsoon squalls.',
    majorCities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam']
  },
  'maharashtra': {
    description: 'Konkan coastal zone experiencing intense monsoon rainfall and urban deluge events.',
    majorCities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Chhatrapati Sambhajinagar']
  },
  'gujarat': {
    description: 'Arabian Sea coastline and Rann of Kutch; cyclonic tracks and arid margins.',
    majorCities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Gandhinagar']
  },
  'rajasthan': {
    description: 'Thar desert and Aravalli range characterized by extreme diurnal temperatures.',
    majorCities: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur']
  },
  'madhya-pradesh': {
    description: 'Central plateau dividing river basins; prone to monsoon depressions traversing inland.',
    majorCities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar']
  },
  'uttar-pradesh': {
    description: 'Gangetic plains experiencing heavy monsoon convection and winter radiation fog.',
    majorCities: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Noida']
  },
  'bihar': {
    description: 'Middle Ganga basin vulnerable to severe seasonal river inundation and localized flooding.',
    majorCities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia']
  },
  'west-bengal': {
    description: 'Deltaic floodplains extending to the Bay of Bengal; frequent tropical cyclones & Nor\'westers.',
    majorCities: ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol', 'Kharagpur']
  },
  'odisha': {
    description: 'Eastern seaboard primary landfall zone for North Indian Ocean tropical cyclones.',
    majorCities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Balasore', 'Berhampur']
  },
  'jharkhand': {
    description: 'Chota Nagpur plateau with elevated rainfall and monsoon squall susceptibility.',
    majorCities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh']
  },
  'chhattisgarh': {
    description: 'Mahanadi river catchment subject to intense mid-monsoon convective storm cells.',
    majorCities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon']
  },
  'assam': {
    description: 'Brahmaputra river valley with exceptional seasonal rainfall and flash-flood susceptibility.',
    majorCities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tezpur']
  },
  'punjab': {
    description: 'Northwestern alluvial plains prone to winter western disturbances and summer heat domes.',
    majorCities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali']
  },
  'haryana': {
    description: 'North-central agrarian corridor subject to pre-monsoon dust storms and temperature spikes.',
    majorCities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar', 'Karnal']
  },
  'himachal-pradesh': {
    description: 'Western Himalayan alpine terrain prone to cloudbursts, snowfall, and landslide hazards.',
    majorCities: ['Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu', 'Manali']
  },
  'uttarakhand': {
    description: 'Central Himalayan slopes experiencing heavy orographic downpours and glacial flows.',
    majorCities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Nainital']
  },
  'delhi': {
    description: 'National capital metropolis experiencing severe temperature swings and air-mass stagnation.',
    majorCities: ['New Delhi', 'North Delhi', 'South Delhi', 'Dwarka', 'Rohini', 'Connaught Place']
  },
  'jammu-and-kashmir': {
    description: 'Himalayan mountain valleys influenced by Western Disturbances and sudden snowfall.',
    majorCities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur']
  },
  'ladakh': {
    description: 'High-altitude cold desert plateau with severe freezing conditions and minimal precipitation.',
    majorCities: ['Leh', 'Kargil', 'Nubra', 'Drass']
  },
  'goa': {
    description: 'Konkan coastal belt with prolonged tropical monsoons exceeding 3,000mm precipitation.',
    majorCities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda']
  },
  'tripura': {
    description: 'Surrounded by river plains; high annual precipitation and humidity extremes.',
    majorCities: ['Agartala', 'Dharmanagar', 'Udaipur', 'Kailashahar']
  },
  'meghalaya': {
    description: 'Southern escarpment containing Mawsynram & Sohra — among the wettest places on Earth.',
    majorCities: ['Shillong', 'Tura', 'Cherrapunji', 'Jowai']
  },
  'manipur': {
    description: 'Intermontane valley surrounded by forested hills prone to monsoon flash floods.',
    majorCities: ['Imphal', 'Churachandpur', 'Thoubal', 'Bishnupur']
  },
  'mizoram': {
    description: 'Lush mountain ridge topography receiving abundant monsoon rains.',
    majorCities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip']
  },
  'nagaland': {
    description: 'Mountainous state with rich biodiversity and heavy June-September precipitation.',
    majorCities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang']
  },
  'arunachal-pradesh': {
    description: 'Eastern Himalayan crest with steep climate transitions from subtropical to alpine.',
    majorCities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro']
  },
  'sikkim': {
    description: 'Kanchenjunga foothill state with dramatic altitude gradients and cloud immersion.',
    majorCities: ['Gangtok', 'Namchi', 'Geyzing', 'Mangan']
  },
  'chandigarh': {
    description: 'Planned urban union territory situated near the Shivalik foothills.',
    majorCities: ['Chandigarh']
  },
  'puducherry': {
    description: 'Coastal French heritage enclave influenced by intense winter monsoon squalls.',
    majorCities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam']
  },
  'andaman-and-nicobar': {
    description: 'Tropical archipelago in the Bay of Bengal receiving over 3,000mm of annual precipitation.',
    majorCities: ['Port Blair', 'Havelock', 'Diglipur', 'Car Nicobar']
  },
  'lakshadweep': {
    description: 'Coral atoll island territory in the Arabian Sea with high maritime humidity.',
    majorCities: ['Kavaratti', 'Agatti', 'Andrott', 'Minicoy']
  },
  'dadra-and-nagar-haveli-and-daman-and-diu': {
    description: 'Western coastal union territory experiencing heavy maritime monsoon weather.',
    majorCities: ['Daman', 'Diu', 'Silvassa']
  }
};

/**
 * Unified Indian States registry combining standardized coordinates with meteorological profiles
 */
export const INDIAN_STATES: StateInfo[] = INDIA_STATE_COORDINATES.map((coord) => {
  const profile = STATE_PROFILES[coord.id] || {
    description: `Meteorological zone of ${coord.name} with reference coordinates ${coord.lat}°N, ${coord.lon}°E.`,
    majorCities: [coord.capital]
  };

  return {
    id: coord.id,
    name: coord.name,
    code: coord.code,
    capital: coord.capital,
    zone: coord.zone,
    lat: coord.lat,
    lon: coord.lon,
    description: profile.description,
    majorCities: profile.majorCities
  };
});

export const DEFAULT_STATE = INDIAN_STATES[0]; // Tamil Nadu
