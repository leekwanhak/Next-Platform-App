import { useState, useEffect } from 'react';
import { IBlogFile } from '@/interfaces/blog';

const Gallary = () => {
  //모델타입과 프롬프트 상태값 정의하기
  //객체를 사용하지 않고 원시타입으로 단일 state를 사용한다???
  const [model, setModel] = useState<string>('dall-e-3'); //dall-e-3로 초기화  -> 실제 백엔드로 전달되는 값임 //콤보박스에서 전체보기 이런건 어떻게 하지????????

  const [prompt, setPrompt] = useState<string>(''); //빈 문자열로 prompt로 초기화

  //이미지정보 목록 상태값 정의
  const [fileList, setFileList] = useState<IBlogFile[]>([]); //목록을 배열로 받나????????????????????????????

  //최초로 화면이 렌더링되는 마운팅 시점(최초1회)에서 백엔드 API 호출하기
  useEffect(() => {
    //최초 화면이 표시되는 시점에 백엔드 API에서 이미지 목록을 가져오기
    getBlogFiles();
  }, []);

  //백엔드에서 이미지 목록 데이터를 가져오는 비동기함수 기능정의 //함수정의는 그냥 function 하면 되는데 비동기로 할려고 async 붙임
  //useEffect에서는 비동기함수(async)를 쓸 수가 없으므로 함수를 따로 만들어서 호출해야함
  async function getBlogFiles() {
    //function쓰면 화살표 함수 쓰면 안되는 거?????????????????????????
    //fetch함수를 통해 백엔드 DALLE API 호출하기
    const response = await fetch('http://localhost:5000/api/openai/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify({
      //   model,
      //   prompt,
      // }),   //프론트에서 보내는게 없으므로 필요없음
    });

    const resultData = await response.json(); //응답데이터를 JSON으로 변환
    console.log('백엔드에서 전달해준 결과값 확인: ', resultData);

    setFileList(resultData.data);
  }

  //이미지 생성요청 함수
  const gernerateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //기본동작 방지

    //fetch함수를 통해 백엔드 DALLE API 호출하기
    const response = await fetch('http://localhost:5000/api/openai/dalle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
      }),
    });

    const resultData = await response.json(); //응답데이터를 JSON으로 변환
    console.log('백엔드에서 전달해준 결과값 확인: ', resultData);

    //파일목록 데이터 조회 출력하기 //최초로 로딩했을 때도 불러오지만 이미지를 새로 생성할때도 계속해서 불러와줌
    await getBlogFiles();

    //이미지 생성 후 프롬프트 모델 선택값 초기화 처리 해주기
    setPrompt(''); //입력창 초기화
    setModel('dall-e-3'); //모델 초기화
  };

  return (
    <div className="bg-white">
      <div className="mx-auto mt-8 max-w-7xl overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="m-5 text-center">
          <h1 className="text-2xl font-bold">생성형 이미지 활용하기</h1>
        </div>
        <form className="flex" onSubmit={gernerateSubmit}>
          <select
            id="model"
            name="model"
            value={model}
            onChange={e => {
              setModel(e.target.value);
            }}
            className="block w-[250px] rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
          >
            <option value="dall-e-2">Dalle.2</option>
            <option value="dall-e-3">Dalle.3</option>
          </select>
          <input
            id="prompt"
            name="prompt"
            value={prompt}
            onChange={e => {
              setPrompt(e.target.value);
            }}
            type="text"
            className="block ml-4 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
          <button
            type="submit"
            className="rounded-md ml-4 bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Generate
          </button>
        </form>

        {/* 이미지 파일 목록 영역 */}
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          {fileList.map((file, index) => (
            <a href="#" className="group text-sm" key={index}>
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                <img
                  src={file.file_path}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <h3 className="mt-4 font-medium text-gray-900">
                {file.contents}
              </h3>
              <p className="italic text-gray-500">{file.title}</p>
              <p className="mt-2 font-medium text-gray-900">
                {file.reg_member_name}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallary;
