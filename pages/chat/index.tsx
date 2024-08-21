//사용자간 기초 채팅기능구현 컴포넌트
import { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import { IMessage } from '@/interfaces/message';

//채팅 클라이언트 socket객체 참조하기
import { socket } from '@/library/socket';

const Chat = () => {
  //라우터 객체 생성
  const router = useRouter();

  //현재 사용자 고유번호 상태값 정의
  const [memberId, setMemberId] = useState<number>(1); //현재 사용자 고유번호 상태값 정의(현재 사용자가 1번이라고 가정)

  //채팅 메시지 입력 요소 바인딩 텍스트 상태값 정의
  const [message, setMessage] = useState<string>(''); //메시지 입력값 상태값 정의

  //채팅 메시지 목록(채팅이력정보) 상태값 정의하기
  const [messageList, setMessageList] = useState<IMessage[]>([
    {
      member_id: 1, //1번 사용자인 홍길동은 오른쪽에 나머지는 왼쪽에
      name: '홍길동',
      profile: 'http://localhost:5000/img/user1.png',
      message: '안녕하세요',
      send_date: '2021-09-01 10:00:00',
    },
    {
      member_id: 2,
      name: '이관학',
      profile: 'http://localhost:5000/img/user.png',
      message: 'ㅎㅇ',
      send_date: '2021-09-01 11:00:00',
    },
    {
      member_id: 3,
      name: '김철수',
      profile: 'http://localhost:5000/img/user3.png',
      message: '누구세요',
      send_date: '2021-09-01 12:00:00',
    },
  ]);

  //최초 1회 화면이 렌더링되는 시점(마운팅되는 시점)에 실행되는 useEffect 함수
  //프로젝트 루트에 next.config.mjs파일 내 reactStrictMode(엄격모드)값을 false로 변경해야만 1회만 작동함
  //useEffect 훅은 CSR환경에서 작동되고 useRouter 훅은 SSR/CSR순서로 2번작동됨.-> 서로 궁합이 맡지 않아서 사용자 고유번호가 콘솔에 undefined로 찍힘
  //useEffect훅에서 useRouter훅 이용해 URL 키값이 추출안되는 문제는 useRouter.isReady값을 이용해 해결가능
  //useRouter.isReady값이 기본은 false->true로 변경되는 시점에 관련 기능 구현하면됨.. //useRouter를 쓸 수 있는지 없는지를 알려주는 것임 최초에는 false였다가 true로 바뀜

  useEffect(() => {
    console.log('현재 URL주소에서 사용자 고유번호 추출하기: ', router.query.id);

    //URL주소를 통해 사용자 고유번호가 전달된 경우에만 실행
    if (router.query.id !== undefined) {
      //현재 사용자 고유번호 상태값 설정해주기
      setMemberId(Number(router.query.id)); //문자열로 넘어오는 데이터값을 Number()함수를 이용하여 숫자열로 바꿔줌
    }
  }, [router.isReady]); //빈배열일 때는 최초 마운트시에 실행되는 것이고 배열안에 값이 들어 있으면 그 값이 변경될 때마다 실행됨(false->true로 변경되는 시점에 실행됨) //1.최초 실행 undefined, 2. router값이 변경될 때2번(파라미터, 쿼리)

  //최초 1회 화면이 렌더링되는 시점(마운팅되는시점)에 실행되는 useEffect함수
  //=============================================================================================================================================
  useEffect(() => {
    //최초 화면이 렌더링되는 시점(최초1회)에 서버소켓 연결하기
    socket.connect(); //클라이언트 소켓과 서버 소켓이 연결을 시도함

    //서버소켓과 연결이 완료되면 실행되는 이벤트처리함수
    //서버 소켓과 연결이 완료되면 자동으로 client 소켓에서 connect 이벤트가 실행되고
    //connect이벤트가 실행되면 처리할 이벤트 처리할 기능 구현
    socket.on('connect', () => {
      //연결이 되면 작동할 기능을 구현하는 영역
      console.log('서버소켓과 연결되었습니다.');
    });
  });

  //채팅 메시지 전송 이벤트 처리함수
  const sendMessage = () => {};

  return (
    <div className="flex h-screen antialiased text-gray-800 mt-14 pb-10">
      <div className="flex flex-row h-full w-full overflow-x-hidden">
        <div className="flex flex-col flex-auto h-full p-6">
          <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
            {/* 메시지 목록 출력영역 */}
            <div className="flex flex-col h-full overflow-x-auto mb-4">
              <div className="flex flex-col h-full">
                <div className="grid grid-cols-12 gap-y-2">
                  {messageList.map((msg, index) =>
                    msg.member_id === memberId ? (
                      // 오른쪽 본인 메시지 출력영역
                      <div
                        key={index}
                        className="col-start-6 col-end-13 p-3 rounded-lg"
                      >
                        <div className="flex items-center justify-start flex-row-reverse">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                            A
                          </div>
                          <div className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
                            <div>{msg.message}</div>
                            <div className="absolute w-[200px] text-right text-xs bottom-0 right-0 -mb-5 text-gray-500">
                              {msg.name} {msg.send_date}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // 왼쪾 다른 사용자 메시지 출력 영역
                      <div
                        key={index}
                        className="col-start-1 col-end-8 p-3 rounded-lg"
                      >
                        <div className="flex flex-row items-center">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                            A
                          </div>
                          <div className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl">
                            <div>{msg.message}</div>
                            <div className="absolute w-[200px] text-xs bottom-0 left-0 -mb-5 text-gray-500">
                              {msg.name} {msg.send_date}
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* 메시지 입력 및 보내기 영역 */}
            <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
              {/* 파일첨부버튼영역 */}
              <div>
                <button className="flex items-center justify-center text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                  </svg>
                </button>
              </div>

              {/* 메시지 입력요소 영역 */}
              <div className="flex-grow ml-4">
                <div className="relative w-full">
                  <input
                    type="text"
                    name={message}
                    value={message}
                    onChange={e => {
                      setMessage(e.target.value);
                    }}
                    className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                  />
                </div>
              </div>

              {/* 메시지 전송버튼 영역 */}
              <div className="ml-4">
                <button
                  type="button"
                  onClick={sendMessage}
                  className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
                >
                  <span>Send</span>
                  <span className="ml-2">
                    <svg
                      className="w-4 h-4 transform rotate-45 -mt-px"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
