"# AIX2" 
!!! 필독 !!!
chatbot.py의 api_key는 직접 입력하십시오 (보안관계상 일부로 빼놓았습니다)
partner_id.txt 삭제 금지
parter_id_hana.txt 와 parter_id_hwarang.txt는 어시스턴트 key값입니다
대화하고싶은 어시스턴트 설정의 key 값을 partner_id.txt에 저장하세요

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
