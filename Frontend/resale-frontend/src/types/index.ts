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

export interface Order {
  orderId: string;
  receiverName: string ; 
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'; // Specific status types are better than just string
  orderDate: string;
  paymentMethod: string;
  totalAmount: number;
  itemSummaries: string[];
}



export interface OrderDetail extends Order {
  orderId: string;
  shippingAddress: string; 
  items: OrderItem[];     
}

export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  size?: string; 
  color?: string;
}