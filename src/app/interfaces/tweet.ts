import { User } from './user';

export interface NewTweet {
    tweet: string;
    _parent: string; //Storia 1
}

export interface Tweet {
    created_at: string;
    _id: string;
    tweet: string;
    _author: User;
    _parent: string; //Storia 1
    like: string[]; //Storia 2
    isFavorite?: boolean; //Storia 3
}
