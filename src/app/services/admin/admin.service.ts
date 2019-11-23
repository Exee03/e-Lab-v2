import { Injectable } from '@angular/core';
import { User } from 'src/app/models/user';
import { DatabaseService } from '../database/database.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  unsubscribeAdmin$ = new Subject<void>();
  users: User[] = [];

  constructor(
    private databaseService: DatabaseService
  ) { }

}
