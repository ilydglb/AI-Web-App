import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.metrics.pairwise import cosine_similarity

connection_string = "mongodb+srv://ilayd:1234@cluster0.zhwkig0.mongodb.net/"

client = MongoClient(connection_string)
db = client['bm314']
posts = db['posts']
data = []

for post in posts.find():
    post_id = post["_id"]
    title = post["title"]
    content = post["content"]
    posted_by = post["postedBy"]


    for rating in post["ratings"]:
        rating_value = rating["rating"]
        username = rating["username"]
        data.append({"_id": post_id, "rating": rating_value, "username": username})


df = pd.DataFrame(data)
print(df) 

agg_ratings = df.groupby('_id').agg(mean_rating = ('rating', 'mean'),
number_of_ratings = ('rating', 'count')).reset_index()

agg_ratings_GT100 = agg_ratings[agg_ratings['number_of_ratings']>0]
agg_ratings_GT100.info()

agg_ratings_GT100.sort_values(by='number_of_ratings', ascending=False).head()
df_GT100 = pd.merge(df, agg_ratings_GT100[['_id']], on='_id', how='inner')
df_GT100.head()

matrix = df_GT100.pivot_table(index='username', columns='_id', values='rating')
matrix.head()

matrix_norm = matrix.subtract(matrix.mean(axis=1), axis = 'rows')
matrix_norm.head()

user_similarity = matrix_norm.T.corr()
user_similarity.head()

user_similarity_cosine = cosine_similarity(matrix_norm.fillna(0))
user_similarity_cosine

picked_username= "user_1"
user_similarity.drop(index=picked_username, inplace=True)
user_similarity.head()

n=10
user_similarity_threshold = 0.002
similar_users = user_similarity[user_similarity[picked_username]>user_similarity_threshold][picked_username].sort_values(ascending=False)[:n]
print(f'The similar users for user {picked_username} are', similar_users)

