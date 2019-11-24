import { Group } from './group';

export interface Course {
    code?: string;
    name?: string;
    uid?: string;
    group?: number;
    count?: number;
    groups?: Group[];
    showGroup?: boolean;
}
