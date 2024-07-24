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

# Copy the initialization script
COPY init_db.sh /requirements/
# Grant execution permission to the script
RUN chmod +x /requirements/init_db.sh

# Start the server
CMD  /requirements/init_db.sh
