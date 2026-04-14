type GroupChatType = {
  id: string;
  userId: string;
  title: string;
  passcode: string | null;
  createdAt: string;
};

type GroupChatUserType = {
  id: number;
  name: string;
  group_id: string;
  created_at: string;
  isOnline?: boolean;
};

type MessageType = {
  id: string;
  message: string;
  group_id: string;
  name: string;
  created_at: string;
};