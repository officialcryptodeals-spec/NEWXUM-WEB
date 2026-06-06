// ── Auth & Users ──────────────────────────────────────────────
export type Role =
  | 'worshipper'
  | 'responder'
  | 'medical_officer'
  | 'security_officer'
  | 'driver'
  | 'admin'
  | 'host';

export type ResponderType = 'medical' | 'security' | 'driver';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: Role;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  estateOrZone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

// ── API response envelope ─────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  meta: { timestamp: string; requestId: string };
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Emergency ─────────────────────────────────────────────────
export type ReportType = 'Medical' | 'Security';
export type IncidentStatus = 'Pending' | 'Dispatched' | 'EnRoute' | 'Resolved' | 'Cancelled';

export interface Incident {
  id: string;
  reportType: ReportType;
  status: IncidentStatus;
  priority: string;
  patientId: string;
  patientName?: string;
  patientEmergencyContact?: string;
  latitude: number;
  longitude: number;
  description?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  createdAt: string;
  dispatchedAt?: string;
  resolvedAt?: string;
}

// ── Missing Persons ───────────────────────────────────────────
export type AlertStatus = 'Open' | 'Found' | 'Closed';

export interface MissingPersonAlert {
  id: string;
  fullName: string;
  age?: number;
  description: string;
  photoUrl?: string;
  lastSeenAreaText?: string;
  status: AlertStatus;
  reportedBy: string;
  sightingCount: number;
  createdAt: string;
}

export interface Sighting {
  id: string;
  alertId: string;
  reportedBy: string;
  latitude: number;
  longitude: number;
  locationDescription?: string;
  createdAt: string;
}

// ── Parking ───────────────────────────────────────────────────
export interface ParkingPin {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  areaLabel?: string;
  vehicleDescription?: string;
  licencePlate?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
}

// ── Transit ───────────────────────────────────────────────────
export interface CampNode {
  id: string;
  label: string;
  nodeType: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
}

export interface CampEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  roadType: string;
  lengthM: number;
  isActive: boolean;
}

export interface ShuttleVehicle {
  id: string;
  driverId: string;
  registration: string;
  capacity: number;
  status: string;
  latitude?: number;
  longitude?: number;
  lastSeenAt?: string;
}

export interface ShuttleRequest {
  id: string;
  passengerId: string;
  status: string;
  estimatedArrivalMins?: number;
  routeGeoJson?: string;
  createdAt: string;
}

// ── Booking ───────────────────────────────────────────────────
export interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  photoUrls: string[];
  hostId: string;
  hostName: string;
  status: string;
  lastSupervisedAt?: string;
  nextSupervisionDue?: string;
}

export interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  description: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  photoUrls: string[];
}

export interface Booking {
  id: string;
  guestId: string;
  guestName?: string;
  propertyId: string;
  propertyName?: string;
  roomTypeId: string;
  roomTypeName?: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: 'PendingPayment' | 'Confirmed' | 'CheckedIn' | 'Completed' | 'Cancelled';
  confirmationCode?: string;
  paystackReference?: string;  // ← added
  paidAt?: string;   
  createdAt: string;
}

// ── Geofence ──────────────────────────────────────────────────
export interface GeofenceZone {
  id: string;
  name: string;
  description?: string;
  boundary: GeoJSON.Polygon;
  isActive: boolean;
  activatedAt?: string;
}
