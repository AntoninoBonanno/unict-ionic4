import { User } from './user';

export interface NewTweet {
    tweet: string;
    _parent: string;
}

export interface Tweet {
    created_at: string;
    _id: string;
    tweet: string;
    _author: User;
    _parent: string;
    _like: string[];
    isFavorite?: boolean;
}
