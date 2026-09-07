export interface Listing {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  phone: string;
  image: string;
  description: string;
  status: 'approved' | 'pending' | 'rejected';
  isFeatured: boolean;
  date: string;
  userId: string;
  views: number;
}

export interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  password?: string;
  securityQuestion: string;
  securityAnswer?: string;
  created: string;
}

export interface CategoryInfo {
  key: string;
  label: string;
  iconName: string;
}

export type ViewTab =
  | 'marketplace'
  | 'huta_in'
  | 'categories'
  | 'user_dashboard'
  | 'admin_dashboard'
  | 'more'
  | 'admin'
  | 'dashboard';

export interface ChatConversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice?: number;
  listingImage?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}
