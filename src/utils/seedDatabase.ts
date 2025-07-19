import { addFacility } from '../firebase/communityPulseService';
import { HealthcareFacility } from '../types/communityPulse';

// Sample healthcare facilities for testing
const sampleFacilities: Omit<HealthcareFacility, 'id'>[] = [
  {
    name: "City General Hospital",
    address: "123 Main Street, New York, NY 10001",
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
    address: "456 Oak Avenue, New York, NY 10016",
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
    address: "789 Pine Street, New York, NY 10025",
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
    address: "321 Elm Street, New York, NY 10014",
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
    address: "654 Maple Drive, New York, NY 10003",
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

// Function to seed the database with sample facilities
export const seedDatabase = async (): Promise<void> => {
  console.log('🏥 Starting to seed database with sample facilities...');
  
  try {
    for (const facility of sampleFacilities) {
      try {
        const id = await addFacility(facility as HealthcareFacility);
        console.log(`✅ Added facility: ${facility.name} with ID: ${id}`);
      } catch (error) {
        console.error(`❌ Error adding facility ${facility.name}:`, error);
      }
    }
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  }
};

// Export for use in browser console
(window as any).seedDatabase = seedDatabase;
