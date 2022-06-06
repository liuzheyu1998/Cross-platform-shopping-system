import requests
import os
import boto3
from bs4 import BeautifulSoup
from datetime import date


dynamodb = boto3.client('dynamodb')

PRODUCT_TABLE = os.environ.get('ProductTable')
PRODUCTHISTORY_TABLE = os.environ.get('PriceHistoryTable')


def get_price(url):
    response = requests.request("GET", url)
    soup = BeautifulSoup(response.text, features="html.parser")
    soup.prettify()
    if soup is None:
        return None
    price = soup.find(id="prcIsum")

    if price is not None and "content" in str(price):
        price = price["content"]
        return float(price)
    else:
        return None


def lambda_handler(event, context):
    response = dynamodb.scan(TableName=PRODUCT_TABLE)
    products = response["Items"]
    today = str(date.today())

    for product in products:
        retailer = product["retailer"]["S"]
        if retailer == "Ebay":
            url = product["link"]["S"]
            id = product["id"]["S"]

            price = get_price(url)
            if price is None:
                continue

            item_attr = {
                'pid': {
                    'S': id
                },
                'date': {
                    'S': today
                },
                'price': {
                    'N': str(price)
                }

            }

            dynamodb.put_item(TableName=PRODUCTHISTORY_TABLE, Item=item_attr)
            product["price"]["N"] = str(price)
            dynamodb.put_item(TableName=PRODUCT_TABLE, Item=product)

    return {
        'statusCode': 200,
        'body': "Hello"
    }

