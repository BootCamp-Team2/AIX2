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
- MBTI 뿐만 아니라 에니어그램을 통해서도 상대를 추천해주는 것이 어떨까...?!
    - MBTI만으로 추천하기에는 너무 적다.
    - MBTI와 에니어그램의 성향이 겹치지는 않을까?!

#### 2025-01-07
- MBTI 말고도 다른 요소 추가하여 추천의 폭을 넓혔습니다.
    - 추가한 항목 : 
        - 성별(남성/여성)
        - 신장(작음/평균/큼)
        - 외모(귀여움, 매력적, 활기참, 미소, 단아함, 청순함, 중성미, 카리스마, 스포티, 패션감각) [최대 3개 중복가능]
            - 유저가 선호하는 외모 선택할때, "상관없음" 할 시에 전원 체크!! ( 따로 상관없음 만들지 않겠습니다. )
                - 상관없음 선택 추가여부 판단 필요있어보임 ( !! )
    - mySQL 데이터베이스 테이블 구조변경하고 테스트 진행했습니다. ( 테이블이름: idealTable )
        - 테이블 구조 : 
            - userUID(char): 각 유저가 가지는 고유번호
            - myGender(varchar): 유저 성별
            - recommendGender(varchar): 추천하는 성별
            - myMBTI(varchar): 유저 MBTI
            - recommendMBTI(JSON): 추천하는 MBTI
            - myHeight(varchar): 유저 신장
            - favoriteHeight(varchar): 선호하는 신장
            - myAppearance(JSON): 유저 외모
            - favoriteAppearance(JSON): 선호하는 외모
    - faiss_main.py & database.py 파일 수정했습니다.
        - faiss_main.py : 사용자에게 적합한 상대 추천
        - database.py : MySQL 서버의 idealType 테이블과 연동하여 fastAPI로 사용자의 데이터를 추가 및 수정
    - 테스트 데이터 100개 
        - idealType_100_***.sql 파일 참고바람

- 개선해야할 사항
    - MBTI 궁합은 서로 간의 MBTI 연관이 있었기에 단방향으로 (나의 recommendMBTI -> 상대방의 myMBTI) 해도 무관했으나, 키와 외모는 연관성이 전혀 없음.
    - 키와 외모는 단방향이 아닌 양방향으로 잡아줘야하나?? (나의 favoriteHeight -> 상대방의 myHeight) + (상대방의 favoriteHeight -> 나의 myHeight).
        - 멘토님 조언 : 여유롭게 50~100개 정도 추천뽑아서 나의 특성과 상대가 원하는 특성이 가까운 순서대로 재정렬한 뒤에 추천해주기.

#### 2025-01-08
- 테스트용으로 mySQL 데이터 500개로 늘림
- 01-07 개선해야할 사항 구현완료함.
    - 재정렬하게 되면, 유사도 검색에 대한 정렬이 틀어질 위험이 있다고 판단하여, 다른 방법으로 정렬함
        - 패널티 부여! - 유클리드 거리는 값이 짧을수록 유사도가 큼
            - 패널티 부여 방식: 기본 점수 + 0.1 (추가점수)
            - 사용자의 myHeight가 측정된 다른 사용자의 favoriteHeight와 일치하지 않으면, -> 패널티 부여! (즉, 추가점수 부여함)
            - 사용자의 myAppearance가 측정된 다른 사용자의 favoriteAppearance에 단 한 개라도 포함되어 있지 않는다면, -> 패널티 부여! (즉, 추가점수 부여함)

### 접속주소:포트
- database.py
- 192.168.1.2:8002 (NETWORK: AI_EDU_401 5G)