import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Tweet, NewTweet } from 'src/app/interfaces/tweet';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TweetsService {

  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  // CREATE
  async createTweet(newTweet: NewTweet) {
    const headerOptions = this.httpOptions.headers.append('Authorization', `Bearer ${this.auth.userToken}`);
    return this.http.post<Tweet>(`${environment.API_URL}/tweets`, newTweet, {
      headers: headerOptions
    }).toPromise();
  }

  // READ
  async getTweets() {
    const headerOptions = this.httpOptions.headers.append('Authorization', `Bearer ${this.auth.userToken}`);
    return this.http.get<Tweet[]>(`${environment.API_URL}/tweets`, {
      headers: headerOptions
    }).toPromise();
  }

  // UPDATE
  async editTweet(tweet: Tweet) {
    const headerOptions = this.httpOptions.headers.append('Authorization', `Bearer ${this.auth.userToken}`);
    return this.http.put<any>(`${environment.API_URL}/tweets/${tweet._id}`, tweet, {
      headers: headerOptions
    }).toPromise();
  }

  // DELETE
  async deleteTweet(tweetId: string) {
    const headerOptions = this.httpOptions.headers.append('Authorization', `Bearer ${this.auth.userToken}`);
    return this.http.delete<any>(`${environment.API_URL}/tweets/${tweetId}`, {
      headers: headerOptions
    }).toPromise();
  }

  // Storia 1 - Recupera tutti i commenti di uno specifico tweet 
  async getComments(tweetId: string) {
    const headerOptions = this.httpOptions.headers.append('Authorization', `Bearer ${this.auth.userToken}`);
    return this.http.get<Tweet[]>(`${environment.API_URL}/tweets/${tweetId}/comments`, {
      headers: headerOptions
    }).toPromise();
  }

  // Storia 2 - Inserimento/Rimozione di un like su uno specifico tweet
  async pushLike(tweet: Tweet) {
    const headerOptions = this.httpOptions.headers.append('Authorization', `Bearer ${this.auth.userToken}`);
    return this.http.put<any>(`${environment.API_URL}/tweets/${tweet._id}/like`, tweet, {
      headers: headerOptions
    }).toPromise();
  }

  /**
   * Storia 4 - Recupero dei tweet con uno specifico hashtag
   * @param htag 
   */
  async getTweetsHashtag(htag: String) {
    const headerOptions = this.httpOptions.headers.append('Authorization', `Bearer ${this.auth.userToken}`);
    return this.http.get<Tweet[]>(`${environment.API_URL}/tweets/hashtag/${htag}`, {
      headers: headerOptions
    }).toPromise();
  }
}
