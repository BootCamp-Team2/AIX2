## Content-Based Filtering

### 구현내용
#### 2025-01-03
- 테스트 해보기 위해 사용자의 userUID, myMBTI, recommendMBTI 구조의 데이터베이스 설계 ( MySQL )
    - MySQL는 수동으로 Workbench에서 테이블 만들었습니다.
- database.py (MySQL 서버 연동 및 데이터 수정) - fastAPI
- faiss_main.py & test.ipynb - faiss 이용한 추천시스템 구현

#### 2025-01-06
- faiss_main.py 코드 정리 & test.ipynb 삭제
- 추천해줄때마다 MySQL에서 데이터 불러와 추천적용...
    - 개선방안을 생각해봐야할 것 같음...
- 유저에게 상대 추천해주는 것을 어떻게 할까...?
    - 추천 userUID 뽑아와서 유저 데이터베이스에 저장해야하나?
    - 음...