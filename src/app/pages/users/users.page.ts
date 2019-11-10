import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { UsersService } from 'src/app/services/users/users.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  users: User[] = [];

  usersPics: number[] = [];
  private userPicsAvailable = 15;

  constructor(
    private usersService: UsersService,
    private auth: AuthService
  ) {}



  async ngOnInit() {

    // Quando carico la pagina, riempio il mio array di Users
    await this.getUsers();
    this.initUserPicts();

  }



  async getUsers() {

    try {

      // Popolo il mio array di oggetti 'User' con quanto restituito dalla chiamata API
      this.users = await this.usersService.getUsers();

    } catch (err) {

      // Gestisco l'eventuale errore stampandolo in console
      console.error(err);

    }
  }



  getItemColor(user: User): string | null  {

    if (user._id === this.auth.me._id) {
      return 'light';
    }

    return null;

  }



  initUserPicts() {

    this.users.forEach(_ => {
      this.usersPics.push(Math.ceil(Math.random() * this.userPicsAvailable));
    });

  }



}
