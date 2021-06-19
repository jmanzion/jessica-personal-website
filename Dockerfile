FROM python:3.9

RUN apt-get update &&\
    apt-get install -y git

COPY ./requirements.txt /app/requirements.txt

WORKDIR /app

CMD git clone https://github.com/jmanzion/jessica-personal-website.git

RUN pip install -r requirements.txt\
    pip install psycopg2\
    pip install python-dotenv\
    pip install gunicorn

COPY . /app

