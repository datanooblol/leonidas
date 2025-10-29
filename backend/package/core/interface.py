from pydantic import BaseModel, Field
from typing import List, Optional, Any
from enum import Enum

class InputType(str, Enum):
    ID = "ID"
    INPUT = "INPUT"
    REJECT = "REJECT"

class FieldDetail(BaseModel):
    column:str
    dtype:str
    input_type:InputType = Field(default=InputType.INPUT)
    description:Optional[str] = Field(default=None)
    summary:Optional[Any] = Field(default=None)

class FileMetadata(BaseModel):
    file_id:Optional[str] = Field(default=None)
    name:str
    description:str = Field(default=None)
    columns:List[FieldDetail]

    @classmethod
    def from_dataframe(cls, name, description, df, file_id=None):
        columns = []
        for row in df.to_dict(orient="records"):
            columns.append(FieldDetail(column=row['column_name'], dtype=row['column_type']))
        return cls(file_id=file_id, name=name, description=description, columns=columns)
    
    def prompt(self):
        prompt = [
            f"TABLE: {self.name}",
            f"DESCRIPTION: {self.description}",
            "COLUMNS:",
        ]
        for f in self.columns:
            if f.input_type != "REJECT":
                p = f"- {f.column} ({f.dtype})"
                if f.description:
                    p += f": {f.description}"
                prompt.append(p)
        return "\n".join(prompt)
