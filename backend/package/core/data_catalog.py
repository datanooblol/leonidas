import duckdb
from typing import Optional
from pydantic import BaseModel
import pandas as pd

class AWSConfig(BaseModel):
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    region_name: Optional[str] = 'ap-southeast-1'
    aws_session_token: Optional[str] = None

class DataCatalog:
    def __init__(self, aws_configs:Optional[AWSConfig]=None):
        self._conn = duckdb.connect()
        self._tables = {}
        self._relationships = []  # Store table relationships
        if aws_configs:
            self._setup_s3(**self._validate_config(aws_configs))

    def _validate_config(self, aws_configs):
        """Validate and convert AWSConfig to dictionary"""
        if isinstance(aws_configs, AWSConfig):
            return aws_configs.model_dump()
        elif isinstance(aws_configs, dict):
            # Validate dict has required fields
            AWSConfig(**aws_configs)  # This will raise ValidationError if invalid
            return aws_configs
        else:
            raise TypeError("aws_configs must be AWSConfig instance or dict")

    def _setup_s3(self, aws_access_key_id=None, aws_secret_access_key=None, region_name='ap-southeast-1', aws_session_token=None):
        """Setup S3 connection using your existing logic"""

        self._conn.execute("INSTALL httpfs")
        self._conn.execute("LOAD httpfs")
        
        if aws_access_key_id and aws_secret_access_key:
            secret_sql = f"""
            CREATE OR REPLACE SECRET s3_secret (
                TYPE s3,
                PROVIDER config,
                KEY_ID '{aws_access_key_id}',
                SECRET '{aws_secret_access_key}',
                REGION '{region_name}'"""
            if aws_session_token:
                secret_sql += f",\n                SESSION_TOKEN '{aws_session_token}'"
            secret_sql += "\n            )"
            self._conn.execute(secret_sql)
        else:
            self._conn.execute("""
            CREATE OR REPLACE SECRET s3_secret (
                TYPE s3,
                PROVIDER credential_chain
            )""")

    def register(self, name: str, source, table_description: str = '', metadata=None):
        """Universal table creation method"""
        if isinstance(source, pd.DataFrame):
            # Pandas DataFrame
            self._conn.register(name, source)
            source_type = 'pandas'
            source_path = None
        
        elif isinstance(source, str):
            # File path (local or S3)
            if source.startswith('s3://'):
                if source.endswith('.parquet'):
                    self._conn.execute(f"CREATE TABLE '{name}' AS SELECT * FROM read_parquet('{source}')")
                    source_type = 's3_parquet'
                else:
                    self._conn.execute(f"CREATE TABLE '{name}' AS SELECT * FROM read_csv_auto('{source}')")
                    source_type = 's3_csv'
            else:
                # Local file
                self._conn.execute(f"CREATE TABLE '{name}' AS SELECT * FROM read_csv_auto('{source}')")
                source_type = 'local_csv'
            source_path = source
        
        else:
            raise ValueError(f"Unsupported source type: {type(source)}")
        
        self._tables[name] = {
            'type': source_type, 
            'path': source_path, 
            'table_description': table_description,
            'metadata': metadata
        }            
    
    def query(self, sql: str):
        return self._conn.execute(sql).df()