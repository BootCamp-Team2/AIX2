from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import importlib.util
import os
import uuid
import shutil

import os
os.environ['KMP_DUPLICATE_LIB_OK']='True'

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.1.12:8081"],  # React 개발 서버 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INPUT_FOLDER = "./input"
OUTPUT_FOLDER = "./output"
os.makedirs(INPUT_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# 정적 파일 폴더 설정
app.mount("/input", StaticFiles(directory=INPUT_FOLDER), name="input")
app.mount("/output", StaticFiles(directory=OUTPUT_FOLDER), name="output")

# 허용할 파일 확장자
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "jfif"}

# my_avatar 모델 불러오기
module_name = "my_avatar"
module_path = os.path.join("custom_nodes", "ComfyUI-to-Python-Extension", "nodes", "my_avatar.py")
spec = importlib.util.spec_from_file_location(module_name, module_path)
avatar_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(avatar_module)

# detail_sim_model 모델 불러오기
module_name = "detail_sim_model"
module_path = os.path.join("custom_nodes", "ComfyUI-to-Python-Extension", "nodes", "detail_sim_model.py")
spec = importlib.util.spec_from_file_location(module_name, module_path)
idealType_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(idealType_module)

@app.post("/avatar/uploads/")
async def createMyAvatar(img: UploadFile = File(...), gender: str = Form(...)):
    # 고객 uuid 대체용 임시 테스트
    personal_uuid = uuid.uuid4()
    
    try:
        if not allowed_file(img.filename):
            raise HTTPException(status_code=400, detail="지원하지 않는 이미지 형식입니다.")
        ext = os.path.splitext(img.filename)[1]
        
        folder_path = os.path.join(INPUT_FOLDER, f"{personal_uuid}")
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
            
        uid_img = f"avatar_1{ext}"
        img_path = os.path.join(folder_path, uid_img)
        with open(img_path, "wb") as f:
            f.write(await img.read())
            
        avatar_module.main(uid_img, personal_uuid, gender)
        result_path = f"./output/avatar_{personal_uuid}_00001_.jpg"
            
        new_file_director = f"./output/{personal_uuid}"
        if not os.path.exists(new_file_director):
            os.makedirs(new_file_director)
        new_file_path = os.path.join(new_file_director, "myAvatar.jpg")
        
        shutil.move(result_path, new_file_path)
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
    
    return {
        "message": "Images uploaded successfully",
        "result_path": new_file_path,
        "avatarUrl": f"http://192.168.1.2:8001/output/{personal_uuid}/myAvatar.jpg"
    }
    
@app.post("/sim/create/")
async def createMyLover(ideal_type: str = Form(...)):
    # 고객 uuid 대체용 임시 테스트
    personal_uuid = uuid.uuid4()
    censor_list = ["노출", "호텔", "모텔", "알몸" , "야한얼굴", "야하다", "에로", "선정적", "음란"
                   , "변태", "야동", "포르노", "성적", "장애", "살인", "테러", "자살", "타살", "학대"
                   , "약물", "마약", "흑인"]
    
    try:
        for word in censor_list:
            if word in ideal_type:
                raise HTTPException(status_code=400, detail="금지 단어가 포함되어 있습니다.")
            
        idealType_module.main(ideal_type, personal_uuid)
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
    
    
    return {
        "message": "Your Requested prompt successfully",
        "Request Prompt": f"{ideal_type}"
    }

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("model_run:app", host="192.168.1.2", port=8001)