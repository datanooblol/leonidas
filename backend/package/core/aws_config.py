from package.core.data_catalog import AWSConfig
import boto3

def get_aws_configs():
    session = boto3.Session()
    aws_configs = AWSConfig(
        aws_access_key_id=session.get_credentials().access_key,
        aws_secret_access_key=session.get_credentials().secret_key,
        region_name=session.region_name,)
    return aws_configs