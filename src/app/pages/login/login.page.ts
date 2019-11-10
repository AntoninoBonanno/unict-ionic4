import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Login } from 'src/app/interfaces/login';
import { UniLoaderService } from 'src/app/shared/uniLoader.service';
import { ToastService } from 'src/app/shared/toast.service';
import { ToastTypes } from 'src/app/enums/toast-types.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  /* loginUser = {} as Login; */

  loginUser: Login = {
    email: 'fabio@test.com',
    password: 'fabio'
  };

  constructor(
    private navCtrl: NavController,
    private auth: AuthService,
    private uniLoader: UniLoaderService,
    private toastService: ToastService
  ) { }

  goToSignup() {
    this.navCtrl.navigateForward('/signup');
  }

  async login() {
    try {

      await this.uniLoader.show();

      // Effettuo la chiamata login
      await this.auth.login(this.loginUser);

      // Se la chiamata è andata buon fine, porto l'utente sulla schermata Tabs
      this.navCtrl.navigateRoot('/');

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
