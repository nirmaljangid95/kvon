export interface Activity {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  issueId?: {
    _id: string;
    title: string;
  };
  projectId: {
    _id: string;
    name: string;
  };
  type: string;
  action: string;
  description: string;
  createdAt: Date;
}
