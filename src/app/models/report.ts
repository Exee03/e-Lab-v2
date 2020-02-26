export interface Report {
    user?: string;
    userName?: string;
    uid?: string;
    title?: string;
    group?: string;
    groupName?: string;
    course?: string;
    courseName?: string;
    courseCode?: string;
    lastEdit?: string;
    lastEvaluate?: string;
    submit?: boolean;
    evaluate?: string;
    inGroup?: boolean;
}

export interface Header {
    id?: number;
    uid?: string;
    name?: string;
    isExpanded?: boolean;
    isEdit?: boolean;
    data?: Array<HeaderData>;
}

export interface HeaderData {
    id?: number;
    uid?: string;
    sub?: boolean;
    type?: string;
    data?: string;
}

export interface Data {
    uid?: string;
    type?: string;
    data?: string;
}

export interface ReportData {
    report?: Report;
    headers?: Header[];
    subHeaders?: Header[];
    data?: Data[];
}
