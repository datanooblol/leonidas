# FROM public.ecr.aws/lambda/python:3.12

# # Install uv
# RUN pip install uv

# # Copy dependency files
# COPY pyproject.toml ${LAMBDA_TASK_ROOT}

# # Install dependencies to system Python
# RUN uv pip install --system -e .

# # Copy scripts and install DuckDB extensions
# COPY backend_setup.py ${LAMBDA_TASK_ROOT}
# RUN uv run backend_setup.py

# # Copy application code
# COPY package/ ${LAMBDA_TASK_ROOT}/package/
# COPY main.py ${LAMBDA_TASK_ROOT}

# CMD ["main.handler"]

# Build stage
FROM public.ecr.aws/lambda/python:3.12 AS builder

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml .

# Install dependencies to a virtual environment
RUN uv venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN uv pip install -e .

# Copy and run setup script
COPY backend_setup.py .
RUN uv run backend_setup.py

# Runtime stage
FROM public.ecr.aws/lambda/python:3.12

# Copy only the virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY package/ ${LAMBDA_TASK_ROOT}/package/
COPY main.py ${LAMBDA_TASK_ROOT}

CMD ["main.handler"]
