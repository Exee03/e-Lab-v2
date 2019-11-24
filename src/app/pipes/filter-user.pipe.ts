import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../models/user';

@Pipe({
  name: 'filterUser'
})
export class FilterUserPipe implements PipeTransform {

  transform(users: User[], text: string): User[] {
    if ( text.length === 0 ) { return users; }

    text = text.toLocaleLowerCase();

    return users.filter(user => {
      return user.fullName.toLocaleLowerCase().includes(text) || user.email.toString().includes(text) ;
    });
  }

}
