import { HealthcareFacility } from '../types/communityPulse';

// Sample healthcare facilities for testing
export const sampleFacilities: Omit<HealthcareFacility, 'id'>[] = [
  {
    name: "City General Hospital",
    address: "123 Main Street, Downtown",
    location: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    type: "hospital",
    phoneNumber: "(555) 123-4567",
    website: "https://citygeneral.com",
    hours: "24/7",
    averageRating: 4.2,
    ratingCount: 156,
    ratingSum: 655,
    currentWaitTime: 45,
    waitTimeReports: 23,
    crowdingLevel: "moderate"
  },
  {
    name: "Urgent Care Plus",
    address: "456 Oak Avenue, Midtown",
    location: {
      latitude: 40.7589,
      longitude: -73.9851
    },
    type: "urgent_care",
    phoneNumber: "(555) 987-6543",
    website: "https://urgentcareplus.com",
    hours: "7 AM - 11 PM",
    averageRating: 4.5,
    ratingCount: 89,
    ratingSum: 401,
    currentWaitTime: 20,
    waitTimeReports: 15,
    crowdingLevel: "low"
  },
  {
    name: "Metro Emergency Center",
    address: "789 Pine Street, Uptown",
    location: {
      latitude: 40.7831,
      longitude: -73.9712
    },
    type: "emergency_room",
    phoneNumber: "(555) 456-7890",
    website: "https://metroemergency.com",
    hours: "24/7",
    averageRating: 3.8,
    ratingCount: 234,
    ratingSum: 889,
    currentWaitTime: 75,
    waitTimeReports: 45,
    crowdingLevel: "high"
  },
  {
    name: "Family Health Clinic",
    address: "321 Elm Street, Westside",
    location: {
      latitude: 40.7505,
      longitude: -74.0134
    },
    type: "clinic",
    phoneNumber: "(555) 234-5678",
    website: "https://familyhealth.com",
    hours: "8 AM - 6 PM",
    averageRating: 4.7,
    ratingCount: 67,
    ratingSum: 315,
    currentWaitTime: 15,
    waitTimeReports: 8,
    crowdingLevel: "low"
  },
  {
    name: "St. Mary's Medical Center",
    address: "654 Maple Drive, Eastside",
    location: {
      latitude: 40.7282,
      longitude: -73.9942
    },
    type: "hospital",
    phoneNumber: "(555) 345-6789",
    website: "https://stmarysmedical.com",
    hours: "24/7",
    averageRating: 4.1,
    ratingCount: 198,
    ratingSum: 812,
    currentWaitTime: 55,
    waitTimeReports: 32,
    crowdingLevel: "moderate"
  }
];

// Function to add sample facilities to the database
export const addSampleFacilities = async () => {
  const { addFacility } = await import('../firebase/communityPulseService');
  
  console.log('Adding sample facilities...');
  
  for (const facility of sampleFacilities) {
    try {
      const id = await addFacility(facility as HealthcareFacility);
      console.log(`Added facility: ${facility.name} with ID: ${id}`);
    } catch (error) {
      console.error(`Error adding facility ${facility.name}:`, error);
    }
  }
  
  console.log('Sample facilities added successfully!');
};
