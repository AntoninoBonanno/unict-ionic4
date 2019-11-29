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

  onlyFavorites: boolean = false; //Per mostrare solo i tweet favoriti

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

      if (hashtag) this.tweets = await this.tweetsService.getTweetsHashtag(hashtag); //se ho inserito un hashtag, faccio la rischiesta corretta
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

  /**
   * Storia 1 - Creazione della modale per la visualizzazione dei commenti e inserimento di un nuovo commento
   * @param tweet 
   */
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

  /**
   * Storia 2 - Aggiunge o rimuove il like ad un tweet
   * @param tweet 
   */
  async pushLike(tweet: Tweet) {
    //se esiste il like lo rimuove, altrimenti lo aggiunge e poi si aggiorna il tweet con l'API
    if (tweet.like.includes(this.auth.me._id)) {
      const index = tweet.like.indexOf(this.auth.me._id, 0);
      if (index > -1) tweet.like.splice(index, 1);
    }
    else tweet.like.push(this.auth.me._id);

    await this.tweetsService.pushLike(tweet);
  }

  /**
   * Storia 2 - Controlla se ho messo il like ad uno specifico tweet
   * @param tweet Tweet da controllare se ho messo like
   */
  haveMyLike(tweet: Tweet) {
    return tweet.like.indexOf(this.auth.me._id) > -1;
  }

  /**
   * Storia 3 - Aggiunge o rimuove il tweet come preferito
   * @param tweet 
   */
  async addRemoveFavorites(tweet: Tweet) {
    try {
      // Mostro il loader
      await this.uniLoader.show();

      //modifico i favoriti dell'utente e viene restituito il nuovo utente
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

  /**
   * Storia 4 - all'evento di inserimento nella barra di ricerca, recupero i tweet con il corretto hashtag
   * @param event 
   */
  async onChange(event) {
    let val = event.detail.value;
    this.getTweets(val);
  }
}
