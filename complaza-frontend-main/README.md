
## Development
1. Make sure you have `node`, `npm`, `yarn` installed
2. In the root directory, run `yarn install`
3. Install `AWS` CLI if extra Amplify modules are needed

## Library
1. Next.js
2. React.js
3. AWS Amplify
   1. Auth
   2. Hosting
   3. Storage (S3)
   4. Cognito
4. Styled Component
5. Ant Design
6. Chart.js

## Routes

Route | Params | Detail | Auth
--- | --- | --- | ---
/ | | search products by keywords or images | No 
/result | q, image | show search results | No
/wishlist | | show products on user's wishlist | Yes
/history | | show current user's search history | Yes
/product/[id] | | show product details and price history | No
/signup | | sign up | No
/confirm | showHints, email | confirm sign up | No
/login | | log in | No