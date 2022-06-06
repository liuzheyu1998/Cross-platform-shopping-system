import os
import boto3

VALID_METHODS = ["GET", "POST", "DELETE"]
dynamodb = boto3.client('dynamodb')

PRODUCT_TABLE = os.environ.get('ProductTable')
PRICE_HISTORY_TABLE = os.environ.get('PriceHistoryTable')


PRICES = {
    "2022-04-13": 1.23,
    "2022-04-14": 0.23,
    "2022-04-15": 3.23,
    "2022-04-16": 2.23,
    "2022-04-17": 1.32,
    "2022-04-18": 2.12,
    "2022-04-19": 1.23,
}


def validate(params):
    pid = params["pid"]

    errors = {}
    parsedParams = {
        "pid": pid
    }

    if pid == "":
        errors["pid"] = "'pid' can't be empty"

    return errors, parsedParams


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


def parse_prices(prices):
    price_by_date = {}

    for item in prices:
        date = item['date']['S']
        price = item['price']['N']

        price_by_date[date] = price

    return price_by_date


def get_product_detail(pid):
    response = dynamodb.get_item(
        TableName=PRODUCT_TABLE,
        Key={
            'id': {
                'S': pid
            }
        }
    )

    if "Item" not in response:
        return None

    return parse_item(response["Item"])


def get_price_histry(pid):
    response = dynamodb.query(
        TableName=PRICE_HISTORY_TABLE,
        KeyConditionExpression='pid = :v1',
        ExpressionAttributeValues={
            ':v1': {
                'S': pid
            }
        }
    )

    if "Items" not in response or len(response["Items"]) == 0:
        return {}

    prices = response["Items"]
    return parse_prices(prices)


def lambda_handler(event, context):
    errors, parsedParams = validate(event)
    if len(errors.keys()) > 0:
        return {
            'statusCode': 400,
            'errors': errors
        }

    pid = parsedParams["pid"]

    detail = get_product_detail(pid)
    prices = get_price_histry(pid)

    return {
        'statusCode': 200,
        'body': {
            'product': detail,
            'price_history': prices
        }
    }
