import { Injectable } from '@angular/core';
import { Report, Header, Data, ReportData } from 'src/app/models/report';
import { GroupDetail } from 'src/app/models/group';
import { User } from 'src/app/models/user';
import { BehaviorSubject, from, forkJoin, Observable, combineLatest } from 'rxjs';
import { Evaluate, Items, Files, Page } from 'src/app/models/files';
import { CommonService } from '../common/common.service';
import { DatabaseService } from '../database/database.service';
import { takeUntil, switchMap, mergeMap, map, flatMap } from 'rxjs/operators';
import { DocumentReference } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class LecturerService {
  reports = new BehaviorSubject<Report[]>([]);
  reportsWithUserData: Report[] = [];
  allEvaluate = new BehaviorSubject<Evaluate[]>([]);
  allRubric = new BehaviorSubject<Files[]>([]);
  allStudentData = new BehaviorSubject<User[]>([]);
  allReportData = new BehaviorSubject<ReportData[]>([]);
  selectedReportData: ReportData;
  studentData: User;
  selectedGroupDetail = new BehaviorSubject<GroupDetail>(null);
  totalMarkPercentage = new BehaviorSubject<number>(0);
  items = new BehaviorSubject<Items[]>([]);
  rubric: Files;
  fullMark = 0;
  totalMark = 0;

  constructor(
    private commonService: CommonService,
    private databaseService: DatabaseService
  ) {}

  async getReportWithUserData() {
    this.reportsWithUserData = [];
    const newAllReportData: ReportData[] = [];
    this.reports.value.forEach(report => {
      if (report.course === this.selectedGroupDetail.value.courseUid) {
        this.studentData = this.allStudentData.value.find(
          u => u.uid === report.user
        );
        report.userName =
          this.studentData.fullName !== undefined
            ? this.studentData.fullName
            : this.studentData.displayName;
        this.reportsWithUserData.push(report);
        this.getAllReportData(report, newAllReportData);
      }
    });
    this.allReportData.next(newAllReportData);
  }

  private getAllReportData(report: Report, newAllReportData: ReportData[]) {
    this.databaseService
      .getReportData(report.uid)
      .pipe(takeUntil(this.databaseService.unsubscribe$))
      .subscribe(data => {
        const reportData: ReportData = {
          report,
          headers: data[0],
          subHeaders: data[1],
          data: data[2]
        };
        newAllReportData.push(reportData);
      });
  }

  getStudentData(reportUid: string) {
    this.selectedReportData = this.allReportData.value.find(
      data => data.report.uid === reportUid
    );
    this.studentData = this.allStudentData.value.find(
      student => student.uid === this.selectedReportData.report.user
    );
    if (this.selectedReportData.report.evaluate === undefined) {
      this.rubric = this.allRubric.value.find(
        rubric => rubric.course === this.selectedGroupDetail.value.courseUid
      );
      this.preparingRubric();
    } else {
      const evaluate = this.allEvaluate.value.find(
        e => e.uid === this.selectedReportData.report.evaluate
      );
      this.items.next(evaluate.items);
      this.fullMark = evaluate.fullMark;
      this.totalMarkPercentage.next(
        (evaluate.totalMark / evaluate.fullMark) * 100
      );
      this.getRubricByUid(evaluate.rubric);
    }
  }

  private preparingRubric() {
    if (this.rubric.selected === undefined) {
      this.noRubric();
    } else {
      if (this.rubric.selected === true) {
        if (this.rubric.items !== undefined) {
          this.items.next(this.rubric.items);
          this.fullMark = 0;
          this.rubric.items.forEach(item => {
            item.mark = 0;
            this.fullMark = this.fullMark + 5 * item.weight;
          });
        } else {
          this.noRubric();
        }
      }
    }
  }

  private noRubric() {
    // tslint:disable-next-line: max-line-length
    this.commonService.showAlert(
      'Oppsss...',
      '',
      'This course still not have rubric yet. Please add rubric first before start evaluate this report.'
    );
  }

  getRubricByUid(rubricUid: string) {
    this.rubric = this.allRubric.value.find(rubric => rubric.uid === rubricUid);
    // tslint:disable-next-line: no-unused-expression
    this.rubric === undefined ? this.noRubric() : null;
  }

  async submitEvaluation(items: Items[]) {
    const evaluation: Evaluate = {
      items,
      rubric: this.rubric.uid,
      totalMark: this.totalMark,
      fullMark: this.fullMark
    };
    if (this.selectedReportData.report.evaluate === undefined) {
      this.commonService.showToast('Submitting evaluation...');
      const evaluationDoc = await this.databaseService.addEvaluation(
        evaluation
      );
      evaluation.lastUpdate = this.commonService.getTime();
      evaluation.uid = evaluationDoc.id;
      this.databaseService.updateEvaluation(
        evaluation.uid,
        evaluation
      ).then(() => this.databaseService.updateEvaluationToReport(evaluation.uid, this.selectedReportData.report.uid)
      .finally(() => this.commonService.showToast('Successfully submitted')));
    } else {
      this.commonService.showToast('Updating evaluation...');
      evaluation.lastUpdate = this.commonService.getTime();
      this.databaseService.updateEvaluation(
        this.selectedReportData.report.evaluate,
        evaluation
      ).finally(() => this.commonService.showToast('Successfully update'));
    }
  }

  async addFile() {
    let result: DocumentReference;
    const data: Files = {
      course: this.commonService.selectedGroupDetail.courseUid,
      lastUpdate: this.commonService.getTime(),
      selected: false
    };
    switch (this.commonService.uploadCategory) {
      case 'Rubric': {
        result = await this.databaseService.addRubric(data);
        break;
      }
      case 'Manuals': {
        result = await this.databaseService.addManual(data);
        break;
      }
      case 'Schedule': {
        result = await this.databaseService.addSchedule(data);
        break;
      }
      case 'Reference': {
        result = await this.databaseService.addReference(data);
        break;
      }
      default: {
        console.log('Invalid choice');
        break;
      }
    }
    return result.id;
  }

  updateFile(docUid: string, page: Page[]) {
    const firstPage = page.find(p => p.num === 1);
    const data: Files = {
      uid: docUid,
      firstPage: firstPage.url,
      lastUpdate: this.commonService.getTime(),
      page
    };
    switch (this.commonService.uploadCategory) {
      case 'Rubric': {
        this.databaseService.updateRubric(data);
        break;
      }
      case 'Manuals': {
        this.databaseService.updateManual(data);
        break;
      }
      case 'Schedule': {
        this.databaseService.updateSchedule(data);
        break;
      }
      case 'Reference': {
        this.databaseService.updateReference(data);
        break;
      }
      default: {
        console.log('Invalid choice');
        break;
      }
    }
  }
}
