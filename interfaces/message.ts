export interface IMessage {
  member_id: number;
  name: string;
  profile: string;
  message: string;
  send_date: string;
}

export interface IChannelCreate {
  channel_name: string;
  user_limit: number;
  channel_state_code: ChannelState; //채널 개설과 동시에 바로 사용할 것인지 아닌지
}

//채널 상태코드 열거형 타입
//node back app-> channel.js-> channel_state_code 참고
export enum ChannelState {
  NotUsed = 0, //사용안함
  Used = 1, //사용중
}

export interface IChannel {
  channel_id: number;
  community_id: number;
  channel_name: string;
  channel_img_path: string;
  user_limit: number;
  channel_desc: string;
  channel_state_code: ChannelState;
  reg_date: string;
  reg_member_id: number;
  edit_date: string;
  edit_member_id: number | null;
}
