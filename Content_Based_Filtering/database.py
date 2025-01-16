from fastapi.staticfiles import StaticFiles
import mysql.connector
import json
from fastapi import FastAPI, HTTPException, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import faiss_main2
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ASSETS_FOLDER = "./assets"
app.mount("/assets", StaticFiles(directory=ASSETS_FOLDER), name="assets")

df = None
df_origin = None
feature_list = None

# 서버 시작 시 데이터 준비
@app.on_event("startup")
async def startup_event():
    global df, df_origin, feature_list
    df_origin, df, feature_list = faiss_main2.process_data()  # 데이터 로드
    
    if df is None or df.empty:
        raise Exception("Initial data load failed.")

class idealType(BaseModel):
    userUID: str
    profileImg: str
    myGender: str
    myMBTI: str
    myHeight: str
    favoriteHeight: str
    myAppearance: List[str]
    favoriteAppearance: List[str]
    
def generate_recommend(userIdeal):
    recommend_gender = {
        "남성": "여성",
        "여성": "남성"
    }
    
    recommend_MBTI = {
        "ESTJ": ["ISFP", "ISTP"],
        "ESTP": ["ISFJ", "ISTJ"],
        "ESFJ": ["ISFP", "ISTP"],
        "ESFP": ["ISFJ", "ISTJ"],
        "ENTJ": ["INFP", "INTP"],
        "ENTP": ["INFJ", "INTJ"],
        "ENFJ": ["INFP", "ISFP"],
        "ENFP": ["INFJ", "INTJ"],
        "ISTJ": ["ESFP", "ESTP"],
        "ISTP": ["ESFJ", "ESTJ"],
        "ISFJ": ["ESFP", "ESTP"],
        "ISFP": ["ENFJ", "ESFJ", "ESTJ"],
        "INTJ": ["ENFP", "ENTP"],
        "INTP": ["ENTJ", "ESTJ"],
        "INFJ": ["ENFP", "ENTP"],
        "INFP": ["ENTJ", "ESTJ"],
    }
    
    favorite_Appearance = {
        "상관없음": ["귀여움", "매력적", "활기참", "미소", "단아함", 
                 "청순함", "중성미", "카리스마", "스포티", "패션감각"]
    }
    
    return recommend_gender.get(userIdeal.myGender, ""), recommend_MBTI.get(userIdeal.myMBTI, []), favorite_Appearance.get(userIdeal.favoriteAppearance[0], userIdeal.favoriteAppearance)
    
# MySQL Server 연결
def get_db_connection():
    return mysql.connector.connect(
        host="192.168.1.4",
        user="root",
        password="AIX2_1234",
        database="idealDatabase"
    )
    
@app.post("/settings/ideal")
def create_or_update_mbti(idealType: idealType):
    # print(f"Received data: userUID={mbti.userUID}, myMBTI={mbti.myMBTI}, recommendMBTI={mbti.recommendMBTI}")
    # print(type(mbti.recommendMBTI))
    conn = get_db_connection()
    cursor = conn.cursor()

    recommendGender, recommendMBTI, favoriteAppearance = generate_recommend(idealType)
    recommendMBTI_json = json.dumps(recommendMBTI)
    myAppearance_JSON = json.dumps(idealType.myAppearance)
    favoriteAppearance_JSON = json.dumps(favoriteAppearance)
    
    try:
        cursor.execute("SELECT * FROM idealTable WHERE userUID = %s", (idealType.userUID, ))
        existing_record = cursor.fetchone()
        
        # userUID 통해서 데이터가 이미 존재한다면, 수정
        if existing_record:
            cursor.execute("""UPDATE idealTable SET profileImg = %s, myGender = %s, myMBTI = %s, recommendGender = %s, recommendMBTI = %s,
                           myHeight = %s, favoriteHeight = %s, myAppearance = %s, favoriteAppearance = %s WHERE userUID = %s""",
                           (idealType.profileImg, idealType.myGender, idealType.myMBTI, recommendGender, recommendMBTI_json, idealType.myHeight, 
                            idealType.favoriteHeight, myAppearance_JSON, favoriteAppearance_JSON, idealType.userUID))
            message = "Data Updated Successfully"
            
        # 없다면, 생성
        else:
            cursor.execute("""INSERT INTO idealTable (userUID, profileImg, myGender, myMBTI, recommendGender, recommendMBTI, 
                           myHeight, favoriteHeight, myAppearance, favoriteAppearance) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                           (idealType.userUID, idealType.profileImg, idealType.myGender, idealType.myMBTI, recommendGender, recommendMBTI_json, 
                            idealType.myHeight, idealType.favoriteHeight, myAppearance_JSON, favoriteAppearance_JSON))
            message = "Data Inserted Successfully"
            
        conn.commit()
        return {"message": message}
        
    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Error: {e}")
    
    finally:
        cursor.close()
        conn.close()
        
@app.post("/recommend")
async def recommendUser(uid: str = Form(...)):
    result = faiss_main2.main(df_origin, df, feature_list, uid)
    return {
        "recommend": result
    }
    
@app.post("/getMyInfo")
async def getMyInfo(uid: str = Form(...)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM idealTable WHERE userUID = %s", (uid, ))
        find_user = cursor.fetchone()
        
        # JSON 컬럼 변환
        for key, value in find_user.items():
            # JSON 형식일 가능성이 있는 값을 처리
            if isinstance(value, str) and value.startswith("[") or value.startswith("{"):
                try:
                    find_user[key] = json.loads(value)
                except json.JSONDecodeError:
                    pass  # JSON으로 파싱되지 않으면 그대로 둡니다
        
        find_user_json = json.dumps(find_user, ensure_ascii=False)
        
        if not find_user:
            raise HTTPException(status_code=400, detail=f"Not UserData: {e}")
        
        return {"userInfo": find_user_json}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {e}")
    
    finally:
        cursor.close()
        conn.close()
            
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("database:app", host="192.168.1.4", port=2000)