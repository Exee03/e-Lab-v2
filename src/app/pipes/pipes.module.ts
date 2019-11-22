import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterUserPipe } from './filter-user.pipe';
import { FilterCoursePipe } from './filter-course.pipe';



@NgModule({
  declarations: [ FilterUserPipe, FilterCoursePipe ],
  exports: [ FilterUserPipe, FilterCoursePipe ]
})
export class PipesModule { }
