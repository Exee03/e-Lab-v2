import { Pipe, PipeTransform } from '@angular/core';
import { Course } from '../models/course';

@Pipe({
  name: 'filterCourse'
})
export class FilterCoursePipe implements PipeTransform {

  transform(courses: Course[], text: string): Course[] {
    if ( text.length === 0 ) { return courses; }

    text = text.toLocaleLowerCase();

    return courses.filter(course => {
      return course.code.toLocaleLowerCase().includes(text) || course.name.toLocaleLowerCase().includes(text) ;
    });
  }

}
