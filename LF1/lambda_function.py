import requests
import os
import boto3
from datetime import datetime

ITEMS = [
    {"id": "1", "name": "Kitty 1", "image": "https://loremflickr.com/200/200",
        "price": "50.4", "link": "https://amazon.com/", "starred": True},
    {"id": "2", "name": "Kitty 2", "image": "https://loremflickr.com/200/200",
        "price": "20.4", "link": "https://amazon.com/", "starred": True},
    {"id": "3", "name": "Kitty 3", "image": "https://loremflickr.com/200/200",
        "price": "54.2", "link": "https://amazon.com/", "starred": True},
    {"id": "4", "name": "Kitty 4", "image": "https://loremflickr.com/200/200",
        "price": "50.6", "link": "https://amazon.com/", "starred": True},
    {"id": "5", "name": "Kitty 5", "image": "https://loremflickr.com/200/200",
        "price": "35.09", "link": "https://amazon.com/", "starred": True},
    {"id": "6", "name": "Kitty 1", "image": "https://loremflickr.com/200/200",
        "price": "50.4", "link": "https://amazon.com/", "starred": True},
    {"id": "7", "name": "Kitty 2", "image": "https://loremflickr.com/200/200",
        "price": "20.4", "link": "https://amazon.com/", "starred": True},
    {"id": "8", "name": "Kitty 3", "image": "https://loremflickr.com/200/200",
        "price": "54.2", "link": "https://amazon.com/", "starred": True},
    {"id": "9", "name": "Kitty 4", "image": "https://loremflickr.com/200/200",
        "price": "50.6", "link": "https://amazon.com/", "starred": True},
    {"id": "10", "name": "Kitty 5", "image": "https://loremflickr.com/200/200",
        "price": "35.09", "link": "https://amazon.com/", "starred": True},
    {"id": "11", "name": "Kitty 1", "image": "https://loremflickr.com/200/200",
        "price": "50.4", "link": "https://amazon.com/", "starred": True},
    {"id": "12", "name": "Kitty 2", "image": "https://loremflickr.com/200/200",
        "price": "20.4", "link": "https://amazon.com/", "starred": True},
    {"id": "13", "name": "Kitty 3", "image": "https://loremflickr.com/200/200",
        "price": "54.2", "link": "https://amazon.com/", "starred": True},
    {"id": "14", "name": "Kitty 4", "image": "https://loremflickr.com/200/200",
        "price": "50.6", "link": "https://amazon.com/", "starred": False},
    {"id": "15", "name": "Kitty 5", "image": "https://loremflickr.com/200/200",
        "price": "35.09", "link": "https://amazon.com/", "starred": False},
    {"id": "16", "name": "Kitty 1", "image": "https://loremflickr.com/200/200",
        "price": "50.4", "link": "https://amazon.com/", "starred": False},
    {"id": "17", "name": "Kitty 2", "image": "https://loremflickr.com/200/200",
        "price": "20.4", "link": "https://amazon.com/", "starred": False},
    {"id": "18", "name": "Kitty 3", "image": "https://loremflickr.com/200/200",
        "price": "54.2", "link": "https://amazon.com/", "starred": False},
    {"id": "19", "name": "Kitty 4", "image": "https://loremflickr.com/200/200",
        "price": "50.6", "link": "https://amazon.com/", "starred": False},
    {"id": "20", "name": "Kitty 5", "image": "https://loremflickr.com/200/200",
        "price": "35.09", "link": "https://amazon.com/", "starred": False},
]

dynamodb = boto3.client('dynamodb')
WISHLIST_TABLE = os.environ.get('WishlistTable')
SearchHistoryTable = os.environ.get('SearchHistoryTable')


VALID_SORTBY = ['price', 'relevance']
ITEM_COUNT = 50


def get_id_from_link(link):
    # NOTE: make sure this method stays the same in LF1
    LINK_TO_ID = {
        "https://": "",
        "/": "-",
        "?": "@"
    }

    for key, value in LINK_TO_ID.items():
        link = link.replace(key, value)
    return link


