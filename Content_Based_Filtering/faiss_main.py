import pandas as pd
import mysql.connector
import faiss
import numpy as np
import json

## 원핫인코딩 리스트
gender_types = ["남성", "여성"]

mbti_types = [
    "INTJ", "INFP", "ENTP", "ESFP", "ISTJ", "ENFJ", "INFJ", "ISFP",
    "ENTJ", "ESFJ", "INTP", "ESTP", "ISFJ", "ESTJ", "ENFP", "INFE"
]

height_types = ["작음", "평균", "큼"]

appearance_types = [
    "귀여움", "매력적", "활기참", "미소", "단아함", 
    "청순함", "중성미", "카리스마", "스포티", "패션감각"
]

def to_one_hot(value, value_types):
    vector = [1 if value == t else 0 for t in value_types]
    return vector

def list_to_multiply_hot(value_list, value_types):
    combined_vector = np.zeros(len(value_types), dtype=int) # 빈 벡터 생성 - 전부 0
    for value in value_list:
        single_vector = to_one_hot(value, value_types)
        combined_vector = np.maximum(combined_vector, single_vector)  # 합집합 처리
    return combined_vector.tolist()

def fetch_mbti_data(userUID):
    ## MySQL Server 연결
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="AIX2_1234",
        database="idealDatabase"
    )
    
    cursor = conn.cursor()
    
    ## 해당 유저의 행 뽑아오기
    query_row = "SELECT * FROM idealTable WHERE userUID = %s"
    cursor.execute(query_row, (userUID, ))
    results_user = cursor.fetchall()
    
    if not results_user:
        raise Exception(f"존재하지 않는 userUID 입니다. [ userUID >> {userUID} ]")
    
    # for row in results_user:
    #     print(row)
    
    query_row = "SELECT * FROM idealTable WHERE userUID != %s"
    cursor.execute(query_row, (userUID, ))
    results_others = cursor.fetchall()
        
    # for row in results_others:
    #     print(row)
    
    user_df = pd.DataFrame(results_user, columns=["userUID", "myGender", "recommendGender", "myMBTI", "recommendMBTI", 
                                                  "myHeight", "favoriteHeight", "myAppearance", "favoriteAppearance"])
    others_df = pd.DataFrame(results_others, columns=["userUID", "myGender", "recommendGender", "myMBTI", "recommendMBTI", 
                                                  "myHeight", "favoriteHeight", "myAppearance", "favoriteAppearance"])
    
    ## 타입이 JSON인 feature 이름 가져오기
    query_row = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = %s AND DATA_TYPE = 'JSON'"
    cursor.execute(query_row, ("idealTable", ))
    json_columns = [column[0] for column in cursor.fetchall()]
    
    print(json_columns)
    
    cursor.close()
    conn.close()
    return user_df, others_df, json_columns

def process_data(userUID):
    user_df, others_df, json_columns = fetch_mbti_data(userUID)
    # print(user_df.head()); print(others_df.head())
    
    for feature in json_columns:
        user_df[feature] = user_df[feature].apply(lambda x: json.loads(x))
        others_df[feature] = others_df[feature].apply(lambda x: json.loads(x))
    # print(user_df.head()); print(others_df.head())
    
    feature_list = user_df.columns[user_df.columns != "userUID"]
    type_list = [gender_types, mbti_types, height_types, appearance_types]
    for i, feature in enumerate(feature_list):
        if not isinstance(user_df[feature][0], list):
            user_df[feature] = user_df[feature].apply(lambda x: to_one_hot(x, type_list[i // 2]))
            others_df[feature] = others_df[feature].apply(lambda x: to_one_hot(x, type_list[i // 2]))
        else:
            user_df[feature] = user_df[feature].apply(lambda x: list_to_multiply_hot(x, type_list[i // 2]))
            others_df[feature] = others_df[feature].apply(lambda x: list_to_multiply_hot(x, type_list[i // 2]))
    # print(user_df.head()); print(others_df.head())

    ## FAISS를 위한 벡터리스트로 변환
    user_vector_list = [feature for i, feature in enumerate(feature_list) if i % 2 != 0]
    # print(f"user_vector: {user_vector_list}")
    others_vector_list = [feature for i, feature in enumerate(feature_list) if i % 2 == 0]
    # print(f"other_vector: {others_vector_list}")
    
    ## 벡터 결합
    user_combined_vectors = np.array([np.concatenate([user_df[col][i] for col in user_vector_list], axis=None) for i in range(len(user_df))], dtype=np.float32)
    others_combined_vectors = np.array([np.concatenate([others_df[col][i] for col in others_vector_list], axis=None) for i in range(len(others_df))], dtype=np.float32)
    
    ## 벡터 정규화
    faiss.normalize_L2(user_combined_vectors)
    faiss.normalize_L2(others_combined_vectors)

    ## FAISS 인덱스 생성
    index = faiss.IndexFlatL2(user_combined_vectors.shape[1])
    index.add(others_combined_vectors)
    
    ## 유사도 측정 - 최대 5개
    distances, indices = index.search(user_combined_vectors, k=5)#others_myMBTI_vectors, k=5)
    # similar_users = [others_combined_vectors[i] for i in indices[0]]
    # print("유사한 벡터:", similar_users)
    
    #### 주의!! 회원 수가 적어서 추천해줄 수 있는 인원이 적은 경우 indices 값에 "-1" 들어있을 수 있습니다.
    valid_indices = [i for i in indices[0] if i != -1]

    ## 최종결과 - 인덱스로 userUID 매핑
    similar_userUIDs = [others_df["userUID"][i] for i in valid_indices]
    # print("유사한 userUIDs:", similar_userUIDs)
    
    return similar_userUIDs
    # return None

## 임시로 유저UID 다음과 같이 지정
def main(userUID):
    try:
        recommend_result = process_data(userUID)
        print(f"추천된 사용자들: {recommend_result}")
    except Exception as e:
        print(f"오류: {e}")
    
if __name__ == "__main__":
    main("0175425703")
    # main("김시현") ## 존재하지 않는 userUID 테스트