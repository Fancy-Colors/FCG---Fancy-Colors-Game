declare global {
  export type IconType =
    | 'main'
    | 'leaderboard'
    | 'forum'
    | 'settings'
    | 'close'
    | 'vk'
    | 'search'
    | 'arrow'
    | 'circle'
    | 'enter'
    | 'exit'
    | 'github'
    | 'message'
    | 'smile'
    | 'telegram';

  export type User = {
    id: number;
    login: string;
    firstName: string;
    secondName: string;
    displayName: string;
    avatar: string;
    phone: string;
    email: string;
  };
}

export {};
