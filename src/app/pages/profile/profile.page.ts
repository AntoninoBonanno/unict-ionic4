import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UsersService } from 'src/app/services/users/users.service';
import { NavController } from '@ionic/angular';
import { UniLoaderService } from 'src/app/shared/uniLoader.service';
import { ToastService } from 'src/app/shared/toast.service';
import { ToastTypes } from 'src/app/enums/toast-types.enum';
import { UniAlertService } from 'src/app/shared/uniAlert.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  me: User;

  readOnly = true;

  constructor(
    private auth: AuthService,
    private usersService: UsersService,
    private navCtrl: NavController,
    private uniLoader: UniLoaderService,
    private toastService: ToastService,
    private uniAlert: UniAlertService
  ) { }

  ngOnInit() {
    this.me = this.auth.me;
  }

  async editAndSave() {

    if (!this.readOnly) {
      try {

        await this.uniLoader.show();

        await this.usersService.editUser(this.me);

        await this.uniLoader.dismiss();

        await this.toastService.show({
          message: 'Your account edits are now safe and sound!',
          type: ToastTypes.SUCCESS
        });

      } catch (err) {

          // Nel caso la chiamata vada in errore, mostro l'errore in un toast
          await this.toastService.show({
            message: err.message,
            type: ToastTypes.ERROR
          });

      }
    }
    this.readOnly = !this.readOnly;

  }

  async deleteMe() {

    const alerButtons = [
      {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
      }, {
          text: 'OK',
          handler: async () => {
            this.confirmedDeletedUser();
          }
      }
    ];

    await this.uniAlert.show({
      header: 'Heads up!',
      subHeader: 'You are about to delete your own account.',
      message: 'Do you confirm you want to proceed with this action?',
      buttons: alerButtons
    });

  }

  async confirmedDeletedUser() {

    try {

      await this.uniLoader.show();

      await this.usersService.deleteUser(this.me._id);
      await this.logout();

      await this.uniLoader.dismiss();

    } catch (err) {

      // Nel caso la chiamata vada in errore, mostro l'errore in un toast
      await this.toastService.show({
        message: err.message,
        type: ToastTypes.ERROR
      });

    }

  }

  async logout() {
    this.auth.me = {} as User;
    this.auth.userToken = undefined;
    await this.navCtrl.navigateRoot('/login');
  }

}