def validate(params):
    q = params['q']
    sort_by = params['sort_by']
    parsedParams = {
        "q": q,
        "sort_by": "price"
    }

    errors = {}

    if q == "":
        errors["q"] = "'q' can't be empty"
    if sort_by != "":
        if sort_by not in VALID_SORTBY:
            errors["sort_by"] = f"'sort_by' must be one of {VALID_SORTBY}"
        else:
            parsedParams["sort_by"] = sort_by

    parsedParams["uid"] = params['uid'] if "uid" in params else ""
    parsedParams["img"] = params['img'] if "img" in params else ""

    return errors, parsedParams


# Unlimited calls per mo
def ebay_call(query, wishlist_items):
    """
    Ebay external API call
    Para: query:string
    Return: list of item
        Each item is dict with keys: id(start from idx 1), name, price, image, link
        item example
        {
          "id": 248,
          "name": "NVIDIA Tesla K80 GDDR5 24GB CUDA PCI-e GPU Accelerator Mining &amp; Deep Learning U",
          "price": "$378.31",
          "image": "https://ir.ebaystatic.com/cr/v/c1/s_1x2.gif",
          "link": "https://www.ebay.com/itm/114815577976?hash=item1abb8aaf78:g:2nQAAOSwnd1gpMYc"
        }
    Latency: 4,193ms
    Pricing: $5.00/mo; Unlimited
    """
    url = "https://ebay-product-search-scraper.p.rapidapi.com/index.php"
    query = query.replace(" ", "%20")
    querystring = {"query": query, "page": "1", "Item_Location": "us_only"}
    headers = {
        "X-RapidAPI-Host": "ebay-product-search-scraper.p.rapidapi.com",
        "X-RapidAPI-Key": os.environ.get('RapidAPIKey')
    }
    response = requests.request(
        "GET", url, headers=headers, params=querystring)
    response = response.json()

    # If nothing available
    if response is None:
        return []

    def parse_item(item):
        # remove $ from price
        price = item["price"]
        if "to" in price:
            price = price.split("to")[0][1:].strip()
        else:
            price = price[1:]

        id = get_id_from_link(item["link"])
        return {
            "id": id,
            "image": item["image"],
            "link": item["link"].split('?')[0],
            "name": item["name"],
            "price": price,
            "retailer": "Ebay",
            "starred": id in wishlist_items
        }

    # NOTE: the first item in the products list is not valid
    return list(map(lambda i: parse_item(i), response['products'][1:1+ITEM_COUNT]))


# IMPORTANT only 200 calls per mo is free!!!
def amazon_call(query, wishlist_items):
    """
    Amazon external API call
    Para: query:string
    External Call response: list of items
        item example
        {
            "isBestSeller": true,
            "product_title": "AMD Ryzen 9 5900X 12-core, 24-Thread Unlocked Desktop Processor",
            "product_main_image_url": "https://m.media-amazon.com/images/I/616VM20+AzL._AC_UY218_.jpg",
            "app_sale_price": "384.10",
            "app_sale_price_currency": "$",
            "isPrime": true,
            "product_detail_url": "https://www.amazon.com/dp/B08164VTWH",
            "product_id": "B08164VTWH",
            "evaluate_rate": "4.8 out of 5 stars",
            "original_price": "$569.99"
        }
    Latency: 8,198ms
    Pricing: $0.00/mo; 200/mo; Hard Limit
    """
    url = "https://amazon24.p.rapidapi.com/api/product"
    # Optional: "categoryID":"aps"
    querystring = {"keyword": query, "country": "US", "page": "1"}
    headers = {
        "X-RapidAPI-Host": "amazon24.p.rapidapi.com",
        "X-RapidAPI-Key": os.environ.get('RapidAPIKey')
    }
    response = requests.request(
        "GET", url, headers=headers, params=querystring)

    response = response.json()

    if not response['docs']:
        return []

    items = []
    for idx, item in enumerate(response['docs'][:ITEM_COUNT]):
        items.append({
            "id": idx+1,  # start with 1?
            "name": item['product_title'],
            "image": item['product_main_image_url'],
            "price": item['app_sale_price'],
            "link": item['product_detail_url'],
            "starred": "False"
        })

    return items


