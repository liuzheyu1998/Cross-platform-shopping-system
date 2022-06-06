"""
Interaction with the wishlist table
"""

import os
import boto3
from datetime import datetime

VALID_METHODS = ["GET", "POST", "DELETE", "SEARCH"]
dynamodb = boto3.client('dynamodb')

WISHLIST_TABLE = os.environ.get('WishlistTable')
PRODUCT_TABLE = os.environ.get('ProductTable')


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


def parse_item(item):
    created = item['created']['S']
    image = item['image']['S']
    link = item['link']['S']
    name = item['name']['S']
    price = item['price']['N']
    retailer = item['retailer']['S']
    id = item['id']['S']

    return {
        "id": id,
        "created": created,
        "image": image,
        "link": link,
        "name": name,
        "price": price,
        "retailer": retailer,
    }


def validate(params):
    uid = params["uid"]
    method = params["method"]

    errors = {}
    parsedParams = {
        "uid": uid,
        "method": method,
    }

    if method not in VALID_METHODS:
        errors["method"] = f"'method' must be one of {VALID_METHODS}"
    if uid == "":
        errors["uid"] = "'uid' can't be empty"

    if method == "POST":
        item = params["item"]
        parsedParams["item"] = item
        # TODO: body error validation

    if method == "DELETE":
        pid = params["pid"]
        parsedParams["pid"] = pid
        if pid == "":
            errors["pid"] = "'pid' can't be empty"

    if method == "SEARCH":
        query = params["q"]
        parsedParams["q"] = query
        if query == "":
            errors["q"] = "'q' can't be empty"

    return errors, parsedParams


def get_handler(uid):
    EMPTY = {
        'statusCode': 200,
        'body': {
            'items': []
        }
    }
    # Find products in user's wishlist
    response = dynamodb.query(
        TableName=WISHLIST_TABLE,
        KeyConditionExpression='uid = :v1',
        ExpressionAttributeValues={
            ':v1': {
                'S': uid
            }
        }
    )

    if "Items" not in response or len(response["Items"]) == 0:
        return EMPTY

    # Get details of all products from product table
    items = response["Items"]
    keys = list(map(lambda item: {'id': {'S': item['pid']['S']}}, items))

    response = dynamodb.batch_get_item(
        RequestItems={
            PRODUCT_TABLE: {
                'Keys': keys
            }
        }
    )

    response = response['Responses']

    if PRODUCT_TABLE not in response:
        return EMPTY

    items = response[PRODUCT_TABLE]

    return {
        'statusCode': 200,
        'body': {
            "uid": uid,
            "items": list(map(lambda item: parse_item(item), items))
        }
    }


def post_handler(uid, product):
    image = product["image"]
    link = product["link"]
    name = product["name"]
    price = product["price"]
    retailer = product["retailer"]
    id = get_id_from_link(link)

    # Make sure product is in Product Table. If not, create it
    response = dynamodb.get_item(
        TableName=PRODUCT_TABLE,
        Key={
            'id': {
                'S': id
            }
        }
    )

    if "Item" not in response:
        dynamodb.put_item(
            TableName=PRODUCT_TABLE,
            Item={
                'id': {
                    'S': id
                },
                'name': {
                    'S': name
                },
                'price': {
                    'N': price
                },
                'link': {
                    'S': link
                },
                'image': {
                    'S': image
                },
                'retailer': {
                    'S': retailer
                },
                'created': {
                    'S': str(datetime.now())
                }
            }
        )

    response = dynamodb.query(
        TableName=WISHLIST_TABLE,
        KeyConditionExpression='uid = :v1 AND pid = :v2',
        ExpressionAttributeValues={
            ':v1': {
                'S': uid
            },
            ':v2': {
                'S': id
            }
        }
    )

    if "Item" in response:
        return {
            'statusCode': 400,
            'error': "Product is already in user's wishlist."
        }

    dynamodb.put_item(
        TableName=WISHLIST_TABLE,
        Item={
            'uid': {
                'S': uid
            },
            'pid': {
                'S': id
            },
            'created': {
                'S': str(datetime.now())
            }
        }
    )

    return {
        'statusCode': 200,
        'body': {
            "item": product
        }
    }


def delete_handler(uid, pid):
    dynamodb.delete_item(
        TableName=WISHLIST_TABLE,
        Key={
            'uid': {
                'S': uid
            },
            'pid': {
                'S': pid
            }
        }
    )

    return {
        'statusCode': 200,
        'body': {
            "uid": uid,
            "pid": pid,
            "item": {}
        }
    }


def search_handler(uid, query):
    EMPTY = {
        'statusCode': 200,
        'body': {
            'items': []
        }
    }
    # Find products in user's wishlist
    response = dynamodb.query(
        TableName=WISHLIST_TABLE,
        KeyConditionExpression='uid = :v1',
        ExpressionAttributeValues={
            ':v1': {
                'S': uid
            }
        }
    )

    if "Items" not in response or len(response["Items"]) == 0:
        return EMPTY

    # Get details of all products from product table
    items = response["Items"]
    keys = list(map(lambda item: {'id': {'S': item['pid']['S']}}, items))

    response = dynamodb.batch_get_item(
        RequestItems={
            PRODUCT_TABLE: {
                'Keys': keys
            }
        }
    )

    response = response['Responses']

    if PRODUCT_TABLE not in response:
        return EMPTY

    items = response[PRODUCT_TABLE]
    items = list(map(lambda item: parse_item(item), items))
    filtered_items = []
    for item in items:
        if query.lower() in item["name"].lower():
            filtered_items.append(item)

    if not filtered_items:
        return EMPTY

    return {
        'statusCode': 200,
        'body': {
            "items": filtered_items
        }
    }


def lambda_handler(event, context):
    errors, parsedParams = validate(event)
    if len(errors.keys()) > 0:
        return {
            'statusCode': 400,
            'errors': errors
        }

    uid = parsedParams["uid"]
    method = parsedParams["method"]

    if method == "GET":
        return get_handler(uid)
    if method == "POST":
        product = parsedParams["item"]
        return post_handler(uid, product)
    if method == "DELETE":
        pid = parsedParams["pid"]
        return delete_handler(uid, pid)
    if method == "SEARCH":
        query = parsedParams["q"]
        return search_handler(uid, query)

    return {
        'statusCode': 200,
        'body': "hi"
    }
