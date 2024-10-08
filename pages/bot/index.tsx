//사용자간 기초 채팅기능구현 컴포넌트
import { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import { IMessage } from '@/interfaces/message';

//채팅 클라이언트 socket객체 참조하기
import { socket } from '@/library/socket';

//챗봇 컴포넌트 정의
const Bot = () => {
  //라우터 객체 생성
  const router = useRouter();

  //현재 사용자 고유번호 상태값 정의
  const [memberId, setMemberId] = useState<number>(1); //현재 사용자 고유번호 상태값 정의(현재 사용자가 1번이라고 가정)

  //채팅 메시지 입력 요소 바인딩 텍스트 상태값 정의
  const [message, setMessage] = useState<string>(''); //메시지 입력값 상태값 정의

  //채팅 메시지 목록(채팅이력정보) 상태값 정의하기
  const [messageList, setMessageList] = useState<IMessage[]>([]);

  //최초 1회 화면이 렌더링되는 시점(마운팅되는 시점)에 실행되는 useEffect 함수
  //프로젝트 루트에 next.config.mjs파일 내 reactStrictMode(엄격모드)값을 false로 변경해야만 1회만 작동함
  //useEffect 훅은 CSR환경에서 작동되고 useRouter 훅은 SSR/CSR순서로 2번작동됨.-> 서로 궁합이 맡지 않아서 사용자 고유번호가 콘솔에 undefined로 찍힘
  //useEffect훅에서 useRouter훅 이용해 URL 키값이 추출안되는 문제는 useRouter.isReady값을 이용해 해결가능
  //useRouter.isReady값이 기본은 false->true로 변경되는 시점에 관련 기능 구현하면됨.. //useRouter를 쓸 수 있는지 없는지를 알려주는 것임 최초에는 false였다가 true로 바뀜

  useEffect(() => {
    console.log('현재 URL주소에서 사용자 고유번호 추출하기:', router.query.id);
    //URL주소를통해 사용자 고유번호가 전달된 경우에만 실행
    if (router.query.id != undefined) {
      //현재 사용자 고유번호 상태값 설정해주기
      setMemberId(Number(router.query.id)); //문자열로 넘어오는 데이터값을 Number()함수를 이용하여 숫자열로 바꿔줌
    }
  }, [router.isReady]); //빈배열일 때는 최초 마운트시에 실행되는 것이고 배열안에 값이 들어 있으면 그 값이 변경될 때마다 실행됨(false->true로 변경되는 시점에 실행됨) //1.최초 실행 undefined, 2. router값이 변경될 때2번(파라미터, 쿼리)

  //최초 1회 화면이 렌더링되는 시점(마운팅되는시점)에 실행되는 useEffect함수
  //프로젝트 루트에 next.config.mjs파일내 reactStrictMode(엄격모드)값을 false로 변경해야 정확히 1회만 실행됨
  //채팅서버와 연결되는 클라이언트 채팅 소켓 객체 생성 및 각종 채팅 이벤트 기능 구현영역
  useEffect(() => {
    //최초 화면이 렌더링되는 시점(최초1회)에 서버소켓 연결하기
    socket.connect(); //클라이언트 소켓과 서버 소켓이 연결을 시도함

    //서버소켓과 연결이 완료되면 실행되는 이벤트처리함수
    //서버 소켓과 연결이 완료되면 자동으로 client 소켓에서connect이벤트가 실행되고
    //connect이벤트가 실행되면 처리할 이벤트 처리할 기능 구현
    //소켓 시스템 이벤트
    socket.on('connect', () => {
      //연결이 되면 작동할 기능을 구현하는 영역
      console.log('서버소켓과 연결되었습니다.');
    });

    //disconnect 이벤트는 서버소켓이 끊어진경우 발생하는 이벤트
    //서버와의 연결소켓이 끊어진 경우 처리할 기능을 핸들러함수에서 처리합니다.
    //소켓 시스템 이벤트
    socket.on('disconnect', () => {
      console.log('서버소켓과 연결이 끊어졌습니다.');
    });

    //개발자 정의 클라이언트 소켓 이벤트 수신기 정의하기
    //socket.on('클라이언트 이벤트 수신기명',서버에서 전달해준 데이터를 받는함수정의);
    socket.on('gptMessage', function (msg: IMessage) {
      console.log('서버소켓에서 전달된 데이터 확인 - receiveAll: ', msg);
      setMessageList(prev => [...prev, msg]); //messageList를 바꿔주려면 setMessageList를 사용하고 setter함수를 이용하여 UI를 갱신해줌?????????????????????????????????????????/
    });

    //해당 채팅 컴포넌트가 화면에서 사라질 때 (언마운팅시점)
    //소켓관련 이벤트를 모두 제거해줘야합니다. 그렇지 않으면 메시지를 여러번 수신할 수 있음.
    return () => {
      //socket.off(클라이언트 이벤트 수신기명); //이벤트 제거
      socket.off('connect');
      socket.off('disconnect');
      socket.off('receiveAll'); //???????????????????
    };
  }, []);

  //웹소켓은 텍스트를 주고 받는 것 - json도 텍스트임(단일 객체), 더 많은 데이터를 담고 있는
  //webRTC 영상, 음성, 파일 전송 가능 더 무거운 데이터를 전송할 때 사용
  //채팅 메시지 전송 이벤트 처리함수
  const sendMessage = () => {
    //채팅서버소켓(백엔드 서버)으로 메시지를 전송한다.

    const msgData = {
      member_id: memberId,
      name: `사용자-${memberId.toString()}`,
      profile: `http://localhost:5000/img/user${memberId.toString()}.png`,
      message: message,
      send_date: Date.now().toString(),
    };

    //socket.emit('백앤드 서버 이벤트명', 전송할데이터객체)
    //채팅서버소켓으로 메시지 전송
    socket.emit('gpt', msgData);

    //메시지 입력박스 초기화
    setMessage('');
  };

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

export default Bot;