def shopee_call(query, wishlist_items):
    """
    Shopee external API call
    Para: query:string
    Return: list of items
    Latency: 1,641ms
    Pricing: $9.00/mo; 10,000/mo; +$0.001 if exceed limit
    """
    url = "https://shopee.p.rapidapi.com/shopee.sg/search"

    # Don't replace space to %20 here
    querystring = {"keyword": query}

    headers = {
        "X-RapidAPI-Host": "shopee.p.rapidapi.com",
        "X-RapidAPI-Key": os.environ.get('RapidAPIKey')
    }

    response = requests.request(
        "GET", url, headers=headers, params=querystring)

    response = response.json()

    if not response['data']['items']:
        return []

    def parse_item(item):
        link = f"https://shopee.sg/product/{item['shop_id']}/{item['item_id']}"
        id = get_id_from_link(link)

        return {
            "id": id,
            "image": item["image"],
            "link": link,
            "name": item["name"],
            "price": str(item["price_min"]),
            "retailer": "Shopee",
            "starred": id in wishlist_items
        }

    return list(map(lambda i: parse_item(i), response['data']['items'][:ITEM_COUNT]))


def taobao_call(query, wishlist_items):
    """
    Taobao external API call
    Para: query:string
    Return: list of items
    Latency: 481ms
    Pricing: $20.00/mo; 2,000/day; +$0.008 if exceed limit
    """
    url = "https://taobao-api.p.rapidapi.com/api"

    querystring = {"api": "item_search", "page_size": "40", "q": query}

    headers = {
        "X-RapidAPI-Host": "taobao-api.p.rapidapi.com",
        "X-RapidAPI-Key": os.environ.get('RapidAPIKey')
    }

    response = requests.request(
        "GET", url, headers=headers, params=querystring)

    response = response.json()

    if response['result']['status']['msg'] == 'error':
        return []

    def parse_item(item):
        link = f"https:{item['detail_url']}"
        id = get_id_from_link(link)

        return {
            "id": id,
            "image": f"https:{item['pic']}",
            "link": link,
            "name": item['title'],
            "price": item['price'],
            "retailer": "Alibaba",
            "starred": id in wishlist_items
        }

    return list(map(lambda i: parse_item(i), response['result']['item'][:ITEM_COUNT]))


def lambda_handler(event, context):
    errors, parsedParams = validate(event)
    if len(errors.keys()) > 0:
        return {
            'statusCode': 400,
            'errors': errors
        }

    # Parameters
    q = parsedParams['q']
    sortBy = parsedParams['sort_by']
    uid = parsedParams['uid']
    img = parsedParams['img']

    # gather user's wishlisted items
    wishlist_items = set()
    if uid != "":
        response = dynamodb.query(
            TableName=WISHLIST_TABLE,
            KeyConditionExpression='uid = :v1',
            ExpressionAttributeValues={
                ':v1': {
                    'S': uid
                }
            }
        )

        if "Items" in response and len(response["Items"]) > 0:
            wishlist_items = set(
                map(lambda item: item['pid']['S'], response["Items"]))

    # External API call
    ebay_items = amazon_items = shopee_items = alibaba_items = ITEMS

    # Ebay: Unlimited/mo
    ebay_items = ebay_call(q, wishlist_items)
    # Amazon: 200/mo for now
    # amazon_items = amazon_call(q)
    # Shopee: 10,000/mo
    shopee_items = shopee_call(q, wishlist_items)
    # Taobao: 2,000/day
    alibaba_items = taobao_call(q, wishlist_items)

    # Add query to user search hist db
    if uid != "":
        dynamodb.put_item(
            TableName=SearchHistoryTable,
            Item={
                'uid': {
                    'S': uid
                },
                'datetime': {
                    'S': str(datetime.now())
                },
                'q': {
                    'S': q
                },
                'img': {
                    'S': img
                }
            }
        )

    return {
        'statusCode': 200,
        'body': {
            "wishlist_items": list(wishlist_items),
            "q": q,
            "sort_by": sortBy,
            "count": len(ITEMS),
            "items": {
                "Amazon": amazon_items,
                "Ebay": ebay_items,
                "Alibaba": alibaba_items,
                "Shopee": shopee_items
            }
        }
    }
