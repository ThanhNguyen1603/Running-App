export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Groups: undefined;
  Profile: undefined;
  Admin: undefined;
};

export type GroupStackParamList = {
  GroupList: undefined;
  GroupDetail: { groupId: string; groupName: string };
  JoinGroup: undefined;
};

export type AdminStackParamList = {
  AdminHome: undefined;
  CreateChallenge: undefined;
  CreateGroup: undefined;
};

export type RootStackParamList = {
  ConnectStrava: undefined;
  Main: undefined;
};
