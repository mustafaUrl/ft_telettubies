FROM python:3.8-slim

# Create working directory
RUN mkdir /code
WORKDIR /code

# Install dependencies
COPY requirements.txt /code/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Install PostgreSQL client and netcat
RUN apt-get update && apt-get install -y postgresql-client netcat-openbsd

# Copy project files
COPY teletubbies/ /code/

# Copy initialization scripts
COPY init_db.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init_db.sh

# Start the server
CMD ["sh", "/docker-entrypoint-initdb.d/init_db.sh"]
