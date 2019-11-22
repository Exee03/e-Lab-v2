export interface Group {
    name: string;
    student: number;
    course: string;
    uid?: string;
    selected?: boolean;
}

export interface GroupDetail {
    uid: string;
    name: string;
    courseUid: string;
    courseName: string;
    courseCode: string;
    count?: number;
}
