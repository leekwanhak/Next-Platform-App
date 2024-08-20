import { LargeNumberLike } from 'crypto';

export interface ICreateBlog {
  title: string;
  contents: string;
  display: number;
}

export interface IBlog {
  article_id: number;
  board_type_code: number;
  title: string;
  article_type_code: number;
  contents: string;
  view_count: number;
  ip_address: string;
  is_display_code: number;
  reg_date: string;
  reg_member_id: number;
  edit_date: string;
  edit_member_id: number;
}

//블로그 정보하고 파일정보를 같이 같고 있는 것 //두 개 테이블을 쪼개서 필요한 속성만 가져온 것임
export interface IBlogFile {
  article_id: number;
  file_id: number;
  title: string;
  contents: string;
  file_path: string;
  file_name: string;
  reg_member_id: number;
  reg_member_name: string;
}
