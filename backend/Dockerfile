FROM public.ecr.aws/lambda/python:3.12

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml ${LAMBDA_TASK_ROOT}

# Install dependencies to system Python
RUN uv pip install --system -e .

# Copy scripts and install DuckDB extensions
COPY backend_setup.py ${LAMBDA_TASK_ROOT}
RUN uv run backend_setup.py

# Copy application code
COPY package/ ${LAMBDA_TASK_ROOT}/package/
COPY main.py ${LAMBDA_TASK_ROOT}

CMD ["main.handler"]
