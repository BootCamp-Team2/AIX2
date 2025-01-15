from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import importlib.util
import os
import uuid
import shutil
import httpx

import os
os.environ['KMP_DUPLICATE_LIB_OK']='True'

app = FastAPI()

SERVER_HOST = "127.0.0.1"
SERVER_PORT = "8000"

@app.middleware("http")
async def detect_server_info(request: Request, call_next):
    global SERVER_HOST, SERVER_PORT
    server = request.scope.get("server", None)
    if server:
        SERVER_HOST = server[0]
        SERVER_PORT = server[1]
    response = await call_next(request)
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.1.30:8081"],  # React 개발 서버 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INPUT_FOLDER = "./input"
OUTPUT_FOLDER = "./output"

# 정적 파일 폴더 설정
app.mount("/input", StaticFiles(directory=INPUT_FOLDER), name="input")
app.mount("/output", StaticFiles(directory=OUTPUT_FOLDER), name="output")

# detail_sim_model 모델 불러오기
module_name = "detail_sim_model"
module_path = os.path.join("custom_nodes", "ComfyUI-to-Python-Extension", "nodes", "detail_sim_model.py")
spec = importlib.util.spec_from_file_location(module_name, module_path)
idealType_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(idealType_module)
    
@app.get("/get/ip")
def getServerIP():
    return {"server-ip": f"{SERVER_HOST}", "server-port": f"{SERVER_PORT}"}

@app.post("/sim/create")
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
        result_path = f"./output/idealType_{personal_uuid}_00001_.jpg"
            
        new_file_director = f"./output/{personal_uuid}"
        if not os.path.exists(new_file_director):
            os.makedirs(new_file_director)
        new_file_path = os.path.join(new_file_director, "mySimulator.jpg")
        
        shutil.move(result_path, new_file_path)
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://192.168.1.4:1000/update-status", 
                json={"server_ip": f"http://{SERVER_HOST}:{SERVER_PORT}", "status": False}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"Error: {response.text}")
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
    
    finally:
        # 모델 실행 후 메모리 해제
        import gc
        gc.collect()  # Python에서 객체들의 메모리를 수동으로 회수
        
        import torch
        if torch.cuda.is_available():
            torch.cuda.empty_cache()  # GPU 메모리 캐시 정리
    
    return {
        "message": "Your Requested prompt successfully",
        "simUrl": f"http://192.168.1.4:1000/output/{personal_uuid}/mySimulator.jpg"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("avatar_model_run:app", host="0.0.0.0", port=8000)