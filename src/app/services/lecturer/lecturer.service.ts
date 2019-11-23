import { Injectable } from '@angular/core';
import { Report } from 'src/app/models/report';
import { GroupDetail } from 'src/app/models/group';

@Injectable({
  providedIn: 'root'
})
export class LecturerService {

  reports: Report[] = [];

  constructor() { }
}
