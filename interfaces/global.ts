//전역상태를 관리할 데이터 타입을 정의합니다.
export interface IGlobalData {
  token: string;
  member: ILoginMember;
}

export interface ILoginMember {
  member_id: number;
  name: string;
  email: string;
}
