export interface Files {
    course: string;
    uid: string;
    page: Page[];
    firstPage: string;
    lastUpdate: string;
    selected?: boolean;
    items?: Items[];
}

export interface Page {
    num: number;
    url: string;
}

export interface Items {
    id: number;
    text: string;
    weight?: number;
    mark?: number;
}

export interface Evaluate {
    uid: string;
    rubric: string;
    lastUpdate: string;
    totalMark: number;
    fullMark: number;
    items: Items[];
}
