export interface Roles {
    admin?: boolean;
    lecturer?: boolean;
    student?: boolean;
}

export interface User {
    uid: string;
    email: string;
    provider: string;
    password?: string;
    roles?: Roles;
    displayName: string;
    id?: string;
    fullName?: string;
    faculty?: string;
    phone: string;
    report?: number;
    photoURL?: string;
    course?: Array<string>;
    group?: Array<string>;
    lastSeen?: string;
    roleLabel?: string;
}
