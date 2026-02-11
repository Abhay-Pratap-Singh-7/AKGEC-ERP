
export interface Student {
  userId: string;
  accessToken: string;
  contextId: string;
  xToken: string;
  sessionId: string;
  name?: string;
}

export interface DayAttendance {
  absentDate: string;
  isAbsent: boolean;
  subjectName: string;
  subjectId: string;
  markedBy?: string;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  dob?: string;
  bloodGroup?: string;
  jeeRank?: string;
  tenthPercentage?: string;
  twelfthPercentage?: string;
  bankName?: string;
  ifscCode?: string;
  fatherName?: string;
  mobileNo?: string;
}

export interface AttendanceSubject {
  subjectName: string;
  subjectCode: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
  subjectId?: string;
}

export interface AttendanceData {
  subjects: AttendanceSubject[];
  overallPercentage: number;
  totalPresent: number;
  totalLectures: number;
  dailyLogs: DayAttendance[];
  extraLectures: any[];
  profile: UserProfile;
}
