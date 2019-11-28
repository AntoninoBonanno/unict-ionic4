import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { NewTweet, Tweet } from 'src/app/interfaces/tweet';
import { TweetsService } from 'src/app/services/tweets/tweets.service';
import { ToastService } from 'src/app/shared/toast.service';
import { ToastTypes } from 'src/app/enums/toast-types.enum';
import { UniLoaderService } from 'src/app/shared/uniLoader.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-new-tweet',
  templateUrl: './new-tweet.page.html',
  styleUrls: ['./new-tweet.page.scss'],
})
export class NewTweetPage implements OnInit {

  newTweet = {} as NewTweet;
  comments: Tweet[] = [];

  tweetToEdit: Tweet;

  editMode = false;
  isComment = false;

  constructor(
    private modalCtrl: ModalController,
    private tweetsService: TweetsService,
    private navParams: NavParams,
    private auth: AuthService,
    private toastService: ToastService,
    private uniLoader: UniLoaderService
  ) { }

  async ngOnInit() {
    /*
        Importo il parametro Tweet se acceddo alla modale per MODIFICARE
        Nel caso di accesso alla modal per createReadStream, la mia variabile sarà undefined
    */
    this.isComment = this.navParams.get('isComment'); //Modale dei commenti

    if (this.isComment) {
      this.newTweet._parent = this.navParams.get('tweet')._id;
      await this.getComments(); //recupero i commenti
    }
    else this.tweetToEdit = this.navParams.get('tweet');

    this.editMode = this.tweetToEdit !== undefined;
  }

  async dismiss() {
    await this.modalCtrl.dismiss();
  }

  async createOrEditTweet() {
    try {
      // Avvio il loader
      await this.uniLoader.show();

      if (this.editMode && !this.isComment) {
        // Chiamo la editTweet se l'utente sta modificando un tweet esistente
        await this.tweetsService.editTweet(this.tweetToEdit);
      } else {
        // Chiamo la createTweet se l'utente sta creando un nuovo tweet
        await this.tweetsService.createTweet(this.newTweet);
      }

      // Chiudo la modal
      await this.dismiss();
      await this.uniLoader.dismiss();

    } catch (err) {
      // Nel caso la chiamata vada in errore, mostro l'errore in un toast
      await this.toastService.show({
        message: err.message,
        type: ToastTypes.ERROR
      });
      // Chiudo il loader
      await this.uniLoader.dismiss();
    }
  }

  isDataInvalid(): boolean {
    if (this.editMode) {
      return !this.tweetToEdit.tweet.length ||
        this.tweetToEdit.tweet.length > 120;
    } else {
      if (this.newTweet.tweet) {
        return !this.newTweet.tweet.length ||
          this.newTweet.tweet.length > 120;
      }
      return true;
    }
  }

  canEdit(tweet: Tweet): boolean {
    // Controllo che l'autore del tweet coincida col mio utente
    if (tweet._author) {
      return tweet._author._id === this.auth.me._id;
    }
    return false;
  }

  getAuthor(tweet: Tweet): string {
    return this.canEdit(tweet) ? 'You' : `${tweet._author.name} ${tweet._author.surname}`;
  }

  /**
   * Storia 1 - recupera tutti i commenti inseriti nel tweet
   */
  async getComments() {
    try {
      // Avvio il loader
      await this.uniLoader.show();

      // Popolo il mio array di oggetti 'Comments' con quanto restituito dalla chiamata API
      this.comments = await this.tweetsService.getComments(this.newTweet._parent);

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

}
