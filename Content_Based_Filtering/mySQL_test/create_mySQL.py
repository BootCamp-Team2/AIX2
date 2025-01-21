# Generating MySQL insert statements with updated conditions for favoriteAppearance (maximum 3 items) and 500 sample entries.

import random
import json

# Constants
gender_types = ["남성", "여성"]
mbti_types = [
    "INTJ", "INFP", "ENTP", "ESFP", "ISTJ", "ENFJ", "INFJ", "ISFP",
    "ENTJ", "ESFJ", "INTP", "ESTP", "ISFJ", "ESTJ", "ENFP", "INFP"
]
height_types = ["작음", "평균", "큼"]
appearance_types = [
    "귀여움", "매력적", "활기참", "미소", "단아함", 
    "청순함", "중성미", "카리스마", "스포티", "패션감각"
]
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

# Function to generate random user data
def generate_user_data():
    userUID = "".join([str(random.randint(0, 9)) for _ in range(10)])
    myGender = random.choice(gender_types)
    profileImg = "http://192.168.1.4:2000/assets/male_avatar.png" if myGender == "남성" else "http://192.168.1.4:2000/assets/female_avatar.png"
    recommendGender = "여성" if myGender == "남성" else "남성"
    myMBTI = random.choice(mbti_types)
    recommendMBTI = recommend_MBTI.get(myMBTI, "")
    myHeight = random.choice(height_types)
    favoriteHeight = random.choice(height_types)
    myAppearance = random.sample(appearance_types, random.randint(1, 3))
    favoriteAppearance = random.sample(appearance_types, random.randint(1, 3))
    return (
        userUID,
        profileImg,
        myGender,
        recommendGender,
        myMBTI,
        recommendMBTI,
        myHeight,
        favoriteHeight,
        myAppearance,
        favoriteAppearance,
    )

# Generate 500 user data entries
user_data = [generate_user_data() for _ in range(500)]

# Create MySQL INSERT statements
table_name = "idealTable"
columns = (
    "userUID",
    "profileImg",
    "myGender",
    "recommendGender",
    "myMBTI",
    "recommendMBTI",
    "myHeight",
    "favoriteHeight",
    "myAppearance",
    "favoriteAppearance",
)
insert_statements = [
    f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES "
    f"('{row[0]}', '{row[1]}', '{row[2]}', '{row[3]}', '{row[4]}', JSON_ARRAY({row[5]}), "
    f"'{row[6]}', '{row[7]}', JSON_ARRAY({row[8]}), JSON_ARRAY({row[9]}));"
    for row in user_data
]

# Save the SQL statements to a .txt file
output_file = "./mySQL_test/insert_idealTable_500_entries.sql"
with open(output_file, "w", encoding="utf-8") as file:
    file.write("\n".join(insert_statements))

output_file
