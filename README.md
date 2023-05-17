# WEB

## todo


## spec
- TailwindCSS
- daisyUI
- NextJS
- React Hook Form
- Typescript
- NextAuth

### Chat ([reference](https://github.com/mayooear/gpt4-pdf-chatbot-langchain))
- [Langchain](https://hwchase17.github.io/langchainjs/docs/overview)
- [Pinecone](https://docs.pinecone.io/docs/overview)
- [OpenAI](https://platform.openai.com/docs/api-reference/introduction)


## stage
## 기능
- 로그인
   - 구글
- 권한별 접근
   - 플랜별
- 전문 분야 데이터 긁어오기(새로 업데이트된 데이터 반영)
   - 크롤링
      - 채널 정보(이름, 대표 이미지, 설명 등)
      - 콘텐츠 정보(제목, 썸네일 이미지, 작성자, 작성일, 요약, 내용)
- 피드 방식 데이터 리스팅
- 데이터 상세하게 보여주기
- 공유, 저장 기능(SNS, 타사 서비스 등)

## 페이지

### 추후 
- 입력된 보고서들 학습
- vector store 비교후 변경 여부 결정(Pinecone -> Supabase)
- 보고서 수정 사항 발생시 어떻게 vector store와 embed model에 적용할지
- pdf 임베딩 비용 계산(많은 데이터를 넣으면 비용이 커질 수 있음)
- 테스트, 인프라 등 제품 안정성
- 해당 보고서에 내용이 없으면 다른 보고서에서 내용 찾기 -> 가능할 듯([Pinecone namespace 찾기 -> index 에서 찾기](https://docs.pinecone.io/docs/namespaces)) -> 불가(https://community.pinecone.io/t/clarification-on-how-namespaces-work/609/3)
- chat history 개선(langchain memory, memory storage)

## 이슈
- chat: en -> en, ko -> ko 언어를 안정적으로 답변


## TODO
- 북마크 페이지에서 북마크 해제시 없어지도록
- 보고서 추가, 자동화
- CSS(로그아웃, 버튼 로딩시 클릭 비활성화 - 온보딩, 보고서 생성)
- gpt 개선: fewShotPrompt로 리포트 요약을 넣어줘보자
1. pinecone에 넣을 때, 메타 데이터로 미디어, 제목, 페이지, 총 페이지 수 넣기
1-1. 벡터 데이터에 쿼리해보기(메타 데이터 정보도 가져오는지)
2. 사용자가 질문 했을 때, 답변 없으면 'blank'와 같은 짧은 텍스트만 내뱉게 하고, 
메타 데이터 필터링 제거하고 다시 검색
3. 출처는 어느 미디어의 어느 보고서의 몇번째 페이지인지 명시

TODO: 
- 프롬프트 수정: 답변만 잘나오도록
- 요약/faq/태그 추가(기존, 신규) // TODO: 마지막 남은 리포트가 쿼리 안됨
- [x] 한자씩 출력되도록
- 페이지 로딩 개선
- 해당 보고서에서 못 찾으면 전체 보고서에서 찾기
- [x] 답변시 스크롤 아래로
- [x] 벡터스토어에 원본 저장
- 벡터 스토어에 청크 길이 길게 하나, 짧게 하나 해서 각각 두개씩 가져온다음에 gpt가 읽게 하면 성능이 올라가지 않을까? 해당 부분의 앞뒤 맥락을 파악가능하기 때문

```
요약
Please summarize the document into 500~550 characters in english.
```

```
자주하는 질문
Please provide a list of 5 key topics for FAQ extracted from the document, ensuring that your response is in English and formatted as shown in the example: ["key topic 1", "key topic 2", ...]. Note that responses in languages other than English will not be accepted.
```

```
키워드
Please create a list of keywords for search extracted from the document, ensuring that your response is in English and formatted as shown in the example: ["keyword 1", "keyword 2", ...]. Note that responses in languages other than English will not be accepted.
```