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