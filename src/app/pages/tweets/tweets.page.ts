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

  async getTweets() {

    try {

      // Avvio il loader
      await this.uniLoader.show();

      // Popolo il mio array di oggetti 'Tweet' con quanto restituito dalla chiamata API
      this.tweets = await this.tweetsService.getTweets();
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

        // La chiamata è andata a buon fine, dunque rimuovo il loader
        await this.uniLoader.dismiss();

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

    if (this.canEdit(tweet)) {
      return 'You';
    } else {
      return tweet._author.name + ' ' + tweet._author.surname;
    }

    /* ------- UNA FORMA PIÚ SINTETICA PER SCRIVERE STA FUNZIONE: -------

      return this.canEdit(tweet) ? 'You' : `${tweet._author.name} ${tweet._author.surname}`;

    */

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

        // La chiamata è andata a buon fine, dunque rimuovo il loader
        await this.uniLoader.dismiss();

      });

    // Visualizzo la modal
    return await modal.present();

  }


  async addLike(tweet: Tweet) {
    tweet.like.push(this.auth.me._id);

    /*
        Quando l'utente chiude la modal ( modal.onDidDismiss() ),
        aggiorno il mio array di tweets
    */
    await this.tweetsService.addLike(tweet)

      .then(async () => {

        // Aggiorno la mia lista di tweet, per importare le ultime modifiche apportate dall'utente
        await this.getTweets();

        // La chiamata è andata a buon fine, dunque rimuovo il loader
        await this.uniLoader.dismiss();

      });
  }

  async addRemoveFavorites(tweet: Tweet) {

    try {

      // Mostro il loader
      await this.uniLoader.show();

      let user = (!tweet.isFavorite) ? await this.usersService.addFavorite(this.auth.me._id, tweet._id) : await this.usersService.removeFavorite(this.auth.me._id, tweet._id);
      console.log(user);

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
}
