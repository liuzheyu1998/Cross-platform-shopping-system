# Complaza Backend Stack

## Backend Resources

### Lambda functions
- LF0: Call ML endpoint to return product names
- LF1: Call 3rd party APIs to fullfil search and save to user's search history
- LF2: Interaction with the wishlist table
- LF3: Return search history
- LF4: Get price and update price history
- LF5: Get product details and price history

### Databases
Table Name | Hash Key | Range Key | Other Fields
--- | --- | --- | ---
SearchHistoryTable | uid | datetime | imgKey, q
ProductTable | id | created | image, link, name, price, retailer
WishlistTable | uid | pid | created
PriceHistoryTable | pid | date | price

### API gateway
Endpoint  | Description | Lambda Fn | Auth
--- | --- | --- | --- 
GET /image/{key} | get the keyword associated with the image by `key` in S3 | LF0 | No
GET /product/{pid} | get the product detail and price history by `pid` | LF5 | No
GET /search?{q, image, sort_by, uid} | search by provided keyword `q`, add to search history if `uid` exists | LF1 | Depends
GET /history/{uid} | gets all the search history of a user by `uid` | LF3 | Yes
GET /search/history/{uid}?q={q} | search in the search history of a user by `uid` matching `q` | LF3 | Yes
GET /wishlist/{uid} | gets all products from a user's wishlist by `uid` | LF2 | Yes
GET /search/wishlist/{uid}?q={q} | search in the wishlist of a user by `uid` matching `q` | LF2 | Yes
POST /wishlist/{uid} | adds a product to a user's wishlist | LF2 | Yes
DELETE /wishlist/{uid}/{pid} | delete a product from a user's wishlist | LF2 | Yes

### CodePipeline (CI/CD)
[code-pipeline-template.yaml](code-pipeline-template.yaml) is a Cloudformation template that sets up the code pipeline.

### OpenSearch
### SageMaker (ML model)

## Cloudformation Template
[template.yaml](template.yaml) is a Cloudformation template that creates/updates all AWS resources needed in this project.
### Input
- `UserPoolIdentifier`: Cognito
- `ImgBucket`: S3 bucket storing the search image
- `PredictEndPoint`: predict search image keywords
- `OpensearchEndPoint`: search product name with the image keywords
- `RapidAPIKey`: External API key

### Output
- `ApiUrl`: API Gateway endpoint

### Structure
<img width="993" alt="resources" src="https://user-images.githubusercontent.com/49623311/164880659-f330aab4-5ede-4293-9fc5-d6b182a3ce97.png">
