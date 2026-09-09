export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  phone?: string;
  group?: boolean;
  members?: number;
  admins?: string[];
  pinned: boolean;
  archived: boolean;
  muted: boolean;
  typing?: boolean;
}

export interface Message {
  id: string;
  text: string;
  sent: boolean;
  time: string;
  status: 'sent' | 'delivered' | 'read';
  starred: boolean;
  type: 'text' | 'image' | 'voice';
  imageUrl?: string;
  audioUri?: string;
  duration?: number;
  repliedTo?: string | null;
  sender?: string;
  senderId?: string;
}

export interface StatusItem {
  id: string;
  name: string;
  time: string;
  seen: boolean;
  type: 'image' | 'text' | 'video';
  imageUrl?: string;
  text?: string;
  bgColor?: string;
  videoUrl?: string;
}

export interface CallItem {
  id: string;
  name: string;
  type: 'incoming' | 'outgoing';
  callType: 'video' | 'voice';
  time: string;
  missed: boolean;
  duration: string | null;
  group?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  status: string;
  online: boolean;
}

export interface Community {
  id: string;
  name: string;
  members: number;
  groups: number;
  description: string;
}

export const mockChats: Chat[] = [
  { id: '1', name: 'Ahmed Khan', lastMessage: 'Hey, how are you bro?', time: '10:30 AM', unread: 2, online: true, phone: '+92 300 1234567', pinned: true, archived: false, muted: false, typing: false },
  { id: '2', name: 'Family Group 👨‍👩‍👧‍👦', lastMessage: 'Mom: Dinner at 8 PM', time: '9:15 AM', unread: 5, online: false, group: true, members: 8, admins: ['1'], pinned: true, archived: false, muted: false },
  { id: '3', name: 'Sara Ali', lastMessage: 'Thanks for your help!', time: 'Yesterday', unread: 0, online: true, phone: '+92 321 9876543', pinned: false, archived: false, muted: false },
  { id: '4', name: 'Office Team 💼', lastMessage: 'Meeting at 3 PM', time: 'Yesterday', unread: 12, online: false, group: true, members: 15, admins: ['1', '3'], pinned: false, archived: false, muted: true },
  { id: '5', name: 'Ali Raza', lastMessage: 'See you tomorrow', time: 'Monday', unread: 0, online: false, phone: '+92 333 5556667', pinned: false, archived: true, muted: false },
  { id: '6', name: 'Usman Bhai', lastMessage: '🎤 Voice message (0:45)', time: 'Sunday', unread: 0, online: true, phone: '+92 345 1112233', pinned: false, archived: false, muted: false },
  { id: '7', name: 'University Friends 🎓', lastMessage: 'Party this weekend?', time: 'Last week', unread: 0, online: false, group: true, members: 25, admins: ['1'], pinned: false, archived: false, muted: false },
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', text: 'Assalam o Alaikum!', sent: false, time: '10:25 AM', status: 'read', starred: false, repliedTo: null, type: 'text' },
    { id: '2', text: 'Walaikum Assalam! How are you?', sent: true, time: '10:26 AM', status: 'read', starred: false, repliedTo: '1', type: 'text' },
    { id: '3', text: 'Alhamdulillah, all good. You?', sent: false, time: '10:28 AM', status: 'read', starred: true, repliedTo: null, type: 'text' },
    { id: '4', text: 'Hey, how are you bro?', sent: false, time: '10:30 AM', status: 'read', starred: false, repliedTo: null, type: 'text' },
    { id: '5', text: 'Check this out!', sent: true, time: '10:31 AM', status: 'delivered', starred: false, type: 'image', imageUrl: 'https://picsum.photos/300/200', repliedTo: null },
    { id: '6', text: 'Voice message', sent: false, time: '10:33 AM', status: 'read', starred: false, type: 'voice', duration: 32, repliedTo: null },
  ],
  '2': [
    { id: '1', text: 'Dinner at 8 PM', sent: false, time: '9:15 AM', sender: 'Mom', senderId: 'mom', status: 'read', starred: false, type: 'text' },
    { id: '2', text: 'I will be late', sent: true, time: '9:20 AM', status: 'read', starred: false, type: 'text' },
    { id: '3', text: 'Okay, we will wait', sent: false, time: '9:22 AM', sender: 'Dad', senderId: 'dad', status: 'read', starred: false, type: 'text' },
  ],
};

export const mockStatus: StatusItem[] = [
  { id: '1', name: 'Ahmed Khan', time: '25 minutes ago', seen: false, type: 'image', imageUrl: 'https://picsum.photos/400/600' },
  { id: '2', name: 'Sara Ali', time: '1 hour ago', seen: false, type: 'text', text: 'Having a great day! 🌟', bgColor: '#00a884' },
  { id: '3', name: 'Ali Raza', time: '3 hours ago', seen: true, type: 'image', imageUrl: 'https://picsum.photos/400/601' },
  { id: '4', name: 'Usman Bhai', time: '5 hours ago', seen: true, type: 'image', imageUrl: 'https://picsum.photos/400/602' },
];

export const mockCalls: CallItem[] = [
  { id: '1', name: 'Ahmed Khan', type: 'incoming', callType: 'video', time: 'Today, 10:30 AM', missed: false, duration: '5:23' },
  { id: '2', name: 'Sara Ali', type: 'outgoing', callType: 'voice', time: 'Today, 9:15 AM', missed: false, duration: '12:45' },
  { id: '3', name: 'Unknown', type: 'incoming', callType: 'voice', time: 'Yesterday, 8:00 PM', missed: true, duration: null },
  { id: '4', name: 'Usman Bhai', type: 'outgoing', callType: 'video', time: 'Yesterday, 5:30 PM', missed: false, duration: '8:12' },
  { id: '5', name: 'Family Group', type: 'incoming', callType: 'video', time: 'Yesterday, 3:00 PM', missed: false, duration: '45:30', group: true },
];

export const mockContacts: Contact[] = [
  { id: '1', name: 'Ahmed Khan', phone: '+92 300 1234567', status: 'Hey there! I am using It\'s me', online: true },
  { id: '2', name: 'Sara Ali', phone: '+92 321 9876543', status: 'Available', online: true },
  { id: '3', name: 'Ali Raza', phone: '+92 333 5556667', status: 'Busy', online: false },
  { id: '4', name: 'Usman Bhai', phone: '+92 345 1112233', status: 'At work', online: true },
  { id: '5', name: 'Fatima Khan', phone: '+92 312 4445566', status: 'Can\'t talk right now', online: false },
];

export const mockCommunities: Community[] = [
  { id: '1', name: 'University Alumni 🎓', members: 150, groups: 5, description: 'Official alumni group' },
  { id: '2', name: 'Neighborhood 🏘️', members: 85, groups: 3, description: 'Local community updates' },
  { id: '3', name: 'Sports Club ⚽', members: 45, groups: 2, description: 'Weekly matches and events' },
];

export const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '🙏', '😊', '😍', '🤔', '😎', '🥳', '😢', '😡', '👏'];
