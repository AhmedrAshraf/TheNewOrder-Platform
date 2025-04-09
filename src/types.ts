export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  creator: {
    creator_name: string;
    creator_id: string;
    creator_title?: string;
    creator_bio?: string;
  };
  category: 'automation' | 'integration' | 'workflow';
  tags: string[];
  priceId?: string; // Stripe price ID
  pulses: number; // Rating/upvotes count
  key_features?: string[]; // Array of feature strings
  user_id: string; // ID of the creator
  created_at: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  faq?: { question: string; answer: string }[];
  demoVideo?: DemoVideo | string;
  bluePrint?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  products: Product[];
  role?: 'user' | 'admin';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

type WorkflowStatus = 'draft' | 'pending' | 'approved' | 'rejected';

interface KeyFeature {
  title: string;
  description: string;
}

interface DemoVideo {
  url: string;
  thumbnail: string;
  duration: string;
}

interface Prerequisites {
  tools: string[];
  subscriptions: string[];
  skills: string[];
}

interface DifficultyLevel {
  level: 'beginner' | 'medium' | 'advanced';
  setupTime: string;
  learningCurve: string;
  technicalRequirements: string;
  supportAvailability: string;
}

interface SetupStep {
  title: string;
  description: string;
}

interface SetupGuide {
  steps: SetupStep[];
  estimatedTime: string;
  supportResources: string[];
}

interface SystemRequirements {
  cpu: string;
  memory: string;
  storage: string;
  internet: string;
}

interface Requirements {
  minimum: SystemRequirements;
  recommended: SystemRequirements;
}

export interface Workflow extends Omit<Product, 'priceId'> {
  status: WorkflowStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  curatorNotes?: string;
  videoUrl?: string;
  complexity?: 'beginner' | 'medium' | 'advanced';
  integrations?: string[];
  techStack?: string[];
  keyFeatures?: KeyFeature[];
  demoVideo?: DemoVideo;
  prerequisites?: Prerequisites;
  difficultyLevel?: DifficultyLevel;
  faq?: { question: string; answer: string }[];
  creatorBio?: string;
  consultationAvailable?: boolean;
  consultationRate?: string;
  setupGuide?: SetupGuide;
  requirements?: Requirements;
}

type NotificationType = 'admin' | 'creator' | 'buyer' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'proposal' | 'system';
  metadata?: {
    price?: number;
    hours?: number;
    description?: string;
    paymentStatus?: 'pending' | 'paid' | 'completed';
    paymentId?: string;
  };
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
  productId?: string;
  productTitle?: string;
}

export interface ConsultationOption {
  id: string;
  title: string;
  description: string;
}