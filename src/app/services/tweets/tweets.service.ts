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
    return this.http.post<Tweet>(`${environment.API_URL}/tweets/`, newTweet, {
      headers: headerOptions
    }).toPromise();
  }

  // READ
  async getTweets() {
    const headerOptions = this.httpOptions.headers.append('Authorization', `Bearer ${this.auth.userToken}`);
    var a = this.http.get<Tweet[]>(`${environment.API_URL}/tweets`, {
      headers: headerOptions
    }).toPromise();
    console.log(a);
    return a;

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

  // READ
  async getComments(tweetId: string) {
    return this.http.get<Tweet[]>(`${environment.API_URL}/tweets/${tweetId}/comments`).toPromise();
  }

  // addLike
  async addLike(tweet: Tweet) {
    const headerOptions = this.httpOptions.headers.append('Authorization', `Bearer ${this.auth.userToken}`);
    return this.http.put<any>(`${environment.API_URL}/tweets/addLike/${tweet._id}`, tweet, {
      headers: headerOptions
    }).toPromise();
  }
}
