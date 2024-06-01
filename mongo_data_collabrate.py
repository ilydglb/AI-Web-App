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



picked_username_viewed = matrix_norm[matrix_norm.index == picked_username].dropna(axis=1, how='all')
picked_username_viewed 
similar_user_posts = matrix_norm[matrix_norm.index.isin(similar_users.index)].dropna(axis=1, how='all')
similar_user_posts .drop(picked_username_viewed .columns,axis=1, inplace=True, errors='ignore')

item_score = {}


for i in similar_user_posts .columns:

  post_rating= similar_user_posts[i]

  total = 0
 
  count = 0

  for u in similar_users.index:

    if pd.isna(post_rating[u]) == False:

      score = similar_users[u] * post_rating[u]

      total += score

      count +=1

  item_score[i] = total / count


item_score = pd.DataFrame(item_score.items(), columns=['post', 'score'])

ranked_item_score = item_score.sort_values(by='score', ascending=False)

m = 10
ranked_item_score.head(m)

avg_rating = matrix[matrix.index == picked_username].T.mean()[picked_username]

print(f'The average post rating for user {picked_username} is {avg_rating:.2f}')

ranked_item_score['predicted_rating'] = ranked_item_score['score'] + avg_rating


print(ranked_item_score.head(m))