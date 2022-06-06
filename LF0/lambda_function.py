import json
import os
import boto3

from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth

import spacy
from string import punctuation
from collections import Counter


def init_search():
    '''
    Initialize opensearch
    '''
    host = os.environ['OpensearchEndPoint']
    region = 'us-east-1'
    service = 'es'
    credentials = boto3.Session().get_credentials()
    awsauth = AWS4Auth(credentials.access_key, credentials.secret_key,
                       region, service, session_token=credentials.token)

    search = OpenSearch(
        hosts=[{'host': host, 'port': 443}],
        http_auth=awsauth,
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection
    )
    return search

# Klayers-python38-spacy layer deprecated 2022-08-04T04:59:13


def extract_keywords(text):
    '''
    Extract Proper NOUN, Adjective, NOUN from given text (matched titles combined)
    Return: a list of 5 most frequent words
    '''
    pos_tag = ['PROPN', 'ADJ', 'NOUN']
    nlp = spacy.load(
        "/opt/en_core_web_sm-2.2.5/en_core_web_sm/en_core_web_sm-2.2.5")
    doc = nlp(text.lower())

    result = []
    for token in doc:
        if(token.text in nlp.Defaults.stop_words or token.text in punctuation):
            continue
        if(token.pos_ in pos_tag):
            result.append(token.text)

    result = [x[0] for x in Counter(result).most_common(5)]
    print('Extract keywords', result)
    return result


def lambda_handler(event, context):
    # Parameters
    IMG_BUCKET = os.environ.get('ImgBucket')
    img_key = f"public/{event['key']}"

    runtime = boto3.client('runtime.sagemaker')
    payload = json.dumps({'bucket': IMG_BUCKET, 'key': img_key})
    response = runtime.invoke_endpoint(EndpointName=os.environ['PredictEndPoint'],
                                       ContentType='application/json',
                                       Body=payload)
    response = json.loads(response['Body'].read().decode())

    # Openseach k-NN to get a list of title of matching img
    search = init_search()
    num_match = 3
    query = {
        'size': num_match,
        'query': {
            'knn': {
                'image-embedding': {
                    'vector': response[0],
                    'k': num_match
                }
            }
        }
    }
    response = search.search(
        body=query,
        index='embedding'
    )
    results = response['hits']['hits']

    # Check first title confidence
    result = results[0]
    title = result['_source']['title'] if result['_score'] > 0.5 else ""

    return {
        'statusCode': 200,
        # return the first title
        'body': {
            'title': title
        }
    }
