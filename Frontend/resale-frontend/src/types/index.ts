export interface UserPhoto {
  id: number;
  url: string;
  isPrimary: boolean;
}

export interface Address {
  id: number;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: { id: number; name: string }[];
  balance: number;
  addresses: Address[];
  photos: UserPhoto[];
  profilePicture?: UserPhoto;
}