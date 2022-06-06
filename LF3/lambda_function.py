import os
import boto3


SearchHistoryTable = os.environ.get('SearchHistoryTable')
dynamodb = boto3.client('dynamodb')

VALID_METHODS = ["GET", "SEARCH"]


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

    if method == "SEARCH":
        query = params["q"]
        parsedParams["q"] = query
        if query == "":
            errors["q"] = "'q' can't be empty"

    return errors, parsedParams


def parse_item(item):
    title = item['q']['S']
    date = item['datetime']['S']
    image = item['img']['S']

    return {
        "title": title,
        "date": date,
        "image": image,
    }


def get_handler(uid):
    EMPTY = {
        'statusCode': 200,
        'body': {
            'items': []
        }
    }

    response = dynamodb.query(
        TableName=SearchHistoryTable,
        KeyConditionExpression='uid = :v1',
        ScanIndexForward=False,
        ExpressionAttributeValues={
            ':v1': {
                'S': uid
            }
        }
    )

    if "Items" not in response or len(response["Items"]) == 0:
        return EMPTY

    items = response["Items"]

    return {
        'statusCode': 200,
        'body': {
            "items": list(map(lambda item: parse_item(item), items))
        }
    }


def search_handler(uid, q):
    EMPTY = {
        'statusCode': 200,
        'body': {
            'items': []
        }
    }

    response = dynamodb.query(
        TableName=SearchHistoryTable,
        KeyConditionExpression='uid = :v1',
        ScanIndexForward=False,
        ExpressionAttributeValues={
            ':v1': {
                'S': uid
            }
        }
    )

    if "Items" not in response or len(response["Items"]) == 0:
        return EMPTY

    items = response["Items"]
    items = list(map(lambda item: parse_item(item), items))

    filtered_items = []
    for item in items:
        if q.lower() in item["title"].lower():
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
    if method == "SEARCH":
        query = parsedParams["q"]
        return search_handler(uid, query)

    return {
        'statusCode': 200,
        'body': "hi"
    }
