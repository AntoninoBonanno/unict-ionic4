import { Component, OnInit } from '@angular/core';
import { Tweet } from 'src/app/interfaces/tweet';
import { TweetsService } from 'src/app/services/tweets/tweets.service';
import { ModalController } from '@ionic/angular';
import { NewTweetPage } from '../new-tweet/new-tweet.page';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UniLoaderService } from 'src/app/shared/uniLoader.service';
import { ToastService } from 'src/app/shared/toast.service';
import { ToastTypes } from 'src/app/enums/toast-types.enum';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-tweets',
  templateUrl: './tweets.page.html',
  styleUrls: ['./tweets.page.scss'],
})
export class TweetsPage implements OnInit {

  tweets: Tweet[] = [];

  usersPics: number[] = [];
  private userPicsAvailable = 15;

  onlyFavorites: boolean = false;

  constructor(
    private tweetsService: TweetsService,
    private usersService: UsersService,
    private modalCtrl: ModalController,
    private auth: AuthService,
    private uniLoader: UniLoaderService,
    private toastService: ToastService
  ) { }

  async ngOnInit() {
    // Quando carico la pagina, riempio il mio array di Tweets
    await this.getTweets();

  }

  async getTweets(hashtag?: String) {
    try {
      // Avvio il loader
      await this.uniLoader.show();

      if (hashtag) this.tweets = await this.tweetsService.getTweetsHashtag(hashtag);
      else this.tweets = await this.tweetsService.getTweets();

      this.usersPics = [];
      this.tweets.forEach(_ => {
        this.usersPics.push(Math.ceil(Math.random() * (this.userPicsAvailable - 1)));
      });

      // La chiamata è andata a buon fine, dunque rimuovo il loader
      await this.uniLoader.dismiss();
    } catch (err) {
      // Nel caso la chiamata vada in errore, mostro l'errore in un toast
      await this.toastService.show({
        message: err.message,
        type: ToastTypes.ERROR
      });
      await this.uniLoader.dismiss();
    }
  }

  async createOrEditTweet(tweet?: Tweet) {

    /*
        Creo una modal (assegnandola ad una variabile)
        per permettere all'utente di scrivere un nuovo tweet
    */
    const modal = await this.modalCtrl.create({
      component: NewTweetPage,
      componentProps: {
        tweet
      } // Passo il parametro tweet. Se non disponibile, rimane undefined.
    });

    /*
        Quando l'utente chiude la modal ( modal.onDidDismiss() ),
        aggiorno il mio array di tweets
    */
    modal.onDidDismiss()
      .then(async () => {
        // Aggiorno la mia lista di tweet, per importare le ultime modifiche apportate dall'utente
        await this.getTweets();
      });

    // Visualizzo la modal
    return await modal.present();

  }

  async deleteTweet(tweet: Tweet) {
    try {
      // Mostro il loader
      await this.uniLoader.show();

      // Cancello il mio tweet
      await this.tweetsService.deleteTweet(tweet._id);

      // Riaggiorno la mia lista di tweets
      await this.getTweets();

      // Mostro un toast di conferma
      await this.toastService.show({
        message: 'Your tweet was deleted successfully!',
        type: ToastTypes.SUCCESS
      });
    } catch (err) {
      // Nel caso la chiamata vada in errore, mostro l'errore in un toast
      await this.toastService.show({
        message: err.message,
        type: ToastTypes.ERROR
      });

    }
    // Chiudo il loader
    await this.uniLoader.dismiss();
  }

  canEdit(tweet: Tweet): boolean {
    // Controllo che l'autore del tweet coincida col mio utente
    if (tweet._author) {
      return tweet._author._id === this.auth.me._id;
    }
    return false;
  }

  // Metodo bindato con l'interfaccia in Angular
  getAuthor(tweet: Tweet): string {
    return this.canEdit(tweet) ? 'You' : `${tweet._author.name} ${tweet._author.surname}`;
  }

  //Creazione della modale per la visualizzazione dei commenti e inserimento di un nuovo commento
  async commentsTweet(tweet: Tweet) {
    let isComment = true;

    const modal = await this.modalCtrl.create({
      component: NewTweetPage,
      componentProps: {
        tweet,
        isComment
      }
    });

    /*
        Quando l'utente chiude la modal ( modal.onDidDismiss() ),
        aggiorno il mio array di tweets
    */
    modal.onDidDismiss()
      .then(async () => {
        // Aggiorno la mia lista di tweet, per importare le ultime modifiche apportate dall'utente
        await this.getTweets();
      });

    // Visualizzo la modal
    return await modal.present();

  }

  async pushLike(tweet: Tweet) {
    //if already liked, remove like
    if (tweet.like.includes(this.auth.me._id)) tweet.like.splice(tweet.like.indexOf(this.auth.me._id));
    else tweet.like.push(this.auth.me._id); // if not already liked, add like

    await this.tweetsService.pushLike(tweet);
  }

  haveMyLike(tweet: Tweet) {
    return tweet.like.indexOf(this.auth.me._id) > -1;
  }

  async addRemoveFavorites(tweet: Tweet) {
    try {
      // Mostro il loader
      await this.uniLoader.show();

      let user = (!tweet.isFavorite) ? await this.usersService.addFavorite(this.auth.me._id, tweet._id) : await this.usersService.removeFavorite(this.auth.me._id, tweet._id);
      this.auth.me = user;

      // Riaggiorno la mia lista di tweets
      await this.getTweets();

      // Mostro un toast di conferma
      await this.toastService.show({
        message: (!tweet.isFavorite) ? 'Your tweet is new favorites!' : 'Your tweet is not more favorites!',
        type: ToastTypes.SUCCESS
      });

    } catch (err) {

      // Nel caso la chiamata vada in errore, mostro l'errore in un toast
      await this.toastService.show({
        message: err.message,
        type: ToastTypes.ERROR
      });

    }

    // Chiudo il loader
    await this.uniLoader.dismiss();

  }

  async onChange(event) {
    let val = event.detail.value;
    this.getTweets(val);
  }
}
