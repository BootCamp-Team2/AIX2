## Content-Based Filtering

### 구현내용
#### 2025-01-03
- 테스트 해보기 위해 사용자의 userUID, myMBTI, recommendMBTI 구조의 데이터베이스 설계 ( MySQL )
    - MySQL는 수동으로 Workbench에서 테이블 만들었습니다.
- database.py (MySQL 서버 연동 및 데이터 수정) - fastAPI
- faiss_main.py & test.ipynb - faiss 이용한 추천시스템 구현