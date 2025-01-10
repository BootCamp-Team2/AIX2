"# AIX2" 
## !!! openai 필독 !!!
### 시스템 환경
    - python 3.12.8
    - CUDA 11.8 cuDNN 8.9
    - torch 2.5.1
    - torochvisioon
    - torchaudio
    - requirements.txt 참조
### .env 파일 목록
    - OpenAI API Key
    - Chat Bot Key 2 가지
    - Dating Coach Key

## !! ComfyUI 필독 !!
### 시스템 환경
- Python 3.12.7
- CUDA 11.8 + cuDNN 8.9
- torch 2.2.2 + cu118
- torchvision 0.17.2 + cu118
- torchaudio 2.2.2 + cu118

### custom_nodes 파일 누락
- 압축 해제 후 ComfyUI/ 넣어주세요.
    - GoogleDrive: https://drive.google.com/file/d/1caJP2d2uUQjB08fHENysp0q3zjs46CjL/view?usp=drive_link

### Model 각 다운로드 주소 및 경로위치
- ComfyUI/models/checkpoints
    - detailAsianRealistic: https://civitai.com/models/150169/detail-asian-realistic
    - revAnimated: https://civitai.com/models/7371/rev-animated

- ComfyUI/models/loras\
    - D. Backgrounds: https://civitai.com/models/798394/d-backgrounds-or-dadadala

- 나머지 모델들은 폴더 다운로드 후 ComfyUI/ 붙여넣기
    - GoogleDrive: https://drive.google.com/drive/folders/1Yvv0IBVl4jPMqtdHe-w_FWrTQxKOoOrO?usp=sharing

### 접속주소:포트
- model_run.py
- 192.168.1.2:8001 (NETWORK: AI_EDU_401 5G)

### 업데이트 일자 및 내용
#### 2025-01-10
- ComfyUI 모듈 실행하는 fastAPI 서버를 여러 대 작동시켜야 함.
    - 일일이 포트 변경해가면서 열어야 합니다.
- 놀고있는 서버를 찾아 연결 시켜주는 메인 fastAPI 서버 새롭게 만들었습니다. (control_server.py)
- React와 변경작업 연동 했습니다. Front-end 쪽 commit 작업 내용 확인바람.