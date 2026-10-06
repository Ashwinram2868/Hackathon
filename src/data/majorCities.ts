export interface IndianCity {
  name: string;
  state: string;
  lat: number;
  lon: number;
  popular?: boolean;
}

export const MAJOR_INDIAN_CITIES: IndianCity[] = [
  // Metro and Tier 1
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, popular: true },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, popular: true },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, popular: true },
  { name: 'Delhi', state: 'Delhi (NCT)', lat: 28.6139, lon: 77.2090, popular: true },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, popular: true },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, popular: true },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, popular: true },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, popular: true },
  
  // Tamil Nadu
  { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558, popular: true },
  { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198, popular: true },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lon: 78.7047 },
  { name: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lon: 78.1460 },
  { name: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7139, lon: 77.7567 },
  { name: 'Vellore', state: 'Tamil Nadu', lat: 12.9165, lon: 79.1325 },
  
  // Karnataka
  { name: 'Mysuru', state: 'Karnataka', lat: 12.2958, lon: 76.6394, popular: true },
  { name: 'Mangaluru', state: 'Karnataka', lat: 12.9141, lon: 74.8560 },
  { name: 'Hubballi', state: 'Karnataka', lat: 15.3647, lon: 75.1240 },
  { name: 'Belagavi', state: 'Karnataka', lat: 15.8497, lon: 74.4977 },
  
  // Kerala
  { name: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673, popular: true },
  { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366, popular: true },
  { name: 'Kozhikode', state: 'Kerala', lat: 11.2588, lon: 75.7804 },
  { name: 'Thrissur', state: 'Kerala', lat: 10.5276, lon: 76.2144 },
  
  // Andhra Pradesh
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185, popular: true },
  { name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480 },
  { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  { name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lon: 79.4192 },
  
  // Telangana
  { name: 'Warangal', state: 'Telangana', lat: 17.9689, lon: 79.5941 },
  { name: 'Nizamabad', state: 'Telangana', lat: 18.6725, lon: 78.0941 },
  
  // Maharashtra
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882, popular: true },
  { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898 },
  { name: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', lat: 19.8762, lon: 75.3433 },
  { name: 'Thane', state: 'Maharashtra', lat: 19.2183, lon: 72.9781 },

  // Gujarat
  { name: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311, popular: true },
  { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812 },
  { name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022 },

  // Rajasthan
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, popular: true },
  { name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lon: 73.0243 },
  { name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lon: 73.7125 },
  { name: 'Kota', state: 'Rajasthan', lat: 25.2138, lon: 75.8648 },

  // Madhya Pradesh
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, popular: true },
  { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, popular: true },
  { name: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lon: 78.1828 },
  { name: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lon: 79.9864 },

  // Uttar Pradesh
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, popular: true },
  { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
  { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739, popular: true },
  { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081 },
  { name: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463 },
  { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lon: 77.3910 },

  // Bihar
  { name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376, popular: true },
  { name: 'Gaya', state: 'Bihar', lat: 24.7914, lon: 85.0002 },
  { name: 'Muzaffarpur', state: 'Bihar', lat: 26.1226, lon: 85.3906 },

  // West Bengal & Odisha
  { name: 'Siliguri', state: 'West Bengal', lat: 26.7271, lon: 88.3953 },
  { name: 'Darjeeling', state: 'West Bengal', lat: 27.0410, lon: 88.2663 },
  { name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lon: 85.8245, popular: true },
  { name: 'Cuttack', state: 'Odisha', lat: 20.4625, lon: 85.8830 },
  { name: 'Puri', state: 'Odisha', lat: 19.8135, lon: 85.8312 },

  // North & Himalayan
  { name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lon: 76.7794, popular: true },
  { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573 },
  { name: 'Amritsar', state: 'Punjab', lat: 31.6340, lon: 74.8723 },
  { name: 'Gurugram', state: 'Haryana', lat: 28.4595, lon: 77.0266, popular: true },
  { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734, popular: true },
  { name: 'Dharamshala', state: 'Himachal Pradesh', lat: 32.2190, lon: 76.3234 },
  { name: 'Manali', state: 'Himachal Pradesh', lat: 32.2432, lon: 77.1892 },
  { name: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lon: 78.0322, popular: true },
  { name: 'Haridwar', state: 'Uttarakhand', lat: 29.9457, lon: 78.1642 },
  { name: 'Rishikesh', state: 'Uttarakhand', lat: 30.0869, lon: 78.2676 },
  { name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lon: 74.7973, popular: true },
  { name: 'Jammu', state: 'Jammu & Kashmir', lat: 32.7266, lon: 74.8570 },
  { name: 'Leh', state: 'Ladakh', lat: 34.1526, lon: 77.5771, popular: true },

  // Northeast
  { name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362, popular: true },
  { name: 'Shillong', state: 'Meghalaya', lat: 25.5788, lon: 91.8933, popular: true },
  { name: 'Gangtok', state: 'Sikkim', lat: 27.3314, lon: 88.6138 },
  { name: 'Agartala', state: 'Tripura', lat: 23.8315, lon: 91.2868 },
  { name: 'Imphal', state: 'Manipur', lat: 24.8170, lon: 93.9368 },
  { name: 'Aizawl', state: 'Mizoram', lat: 23.7271, lon: 92.7176 },
  { name: 'Kohima', state: 'Nagaland', lat: 25.6751, lon: 94.1086 },
  { name: 'Itanagar', state: 'Arunachal Pradesh', lat: 27.0844, lon: 93.6053 },

  // Union Territories
  { name: 'Panaji', state: 'Goa', lat: 15.4909, lon: 73.8278, popular: true },
  { name: 'Puducherry', state: 'Puducherry', lat: 11.9416, lon: 79.8083, popular: true },
  { name: 'Port Blair', state: 'Andaman & Nicobar', lat: 11.6234, lon: 92.7265 }
];
