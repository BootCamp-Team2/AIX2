import pandas as pd
import mysql.connector
import faiss
import numpy as np
import json

# 원핫인코딩 함수
mbti_types = [
    "INTJ", "INFP", "ENTP", "ESFP", "ISTJ", "ENFJ", "INFJ", "ISFP",
    "ENTJ", "ESFJ", "INTP", "ESTP", "ISFJ", "ESTJ", "ENFP", "INFE"
]

def mbti_to_onehot(mbti, mbti_types=mbti_types):
    vector = [1 if mbti == t else 0 for t in mbti_types]
    return vector

def mbti_list_to_one_hot(mbti_list, mbti_types=mbti_types):
    combined_vector = np.zeros(len(mbti_types), dtype=int) # 빈 벡터 생성 - 전부 0
    for mbti in mbti_list:
        single_vector = mbti_to_onehot(mbti, mbti_types)
        combined_vector = np.maximum(combined_vector, single_vector)  # 합집합 처리
    return combined_vector.tolist()

def fetch_mbti_data(userUID):
    # MySQL Server 연결
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="AIX2_1234",
        database="myMBTIDatabase"
    )
    
    cursor = conn.cursor()
    
    # 해당 유저의 행 뽑아오기
    query_row = "SELECT * FROM mbtiTable WHERE userUID = %s"
    cursor.execute(query_row, (userUID, ))
    results_user = cursor.fetchall()
    
    if not results_user:
        raise Exception(f"존재하지 않는 userUID 입니다. [ userUID >> {userUID} ]")
    
    # for row in results_user:
    #     print(row)
    
    query_row = "SELECT * FROM mbtiTable WHERE userUID != %s"
    cursor.execute(query_row, (userUID, ))
    results_others = cursor.fetchall()
        
    # for row in results_others:
    #     print(row)

    cursor.close()
    conn.close()
    
    user_df = pd.DataFrame(results_user, columns=["userUID", "myMBTI", "recommendMBTI"])
    others_df = pd.DataFrame(results_others, columns=["userUID", "myMBTI", "recommendMBTI"])
    
    return user_df, others_df

def process_data(userUID):
    user_df, others_df = fetch_mbti_data(userUID)
    # print(user_df.head()); print(others_df.head())

    user_df["recommendMBTI"] = user_df["recommendMBTI"].apply(lambda x: json.loads(x))
    others_df["recommendMBTI"] = others_df["recommendMBTI"].apply(lambda x: json.loads(x))
    # print(user_df.head()); print(others_df.head())
    
    user_df["myMBTI"] = user_df["myMBTI"].apply(mbti_to_onehot)
    user_df["recommendMBTI"] = user_df["recommendMBTI"].apply(mbti_list_to_one_hot)

    others_df["myMBTI"] = others_df["myMBTI"].apply(mbti_to_onehot)
    others_df["recommendMBTI"] = others_df["recommendMBTI"].apply(mbti_list_to_one_hot)
    # print(user_df.head()); print(others_df.head())

    # FAISS를 위한 벡터리스트로 변환
    user_recommendMBTI_vectors = np.array(user_df["recommendMBTI"].tolist(), dtype=np.float32)
    others_myMBTI_vectors = np.array(others_df["myMBTI"].tolist(), dtype=np.float32)

    # 벡터 정규화
    faiss.normalize_L2(user_recommendMBTI_vectors)
    faiss.normalize_L2(others_myMBTI_vectors)

    # FAISS 인덱스 생성
    index = faiss.IndexFlatL2(user_recommendMBTI_vectors.shape[1])
    index.add(others_myMBTI_vectors)
    
    # 유사도 측정 - 최대 5개
    distances, indices = index.search(user_recommendMBTI_vectors, k=5)#others_myMBTI_vectors, k=5)
    # similar_users = [others_myMBTI_vectors[i] for i in indices[0]]
    # print("유사한 벡터:", similar_users)

    # 최종결과 - 인덱스로 userUID 매핑
    similar_userUIDs = [others_df["userUID"][i] for i in indices[0]]
    # print("유사한 userUIDs:", similar_userUIDs)
    
    return similar_userUIDs

# 임시로 유저UID 다음과 같이 지정
def main(userUID):
    try:
        recommend_result = process_data(userUID)
        print(f"추천된 사용자들: {recommend_result}")
    except Exception as e:
        print(f"오류: {e}")
    
if __name__ == "__main__":
    main("0069994997")
    # main("김시현") # 존재하지 않는 userUID 테스트