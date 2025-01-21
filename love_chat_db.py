from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import mysql.connector
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host="192.168.1.3",
            port=3307,
            user="lovepractice",
            password="500412!!",
            database="love_practice"
        )
        return conn
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {e}")

@app.post("/update-chat")
def update_chat(userUID: str = Form(...), patnerUID: str = Form(...), content: str = Form(...)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM userMessage WHERE sender = %s AND receiver = %s", (userUID, patnerUID))
        existing_record = cursor.fetchone()

        if existing_record:
            cursor.execute("UPDATE userMessage SET content = %s WHERE sender = %s AND receiver = %s", (content, userUID, patnerUID))
            message = "Data updated successfully"
            
        else:
            cursor.execute("INSERT INTO userMessage (sender, receiver, content) VALUES (%s, %s, %s)", (userUID, patnerUID, content))
            message = "Data inserted successfully"

        conn.commit()
        return {"message": message}
    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Error: {e}")
    finally:
        cursor.close()
        conn.close()

@app.post("/load-chat")
def load_chat(userUID: str = Form(...), patnerUID: str = Form(...)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT content FROM userMessage WHERE sender = %s AND receiver = %s",(userUID, patnerUID))
        message = cursor.fetchone()
        
        if message:
            return {"content": message}
        
        else:
            raise HTTPException(status_code=404, detail="Chat not found")
        
    except mysql.connector.Error as e:
        raise HTTPException(status_code=400, detail=f"Error: {e}")
    
    finally:
        cursor.close()
        conn.close()
        
@app.post("/chat-list")
def chat_lists(userUID: str = Form(...)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT receiver, content FROM userMessage WHERE sender = %s",(userUID, ))
        messages = cursor.fetchall()
        
        if messages:
            return {"chatLists": messages}
        
        else:
            return {"chatLists": []}
        
    except mysql.connector.Error as e:
        raise HTTPException(status_code=400, detail=f"Error: {e}")
    
    finally:
        cursor.close()
        conn.close()

# FastAPI 서버 실행
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="192.168.1.3", port=3000)
