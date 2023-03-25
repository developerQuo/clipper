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
- 홈(투데이): 구독한 채널들 최신 콘텐츠
- Read Later: 나중에 읽을 콘텐츠
- 채널 그룹: 채널별 피드 리스팅(전체도 포함)
- 채널 그룹 생성, 수정, 삭제
- 채널: 특정 채널 피드 리스팅
- 채널 생성, 수정, 삭제
- 콘텐츠 리스팅
- 콘텐츠 상세 페이지
- 채널 정보 리스팅
- 채널 정보 상세 페이지
- 회원 정보 변경
- 구독한 채널 관리
- ~~대시보드(나만의 콘텐츠 모음집)~~


## 보고서 알림 요약 & Chat 서비스
- 주요 미디어 보고서 긁어오기(매일)
   - RSS: 보고서를 rss로도 제공하는가? 사이트의 pdf를 DB로 받아오는 방법
   - 저장 여부: pdf 파일을 우리가 저장해야 하는 것인가?
   - 주기적으로 실행
- 1. pdf 요약 -> Chatgpt가 기억하게 하기
- 2. pdf를 ChatGPT에 입력
   - 토큰 제한에 걸리지 않는지? 만약 그렇다면 용량 제한? 어떻게 해결?
- pdf별 대화 가능하게
- 보고서 내용에 대한 답변을 ChatGPT가 해주기
- 번역 매끄럽게
- 여러개의 pdf들이 chat을 열 수 있게
- 로그인 유저별 북마크, 대화기록 유지
- cloud file system(pdf 파일 로드)
- pdf viewer에서 pdf 페이지가 너무 많으면 피드형식으로 로딩 필요. 한번에 로드하면 부하가 커짐

### 추후 
- 입력된 보고서들 학습
- vector store 비교후 변경 여부 결정(Pinecone -> Supabase)
- 보고서 수정 사항 발생시 어떻게 vector store와 embed model에 적용할지
- pdf 임베딩 비용 계산(많은 데이터를 넣으면 비용이 커질 수 있음)
- 테스트, 인프라 등 제품 안정성
- 해당 보고서에 내용이 없으면 다른 보고서에서 내용 찾기 -> 가능할 듯([Pinecone namespace 찾기 -> index 에서 찾기](https://docs.pinecone.io/docs/namespaces))

## 이슈
- chat: en -> en, ko -> ko 언어를 안정적으로 답변

#### 추후 결제 요망
- [supabase](https://supabase.com/pricing)