from flask import Flask
#from flask.ext.sqlalchemy import SQLAlchemy
import psycopg2
import os

app = Flask(__name__)
#app.config.from_object(os.environ['APP_SETTINGS'])

#app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/Faces'
#db = SQLAlchemy(app)

#establishing the connection
conn = psycopg2.connect(
    host="db",
    database="Faces",
    user="admin",
    password="datascience",
    port=5432)

#Creating a cursor object using the cursor() method
cursor = conn.cursor()

#Executing an MYSQL function using the execute() method
# let's create a table:
#cursor.execute("CREATE TABLE Faces (id integer NOT NULL, name text NOT NULL, path text NOT NULL);")

# and a row
#cursor.execute("INSERT INTO Faces (id,name,path) VALUES (2,'subject 1','subject01.glasses.gif');")

# Save changes to the database
#conn.commit()

# Let's get some data
cursor.execute("SELECT * FROM Faces")
data = cursor.fetchall() # (1, 'Elie', 'Schoppik')
print('test1')

@app.route("/")
def index():
    d = ''
    for i in data:
        for j in i:
            d += str(j) + '\n'
    return d
# Close database connection
cursor.close()
conn.close()

""" cursor.execute("SELECT * FROM Faces)")

# Fetch a single row using fetchone() method.
data = cursor.fetchone()
print("Faces: ",data)

#Closing the connection
conn.close() """

#make server reload with every code change
if __name__ == '__main__':
    #app.debug = True
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

