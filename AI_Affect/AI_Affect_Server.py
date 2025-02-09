from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Form
from typing import List
from openai import OpenAI
from datetime import datetime

import os
import re
import json
import aiohttp
import asyncio

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI()

async def call_openai_api(myName: str, messages: list) -> str:
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    request_messages = [
        {
            "role": "system",
            "content": f'''
                ## Role
                - 너는 연애 전문가야

                ## Task
                - 두 사용자의 대화를 보고 분석해서 현재 두 사람의 연애상대로서의 점수를 평가해줘.
                - 0점에서 100점 사이로 평가. (판단하기에 중간 사이인 것 같고, 애매하다 그러면 1점으로 상세하게 점수부여)
                - 점수에 가장 크게 기여한 대화내용과 그렇게 점수를 평가한 이유도 알려줘.
                - 앞으로 어떤 대화 스타일을 이어가면 좋을지도 추천해줄래??
                
                ## Response Example
                [score]: ~~~

                [key_conversation]
                A: ~~~~~~
                B: ~~~~~~
                ...

                [reason]: ~~~~

                [recommendation]: ~~~~~~~

                ## TIP
                - 최근에 대화한 내용에 좀 더 초점을 두고 평가해줘. 물론! 전에 했던 대화내용을 반영하지 말라는 소리는 아니야

                결과물을 JSON 형태로 출력해줘. key_conversation 내용은 JSON으로 출력하지마.
                내 이름은 {myName} 인데, 대화내용에서 이름보고 나에게 도움이되는 조언을 해줘
            '''
        }
    ]

    for msg in messages:
        if msg.get("isAnnouncement"): continue
        
        user_name = msg["user"]["name"]
        text = msg["text"]
        request_messages.append({"role": "user", "content": f"{user_name}: {text}"})
    
    payload = {
        "model": "gpt-4o",
        "messages": request_messages,
        "max_tokens": 2048
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers) as response:
            if response.status == 200:
                result = await response.json()
                return result["choices"][0]["message"]["content"]
            else:
                raise HTTPException(status_code=500, detail="OpenAI API request failed.")

@app.post("/chat/analysis")
async def conversation_analysis(myName: str = Form(...), messages: str = Form(...)):
    try:
        messages_data = json.loads(messages)
        response = await call_openai_api(myName, messages_data)
        
        response = response.replace("'", '"')
        match = re.search(r'\{.*\}', response, re.DOTALL)
        
        if match: response = match.group()

        if(response):
            print(response)
            return {"status": "success", "analysis": response}
        else:
            return {"status": "failed", "analysis": None}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {e}")
