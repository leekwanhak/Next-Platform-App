//넥스트 프로트엔드 클라이언트측 socket.io 공통 모듈 구현
//npm i socket.io-client 프론트엔드 프로젝트에 socket.io지원 패키지 설치 필요

//socket.io-client 패키지를 사용하기 위해 io 객체를 생성합니다.
import { io } from 'socket.io-client';

//채팅서버 URL주소 설정
const chatServerURL = 'http://localhost:5000'; //백엔드 서버 URL주소(env파일로 관리해도 됨)

//io 객체를 이용해 클라이언트 socket 객체를 생성하고 반환한다.
//io(서버소켓주소, 연결옵션{autoConnect:false}) -> autoConnect:false는 자동연결을 막는 옵션
export const socket = io(chatServerURL, { autoConnect: false }); //socket.io클라이언트 객체 생성
