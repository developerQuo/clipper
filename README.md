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

#### 추후 결제 요망
- [supabase](https://supabase.com/pricing)